<?php

namespace App\Services;

use Soneso\StellarSDK\StellarSDK;
use Soneso\StellarSDK\Soroban\SorobanServer;
use Soneso\StellarSDK\Xdr\XdrSCAddress;
use Soneso\StellarSDK\Xdr\XdrSCAddressType;
use Soneso\StellarSDK\Xdr\XdrAccountID;
use Soneso\StellarSDK\Xdr\XdrSCVal;
use Soneso\StellarSDK\Xdr\XdrInt128Parts;
use Soneso\StellarSDK\Soroban\InvokeContractHostFunction;
use Soneso\StellarSDK\InvokeHostFunctionOperation;
use Soneso\StellarSDK\TransactionBuilder;
use Soneso\StellarSDK\Network;
use Soneso\StellarSDK\Crypto\KeyPair;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class RemitteaseContractInterface
{
    protected SorobanServer $sorobanServer;
    protected string $contractId;
    protected KeyPair $adminKeypair;
    protected StellarSDK $sdk;

    public function __construct(string $contractId)
    {
        $network = config('stellar.network', 'testnet');

        if ($network === 'testnet') {
            $this->sdk  = StellarSDK::getTestNetInstance();
            $rpcUrl      = 'https://soroban-testnet.stellar.org';
        } else {
            $this->sdk  = StellarSDK::getPublicNetInstance();
            $rpcUrl      = 'https://soroban.stellar.org';
        }

        $this->sorobanServer = new SorobanServer($rpcUrl);
        $this->contractId    = $contractId;
        $this->initializeAdminKeypair();
    }

    protected function initializeAdminKeypair(): void
    {
        $secret = config('stellar.admin_secret');

        if (empty($secret) && app()->environment('local', 'testing')) {
            $kp = KeyPair::random();
            config(['stellar.admin_secret' => $kp->getSecretSeed()]);
            $this->adminKeypair = $kp;
            Log::info("Generated testing keypair: {$kp->getAccountId()}");
            return;
        }

        if (empty($secret)) {
            throw new \Exception("Admin secret key not found in config");
        }

        try {
            $this->adminKeypair = KeyPair::fromSeed($secret);
            Log::info("Initialized admin keypair: {$this->adminKeypair->getAccountId()}");
        } catch (\Exception $e) {
            Log::error("KeyPair init error: " . $e->getMessage());
            throw new \Exception("Invalid admin secret key");
        }
    }

    public function fundTestAccount(string $publicKey): bool
    {
        if (config('stellar.network') !== 'testnet') {
            throw new \Exception("Friendbot funding only on testnet");
        }

        try {
            $resp = (new Client())->get("https://friendbot.stellar.org?addr={$publicKey}");
            if ($resp->getStatusCode() === 200) {
                Log::info("Funded test account: {$publicKey}");
                return true;
            }
        } catch (\Exception $e) {
            Log::error("Friendbot error: " . $e->getMessage());
        }

        return false;
    }

    public function registerWallet(string $publicKey, int $userId): array
    {
        if (config('stellar.network') === 'testnet') {
            $this->fundTestAccount($publicKey);
        }

        $adminPk = $this->adminKeypair->getAccountId();
        $account = $this->sdk->accounts()->account($adminPk);
        $txb     = new TransactionBuilder($account);

        // Prepare address argument
        $addrType   = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
        $scAddress  = new XdrSCAddress($addrType);
        $scAddress->setAccountId(new XdrAccountID($publicKey));
        $addressVal = XdrSCVal::forAddress($scAddress);

        // Prepare userId argument
        $userIdVal  = XdrSCVal::forU32($userId);

        $hostFn = new InvokeContractHostFunction(
            $this->contractId,
            'register_wallet',
            [$addressVal, $userIdVal]
        );
        $op     = new InvokeHostFunctionOperation($hostFn);

        $tx = $txb->addOperation($op)->build();
        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            $code = $resp->getExtras()->getResultCodes()->getOperationResultCodes()[0] ?? 'UNKNOWN';
            throw new \Exception("register_wallet failed: {$code}");
        }

        return [
            'success'       => true,
            'user_id'       => $userId,
            'public_key'    => $publicKey,
            'transaction_hash' => $resp->getHash(),
        ];
    }

    public function getWalletDetails(string $publicKey): ?array
    {
        $adminPk    = $this->adminKeypair->getAccountId();
        $account    = $this->sdk->accounts()->account($adminPk);
        $txb        = new TransactionBuilder($account);

        $addrType   = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
        $scAddress  = new XdrSCAddress($addrType);
        $scAddress->setAccountId(new XdrAccountID($publicKey));
        $addressVal = XdrSCVal::forAddress($scAddress);

        $hostFn = new InvokeContractHostFunction(
            $this->contractId,
            'get_wallet',
            [$addressVal]
        );
        $op     = new InvokeHostFunctionOperation($hostFn);
        $tx     = $txb->addOperation($op)->build();

        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            return null;
        }

        $txHash = $resp->getHash();
        $data   = $this->sorobanServer->getTransaction($txHash);
        if ($data->getStatus() !== 'SUCCESS') {
            return null;
        }

        // TODO: parse result XDR into meaningful fields
        return [
            'public_key' => $publicKey,
            'status'     => 'active',
            'created_at' => now()->toDateTimeString(),
        ];
    }

    public function verifyWallet(string $publicKey): array
    {
        $adminPk    = $this->adminKeypair->getAccountId();
        $account    = $this->sdk->accounts()->account($adminPk);
        $txb        = new TransactionBuilder($account);

        $addrType   = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
        $scAddress  = new XdrSCAddress($addrType);
        $scAddress->setAccountId(new XdrAccountID($publicKey));
        $addressVal = XdrSCVal::forAddress($scAddress);

        $hostFn = new InvokeContractHostFunction(
            $this->contractId,
            'verify_wallet',
            [$addressVal]
        );
        $op     = new InvokeHostFunctionOperation($hostFn);
        $tx     = $txb->addOperation($op)->build();

        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            $code = $resp->getExtras()->getResultCodes()->getOperationResultCodes()[0] ?? 'UNKNOWN';
            throw new \Exception("verify_wallet failed: {$code}");
        }

        return [
            'success'          => true,
            'public_key'       => $publicKey,
            'transaction_hash' => $resp->getHash(),
        ];
    }

    public function recordTransaction(string $fromWallet, string $toWallet, string $amount, string $memo = 'payment'): array
    {
        $adminPk    = $this->adminKeypair->getAccountId();
        $account    = $this->sdk->accounts()->account($adminPk);
        $txb        = new TransactionBuilder($account);

        $addrType = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
        $fa       = new XdrSCAddress($addrType); $fa->setAccountId(new XdrAccountID($fromWallet));
        $ta       = new XdrSCAddress($addrType); $ta->setAccountId(new XdrAccountID($toWallet));

        $fromVal  = XdrSCVal::forAddress($fa);
        $toVal    = XdrSCVal::forAddress($ta);
        $amtVal   = XdrSCVal::forI128($amount);
        $memoVal  = XdrSCVal::forSymbol($memo);

        $hostFn = new InvokeContractHostFunction(
            $this->contractId,
            'record_transaction',
            [$fromVal, $toVal, $amtVal, $memoVal]
        );
        $op     = new InvokeHostFunctionOperation($hostFn);
        $tx     = $txb->addOperation($op)->build();

        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            $code = $resp->getExtras()->getResultCodes()->getOperationResultCodes()[0] ?? 'UNKNOWN';
            throw new \Exception("record_transaction failed: {$code}");
        }

        return [
            'success'          => true,
            'transaction_hash' => $resp->getHash(),
        ];
    }

    public function getUserWallets(int $userId): array
    {
        $adminPk    = $this->adminKeypair->getAccountId();
        $account    = $this->sdk->accounts()->account($adminPk);
        $txb        = new TransactionBuilder($account);

        $userIdVal  = XdrSCVal::forU32($userId);

        $hostFn = new InvokeContractHostFunction(
            $this->contractId,
            'get_user_wallets',
            [$userIdVal]
        );
        $op     = new InvokeHostFunctionOperation($hostFn);
        $tx     = $txb->addOperation($op)->build();

        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            return [];
        }

        $txHash = $resp->getHash();
        $data   = $this->sorobanServer->getTransaction($txHash);
        if ($data->getStatus() !== 'SUCCESS') {
            return [];
        }

        return $this->parseTokensResult($data); // reuse parsing logic for array results
    }

    public function getWalletCount(): int
    {
        $adminPk = $this->adminKeypair->getAccountId();
        $account = $this->sdk->accounts()->account($adminPk);
        $txb     = new TransactionBuilder($account);

        $hostFn = new InvokeContractHostFunction($this->contractId, 'wallet_count', []);
        $op     = new InvokeHostFunctionOperation($hostFn);
        $tx     = $txb->addOperation($op)->build();

        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            return 0;
        }

        $txHash = $resp->getHash();
        $data   = $this->sorobanServer->getTransaction($txHash);
        if ($data->getStatus() !== 'SUCCESS') {
            return 0;
        }

        // TODO: parse integer result
        return 0;
    }

    public function getContractVersion(): int
    {
        $adminPk = $this->adminKeypair->getAccountId();
        $account = $this->sdk->accounts()->account($adminPk);
        $txb     = new TransactionBuilder($account);

        $hostFn = new InvokeContractHostFunction($this->contractId, 'version', []);
        $op     = new InvokeHostFunctionOperation($hostFn);
        $tx     = $txb->addOperation($op)->build();

        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            return 1;
        }

        $txHash = $resp->getHash();
        $data   = $this->sorobanServer->getTransaction($txHash);
        if ($data->getStatus() !== 'SUCCESS') {
            return 1;
        }

        // TODO: parse version integer
        return 1;
    }

    public function updateAdmin(string $newAdminPublicKey): array
    {
        $adminPk = $this->adminKeypair->getAccountId();
        $account = $this->sdk->accounts()->account($adminPk);
        $txb     = new TransactionBuilder($account);

        $addrType     = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
        $newAddress   = new XdrSCAddress($addrType);
        $newAddress->setAccountId(new XdrAccountID($newAdminPublicKey));
        $newAddressVal = XdrSCVal::forAddress($newAddress);

        $hostFn = new InvokeContractHostFunction(
            $this->contractId,
            'update_admin',
            [$newAddressVal]
        );
        $op     = new InvokeHostFunctionOperation($hostFn);
        $tx     = $txb->addOperation($op)->build();

        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            $code = $resp->getExtras()->getResultCodes()->getOperationResultCodes()[0] ?? 'UNKNOWN';
            throw new \Exception("update_admin failed: {$code}");
        }

        return [
            'success'           => true,
            'old_admin'         => $adminPk,
            'new_admin'         => $newAdminPublicKey,
            'transaction_hash'  => $resp->getHash(),
        ];
    }

    public function getTokenBalance(string $publicKey): string
    {
        $adminPk    = $this->adminKeypair->getAccountId();
        $account    = $this->sdk->accounts()->account($adminPk);
        $txb        = new TransactionBuilder($account);

        $addrType   = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
        $scAddress  = new XdrSCAddress($addrType);
        $scAddress->setAccountId(new XdrAccountID($publicKey));
        $addressVal = XdrSCVal::forAddress($scAddress);

        $hostFn = new InvokeContractHostFunction(
            $this->contractId,
            'get_balance',
            [$addressVal]
        );
        $op     = new InvokeHostFunctionOperation($hostFn);
        $tx     = $txb->addOperation($op)->build();

        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            return '0';
        }

        $txHash = $resp->getHash();
        $data   = $this->sorobanServer->getTransaction($txHash);
        if ($data->getStatus() !== 'SUCCESS') {
            return '0';
        }

        return $this->parseBalanceResult($data);
    }

    public function getAvailableTokens(string $publicKey): array
    {
        $adminPk    = $this->adminKeypair->getAccountId();
        $account    = $this->sdk->accounts()->account($adminPk);
        $txb        = new TransactionBuilder($account);

        $addrType   = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
        $scAddress  = new XdrSCAddress($addrType);
        $scAddress->setAccountId(new XdrAccountID($publicKey));
        $addressVal = XdrSCVal::forAddress($scAddress);

        $hostFn = new InvokeContractHostFunction(
            $this->contractId,
            'get_available_tokens',
            [$addressVal]
        );
        $op     = new InvokeHostFunctionOperation($hostFn);
        $tx     = $txb->addOperation($op)->build();

        $tx->sign(
            $this->adminKeypair,
            config('stellar.network') === 'testnet' ? Network::testnet() : Network::public()
        );

        $resp = $this->sdk->submitTransaction($tx);
        if (! $resp->isSuccessful()) {
            return [];
        }

        $txHash = $resp->getHash();
        $data   = $this->sorobanServer->getTransaction($txHash);
        if ($data->getStatus() !== 'SUCCESS') {
            return [];
        }

        return $this->parseTokensResult($data);
    }

    protected function parseTokensResult($sorobanTxData): array
    {
        // TODO: implement based on contract's return format
        return [];
    }

    protected function parseBalanceResult($sorobanTxData): string
    {
        // TODO: implement based on contract's return format
        return '0';
    }
}
