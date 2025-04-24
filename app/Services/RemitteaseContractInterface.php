<?php

namespace App\Services;

use Soneso\StellarSDK\Soroban\SorobanAuthorizationEntry;
use Soneso\StellarSDK\Xdr\XdrSCAddress;
use Soneso\StellarSDK\Xdr\XdrSCAddressType;
use Soneso\StellarSDK\Xdr\XdrAccountID;
use Soneso\StellarSDK\Xdr\XdrSCVal;
use Soneso\StellarSDK\Xdr\XdrInt128Parts;
use Soneso\StellarSDK\Xdr\XdrSCSpecType;
use Soneso\StellarSDK\StellarSDK;
use Soneso\StellarSDK\Soroban\SorobanServer;
use Soneso\StellarSDK\Soroban\Responses\GetTransactionResponse;
use Soneso\StellarSDK\Crypto\KeyPair;
use Soneso\StellarSDK\TransactionBuilder;
use Soneso\StellarSDK\InvokeHostFunctionOperation;
use Soneso\StellarSDK\Soroban\InvokeContractHostFunction;
use Illuminate\Support\Facades\Log;
use Soneso\StellarSDK\Network;
use GuzzleHttp\Client;

class RemitteaseContractInterface
{
    protected $sorobanServer;
    protected $contractId;
    protected $adminKeypair;
    protected $sdk;

    public function __construct(string $contractId)
    {
        $network = config('stellar.network', 'testnet');

        if ($network === 'testnet') {
            $this->sdk = StellarSDK::getTestNetInstance();
            $sorobanRpcUrl = 'https://soroban-testnet.stellar.org';
        } else {
            $this->sdk = StellarSDK::getPublicNetInstance();
            $sorobanRpcUrl = 'https://soroban.stellar.org';
        }

        $this->sorobanServer = new SorobanServer($sorobanRpcUrl);
        $this->contractId = $contractId;
        $this->initializeAdminKeypair();
    }

    protected function initializeAdminKeypair()
    {
        $adminSecret = config('stellar.admin_secret');

        if (empty($adminSecret)) {
            if (app()->environment('local', 'testing')) {
                $keypair = KeyPair::random();
                config(['stellar.admin_secret' => $keypair->getSecretSeed()]);
                $this->adminKeypair = $keypair;
                Log::info('Generated new testing keypair: ' . $keypair->getAccountId());
                return;
            }
            throw new \Exception("Admin secret key not found in configuration");
        }

        try {
            $this->adminKeypair = KeyPair::fromSeed($adminSecret);
            Log::info('Successfully initialized admin keypair for: ' . $this->adminKeypair->getAccountId());
        } catch (\Exception $e) {
            Log::error('Failed to create KeyPair: ' . $e->getMessage());
            throw new \Exception("Invalid admin secret key. Please generate a new one using 'php artisan stellar:generate-keypair'");
        }
    }

    public function fundTestAccount($publicKey)
    {
        try {
            if (config('stellar.network', 'testnet') !== 'testnet') {
                throw new \Exception("Friendbot funding only available on testnet");
            }
            $response = (new Client())->get("https://friendbot.stellar.org?addr=" . $publicKey);
            if ($response->getStatusCode() === 200) {
                Log::info("Successfully funded test account: " . $publicKey);
                return true;
            }
            Log::error("Failed to fund test account: " . $publicKey);
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to fund test account: ' . $e->getMessage());
            return false;
        }
    }

    public function registerWallet($publicKey, $userId)
    {
        try {
            if (config('stellar.network') === 'testnet') {
                $this->fundTestAccount($publicKey);
            }

            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);
            $builder = new TransactionBuilder($account);

            // build SCAddress and wrap in SCVal
            $addrType   = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
            $scAddress  = new XdrSCAddress($addrType);
            $scAddress->setAccountId(new XdrAccountID($publicKey));
            $addressVal = XdrSCVal::forAddress($scAddress);

            // wrap userId
            $userIdVal = XdrSCVal::forU32($userId);

            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "register_wallet",
                [$addressVal, $userIdVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = $builder->addOperation($operation)->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if ($response->isSuccessful()) {
                return [
                    'success' => true,
                    'message' => "Wallet registered successfully",
                    'user_id' => $userId,
                    'public_key' => $publicKey,
                    'transaction_hash' => $response->getHash()
                ];
            }
            $codes = $response->getExtras()->getResultCodes();
            throw new \Exception("Failed to register wallet: " . $codes->getOperationResultCodes()[0]);
        } catch (\Exception $e) {
            Log::error('Contract interaction error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getWalletDetails($publicKey)
    {
        try {
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);
            $builder = new TransactionBuilder($account);

            // build SCAddress and wrap
            $addrType   = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
            $scAddress  = new XdrSCAddress($addrType);
            $scAddress->setAccountId(new XdrAccountID($publicKey));
            $addressVal = XdrSCVal::forAddress($scAddress);

            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "get_wallet",
                [$addressVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = $builder->addOperation($operation)->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if (! $response->isSuccessful()) {
                $codes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to get wallet: " . $codes->getOperationResultCodes()[0]);
            }

            $txHash = $response->getHash();
            $sorobanTx = $this->sorobanServer->getTransaction($txHash);
            if ($sorobanTx->getStatus() !== "SUCCESS") {
                return null;
            }

            // parse result as needed...
            return [
                'public_key' => $publicKey,
                // other fields...
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get wallet details: ' . $e->getMessage());
            throw $e;
        }
    }

    public function verifyWallet($publicKey)
    {
        try {
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);
            $builder = new TransactionBuilder($account);

            // build & wrap address
            $addrType   = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
            $scAddress  = new XdrSCAddress($addrType);
            $scAddress->setAccountId(new XdrAccountID($publicKey));
            $addressVal = XdrSCVal::forAddress($scAddress);

            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "verify_wallet",
                [$addressVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = $builder->addOperation($operation)->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if ($response->isSuccessful()) {
                return [
                    'success' => true,
                    'message' => "Wallet verified successfully",
                    'public_key' => $publicKey,
                    'transaction_hash' => $response->getHash()
                ];
            }
            $codes = $response->getExtras()->getResultCodes();
            throw new \Exception("Failed to verify wallet: " . $codes->getOperationResultCodes()[0]);
        } catch (\Exception $e) {
            Log::error('Failed to verify wallet: ' . $e->getMessage());
            throw $e;
        }
    }

    public function recordTransaction($fromWallet, $toWallet, $amount, $memo = "payment")
    {
        try {
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);
            $builder = new TransactionBuilder($account);

            // wrap from/to addresses
            $addrType  = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
            $fromAddr  = new XdrSCAddress($addrType);
            $fromAddr->setAccountId(new XdrAccountID($fromWallet));
            $toAddr    = new XdrSCAddress($addrType);
            $toAddr->setAccountId(new XdrAccountID($toWallet));
            $fromVal   = XdrSCVal::forAddress($fromAddr);
            $toVal     = XdrSCVal::forAddress($toAddr);

            // wrap amount and memo
            $amountVal = XdrSCVal::forI128($amount);
            $memoVal   = XdrSCVal::forSymbol($memo);

            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "record_transaction",
                [$fromVal, $toVal, $amountVal, $memoVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = $builder->addOperation($operation)->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if ($response->isSuccessful()) {
                return [
                    'success' => true,
                    'message' => "Transaction recorded successfully",
                    'from_wallet' => $fromWallet,
                    'to_wallet' => $toWallet,
                    'amount' => $amount,
                    'transaction_hash' => $response->getHash()
                ];
            }
            $codes = $response->getExtras()->getResultCodes();
            throw new \Exception("Failed to record transaction: " . $codes->getOperationResultCodes()[0]);
        } catch (\Exception $e) {
            Log::error('Failed to record transaction: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getUserWallets($userId)
    {
        try {
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);
            $builder = new TransactionBuilder($account);

            $userIdVal = XdrSCVal::forU32($userId);
            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "get_user_wallets",
                [$userIdVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = $builder->addOperation($operation)->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if (! $response->isSuccessful()) {
                $codes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to get user wallets: " . $codes->getOperationResultCodes()[0]);
            }
            $txHash    = $response->getHash();
            $sorobanTx = $this->sorobanServer->getTransaction($txHash);
            if ($sorobanTx->getStatus() !== "SUCCESS") {
                return [];
            }
            // parse and return wallets...
            return [];
        } catch (\Exception $e) {
            Log::error('Failed to get user wallets: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getWalletCount()
    {
        try {
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);
            $builder = new TransactionBuilder($account);

            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "wallet_count",
                []
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = $builder->addOperation($operation)->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if (! $response->isSuccessful()) {
                $codes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to get wallet count: " . $codes->getOperationResultCodes()[0]);
            }
            $txHash    = $response->getHash();
            $sorobanTx = $this->sorobanServer->getTransaction($txHash);
            if ($sorobanTx->getStatus() !== "SUCCESS") {
                return 0;
            }
            // parse and return count...
            return 0;
        } catch (\Exception $e) {
            Log::error('Failed to get wallet count: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getContractVersion()
    {
        try {
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);
            $builder = new TransactionBuilder($account);

            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "version",
                []
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = $builder->addOperation($operation)->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if (! $response->isSuccessful()) {
                $codes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to get contract version: " . $codes->getOperationResultCodes()[0]);
            }
            $txHash    = $response->getHash();
            $sorobanTx = $this->sorobanServer->getTransaction($txHash);
            if ($sorobanTx->getStatus() !== "SUCCESS") {
                return 1;
            }
            // parse and return version...
            return 1;
        } catch (\Exception $e) {
            Log::error('Failed to get contract version: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateAdmin($newAdminPublicKey)
    {
        try {
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);
            $builder = new TransactionBuilder($account);

            $addrType  = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
            $scAddress = new XdrSCAddress($addrType);
            $scAddress->setAccountId(new XdrAccountID($newAdminPublicKey));
            $addressVal = XdrSCVal::forAddress($scAddress);

            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "update_admin",
                [$addressVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = $builder->addOperation($operation)->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if ($response->isSuccessful()) {
                return [
                    'success' => true,
                    'message' => "Admin updated successfully",
                    'old_admin' => $adminPublicKey,
                    'new_admin' => $newAdminPublicKey,
                    'transaction_hash' => $response->getHash()
                ];
            }
            $codes = $response->getExtras()->getResultCodes();
            throw new \Exception("Failed to update admin: " . $codes->getOperationResultCodes()[0]);
        } catch (\Exception $e) {
            Log::error('Failed to update admin: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getTokenBalance($publicKey)
    {
        try {
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            $addrType  = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
            $scAddress = new XdrSCAddress($addrType);
            $scAddress->setAccountId(new XdrAccountID($publicKey));
            $addressVal = XdrSCVal::forAddress($scAddress);

            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "get_balance",
                [$addressVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = (new TransactionBuilder($account))
                ->addOperation($operation)
                ->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if (! $response->isSuccessful()) {
                return '0';
            }
            $txHash    = $response->getHash();
            $sorobanTx = $this->sorobanServer->getTransaction($txHash);
            if ($sorobanTx->getStatus() !== "SUCCESS") {
                return '0';
            }
            return $this->parseBalanceResult($sorobanTx);
        } catch (\Exception $e) {
            Log::error('Failed to get token balance: ' . $e->getMessage());
            return '0';
        }
    }

    public function getAvailableTokens($publicKey)
    {
        try {
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            $addrType  = new XdrSCAddressType(XdrSCAddressType::SC_ADDRESS_TYPE_ACCOUNT());
            $scAddress = new XdrSCAddress($addrType);
            $scAddress->setAccountId(new XdrAccountID($publicKey));
            $addressVal = XdrSCVal::forAddress($scAddress);

            $hostFunction = new InvokeContractHostFunction(
                $this->contractId,
                "get_available_tokens",
                [$addressVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFunction);

            $tx = (new TransactionBuilder($account))
                ->addOperation($operation)
                ->build();
            $passphrase = config('stellar.network') === 'testnet'
                ? Network::testnet()
                : Network::public();
            $tx->sign($this->adminKeypair, $passphrase);

            $response = $this->sdk->submitTransaction($tx);
            if (! $response->isSuccessful()) {
                $codes = $response->getExtras()->getResultCodes();
                Log::warning("Failed to get available tokens: " . $codes->getOperationResultCodes()[0]);
                return [];
            }
            $txHash    = $response->getHash();
            $sorobanTx = $this->sorobanServer->getTransaction($txHash);
            if ($sorobanTx->getStatus() !== "SUCCESS") {
                return [];
            }
            return $this->parseTokensResult($sorobanTx);
        } catch (\Exception $e) {
            Log::error('Failed to get available tokens from contract: ' . $e->getMessage());
            return [];
        }
    }

    protected function parseTokensResult(GetTransactionResponse $sorobanTxData): array
    {
        // placeholder; implement actual parsing of SCVal array
        return [];
    }

    protected function parseBalanceResult(GetTransactionResponse $sorobanTxData)
    {
        // placeholder; implement actual parsing of SCVal i128
        return '0';
    }
}
