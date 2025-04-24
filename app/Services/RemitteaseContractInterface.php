<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Soneso\StellarSDK\Crypto\KeyPair;
use Soneso\StellarSDK\Network;
use Soneso\StellarSDK\Soroban\InvokeContractHostFunction;
use Soneso\StellarSDK\Soroban\SorobanServer;
use Soneso\StellarSDK\StellarSDK;
use Soneso\StellarSDK\TransactionBuilder;
use Soneso\StellarSDK\InvokeHostFunctionOperation;
use Soneso\StellarSDK\Xdr\XdrSCVal;
use Soneso\StellarSDK\Xdr\XdrSCAddress;
use Soneso\StellarSDK\Xdr\XdrAccountID;
use Soneso\StellarSDK\Xdr\XdrInt128Parts;
use Soneso\StellarSDK\Xdr\XdrSCSpecType;

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
            $this->sdk = StellarSDK::getTestNetInstance();
            $rpcUrl    = 'https://soroban-testnet.stellar.org';
        } else {
            $this->sdk = StellarSDK::getPublicNetInstance();
            $rpcUrl    = 'https://soroban.stellar.org';
        }
        $this->sorobanServer = new SorobanServer($rpcUrl);
        $this->contractId    = $contractId;
        $this->initializeAdminKeypair();
    }

    protected function initializeAdminKeypair(): void
    {
        $secret = config('stellar.admin_secret');
        if (empty($secret)) {
            if (app()->environment('local', 'testing')) {
                $kp = KeyPair::random();
                config(['stellar.admin_secret' => $kp->getSecretSeed()]);
                Log::info("Generated test keypair: " . $kp->getAccountId());
                $this->adminKeypair = $kp;
                return;
            }
            throw new \Exception("Missing admin secret in config");
        }

        try {
            $this->adminKeypair = KeyPair::fromSeed($secret);
            Log::info("Loaded admin keypair: " . $this->adminKeypair->getAccountId());
        } catch (\Exception $e) {
            Log::error("KeyPair init failed: " . $e->getMessage());
            throw new \Exception("Invalid admin secret; run php artisan stellar:generate-keypair");
        }
    }

    public function fundTestAccount(string $publicKey): bool
    {
        if (config('stellar.network') !== 'testnet') {
            throw new \Exception("Friendbot only on testnet");
        }
        try {
            $resp = (new Client())->get("https://friendbot.stellar.org?addr={$publicKey}");
            if ($resp->getStatusCode() === 200) {
                Log::info("Funded test account: $publicKey");
                return true;
            }
            Log::error("Friendbot error: " . $resp->getBody());
            return false;
        } catch (\Exception $e) {
            Log::error("Friendbot failed: " . $e->getMessage());
            return false;
        }
    }

    public function registerWallet(string $publicKey, int $userId): array
    {
        try {
            // top up on testnet
            if (config('stellar.network') === 'testnet') {
                $this->fundTestAccount($publicKey);
            }

            // load admin account
            $adminAcct = $this->adminKeypair->getAccountId();
            $account   = $this->sdk->accounts()->account($adminAcct);

            $builder = new TransactionBuilder($account);

            // use XdrSCVal helpers instead of manual XDR classes
            $addressVal = XdrSCVal::forAddress($publicKey);
            $userIdVal  = XdrSCVal::forU32($userId);

            $hostFn   = new InvokeContractHostFunction(
                $this->contractId,
                "register_wallet",
                [$addressVal, $userIdVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFn);

            $tx = $builder
                ->addOperation($operation)
                ->build();

            $network = (config('stellar.network') === 'testnet')
                     ? Network::testnet()
                     : Network::public();
            $tx->sign($this->adminKeypair, $network);

            $resp = $this->sdk->submitTransaction($tx);

            if ($resp->isSuccessful()) {
                return [
                    'success'          => true,
                    'message'          => "Wallet registered successfully",
                    'user_id'          => $userId,
                    'public_key'       => $publicKey,
                    'transaction_hash' => $resp->getHash(),
                ];
            }

            $code = $resp->getExtras()->getResultCodes()->getOperationResultCodes()[0];
            throw new \Exception("Contract error: $code");
        } catch (\Exception $e) {
            Log::error("registerWallet failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function getWalletDetails(string $publicKey): ?array
    {
        try {
            $adminAcct = $this->adminKeypair->getAccountId();
            $account   = $this->sdk->accounts()->account($adminAcct);
            $builder   = new TransactionBuilder($account);

            // you can keep building raw XdrSCAddress if you need detailed control
            $addressType = XdrSCVal::forAddress($publicKey);

            $hostFn   = new InvokeContractHostFunction(
                $this->contractId,
                "get_wallet",
                [$addressType]
            );
            $operation = new InvokeHostFunctionOperation($hostFn);

            $tx = $builder
                ->addOperation($operation)
                ->build();

            $network = (config('stellar.network') === 'testnet')
                     ? Network::testnet()
                     : Network::public();
            $tx->sign($this->adminKeypair, $network);

            $resp = $this->sdk->submitTransaction($tx);

            if (! $resp->isSuccessful()) {
                $code = $resp->getExtras()->getResultCodes()->getOperationResultCodes()[0];
                throw new \Exception("getWalletDetails failed: $code");
            }

            $hash      = $resp->getHash();
            $soroData  = $this->sorobanServer->getTransaction($hash);

            if ($soroData->getStatus() !== "SUCCESS") {
                return null;
            }

            // parse returned SCVal result here…
            return [
                'public_key' => $publicKey,
                'status'     => 'active',
                'is_verified'=> false,
                'created_at' => now()->timestamp,
            ];
        } catch (\Exception $e) {
            Log::error("getWalletDetails error: " . $e->getMessage());
            throw $e;
        }
    }

    public function verifyWallet(string $publicKey): array
    {
        try {
            $adminAcct = $this->adminKeypair->getAccountId();
            $account   = $this->sdk->accounts()->account($adminAcct);
            $builder   = new TransactionBuilder($account);

            $addressVal = XdrSCVal::forAddress($publicKey);
            $hostFn     = new InvokeContractHostFunction(
                $this->contractId,
                "verify_wallet",
                [$addressVal]
            );
            $operation  = new InvokeHostFunctionOperation($hostFn);

            $tx = $builder
                ->addOperation($operation)
                ->build();

            $network = (config('stellar.network') === 'testnet')
                     ? Network::testnet()
                     : Network::public();
            $tx->sign($this->adminKeypair, $network);

            $resp = $this->sdk->submitTransaction($tx);

            if ($resp->isSuccessful()) {
                return [
                    'success'          => true,
                    'message'          => "Wallet verified successfully",
                    'public_key'       => $publicKey,
                    'transaction_hash' => $resp->getHash(),
                ];
            }

            $code = $resp->getExtras()->getResultCodes()->getOperationResultCodes()[0];
            throw new \Exception("verifyWallet failed: $code");
        } catch (\Exception $e) {
            Log::error("verifyWallet error: " . $e->getMessage());
            throw $e;
        }
    }

    public function recordTransaction(string $fromWallet, string $toWallet, int $amount, string $memo = "payment"): array
    {
        try {
            $adminAcct = $this->adminKeypair->getAccountId();
            $account   = $this->sdk->accounts()->account($adminAcct);
            $builder   = new TransactionBuilder($account);

            $fromVal = XdrSCVal::forAddress($fromWallet);
            $toVal   = XdrSCVal::forAddress($toWallet);
            $amtVal  = new XdrInt128Parts($amount);
            $memoVal = new XdrSCSpecType($memo);

            $hostFn    = new InvokeContractHostFunction(
                $this->contractId,
                "record_transaction",
                [$fromVal, $toVal, $amtVal, $memoVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFn);

            $tx = $builder
                ->addOperation($operation)
                ->build();

            $network = (config('stellar.network') === 'testnet')
                     ? Network::testnet()
                     : Network::public();
            $tx->sign($this->adminKeypair, $network);

            $resp = $this->sdk->submitTransaction($tx);

            if ($resp->isSuccessful()) {
                return [
                    'success'          => true,
                    'message'          => "Transaction recorded successfully",
                    'from_wallet'      => $fromWallet,
                    'to_wallet'        => $toWallet,
                    'amount'           => $amount,
                    'transaction_hash' => $resp->getHash(),
                ];
            }

            $code = $resp->getExtras()->getResultCodes()->getOperationResultCodes()[0];
            throw new \Exception("recordTransaction failed: $code");
        } catch (\Exception $e) {
            Log::error("recordTransaction error: " . $e->getMessage());
            throw $e;
        }
    }

    public function getUserWallets(int $userId): array
    {
        try {
            $adminAcct = $this->adminKeypair->getAccountId();
            $account   = $this->sdk->accounts()->account($adminAcct);
            $builder   = new TransactionBuilder($account);

            // replace XdrUInt32 with SCVal
            $userIdVal = XdrSCVal::forU32($userId);

            $hostFn    = new InvokeContractHostFunction(
                $this->contractId,
                "get_user_wallets",
                [$userIdVal]
            );
            $operation = new InvokeHostFunctionOperation($hostFn);

            $tx = $builder
                ->addOperation($operation)
                ->build();

            $network = (config('stellar.network') === 'testnet')
                     ? Network::testnet()
                     : Network::public();
            $tx->sign($this->adminKeypair, $network);

            $resp = $this->sdk->submitTransaction($tx);

            if (! $resp->isSuccessful()) {
                $code = $resp->getExtras()->getResultCodes()->getOperationResultCodes()[0];
                throw new \Exception("getUserWallets failed: $code");
            }

            $hash     = $resp->getHash();
            $soroData = $this->sorobanServer->getTransaction($hash);

            // parse returned SCVal list here…
            return [
                'user_id' => $userId,
                'wallets' => [], // fill in after parsing
            ];
        } catch (\Exception $e) {
            Log::error("getUserWallets error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get total wallet count
     */
    public function getWalletCount()
    {
        try {
            // Get admin account
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            // Create a transaction builder
            $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "wallet_count",
                []
            );

            // Create operation with the host function
            $operation = new InvokeHostFunctionOperation($hostFunction);

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            if (config('stellar.network', 'testnet') === 'testnet') {
                $transaction->sign($this->adminKeypair, Network::testnet());
            } else {
                $transaction->sign($this->adminKeypair, Network::public());
            }

            // Submit the transaction
            $response = $this->sdk->submitTransaction($transaction);

            if ($response->isSuccessful()) {
                // Get the Soroban transaction data
                $txHash = $response->getHash();
                $sorobanTxData = $this->sorobanServer->getTransaction($txHash);

                // In a real implementation, parse the XDR result to get the count
                // This is simplified for illustration
                return 0; // Would be the actual count from the contract
            } else {
                $resultCodes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to get wallet count: " . $resultCodes->getOperationResultCodes()[0]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to get wallet count: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get contract version
     */
    public function getContractVersion()
    {
        try {
            // Get admin account
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            // Create a transaction builder
            $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "version",
                []
            );

            // Create operation with the host function
            $operation = new InvokeHostFunctionOperation($hostFunction);

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            if (config('stellar.network', 'testnet') === 'testnet') {
                $transaction->sign($this->adminKeypair, Network::testnet());
            } else {
                $transaction->sign($this->adminKeypair, Network::public());
            }

            // Submit the transaction
            $response = $this->sdk->submitTransaction($transaction);

            if ($response->isSuccessful()) {
                // Get the Soroban transaction data
                $txHash = $response->getHash();
                $sorobanTxData = $this->sorobanServer->getTransaction($txHash);

                // In a real implementation, parse the XDR result to get the version
                return 1; // Would be the actual version from the contract
            } else {
                $resultCodes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to get contract version: " . $resultCodes->getOperationResultCodes()[0]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to get contract version: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update contract admin
     */
    public function updateAdmin($newAdminPublicKey)
    {
        try {
            // Get admin account
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            // Create a transaction builder
            $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);

            // Create Soroban parameters
            $addressType = new XdrSCAddressType(0); // 0 = SC_ADDRESS_TYPE_ACCOUNT
            $newAdminAddress = new XdrSCAddress($addressType);
            $newAdminAddress->setAccountId($newAdminPublicKey);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "update_admin",
                [$newAdminAddress]
            );

            // Create operation with the host function
            $operation = new InvokeHostFunctionOperation($hostFunction);

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            if (config('stellar.network', 'testnet') === 'testnet') {
                $transaction->sign($this->adminKeypair, Network::testnet());
            } else {
                $transaction->sign($this->adminKeypair, Network::public());
            }

            // Submit the transaction
            $response = $this->sdk->submitTransaction($transaction);

            if ($response->isSuccessful()) {
                return [
                    'success' => true,
                    'message' => "Admin updated successfully",
                    'old_admin' => $adminPublicKey,
                    'new_admin' => $newAdminPublicKey,
                    'transaction_hash' => $response->getHash()
                ];
            } else {
                $resultCodes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to update admin: " . $resultCodes->getOperationResultCodes()[0]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to update admin: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getTokenBalance($publicKey)
    {
        try {
            // Get admin account
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            // Create Soroban parameters
            $addressType = new XdrSCAddressType(0); // 0 = SC_ADDRESS_TYPE_ACCOUNT
            $walletAddress = new XdrSCAddress($addressType);

            // Create XdrAccountID with the public key
            $accountId = new XdrAccountID($publicKey);
            $walletAddress->setAccountId($accountId);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "get_balance",
                [$walletAddress]
            );

            // Create operation with the host function
            $operation = new InvokeHostFunctionOperation($hostFunction);

            // Add the operation to the transaction
            $transaction = (new TransactionBuilder($account))
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            if (config('stellar.network', 'testnet') === 'testnet') {
                $transaction->sign($this->adminKeypair, Network::testnet());
            } else {
                $transaction->sign($this->adminKeypair, Network::public());
            }

            // Submit the transaction
            $response = $this->sdk->submitTransaction($transaction);

            if ($response->isSuccessful()) {
                $txHash = $response->getHash();
                $sorobanTxData = $this->sorobanServer->getTransaction($txHash);

                // Parse the result (you'll need to implement this based on your contract's return format)
                return $this->parseBalanceResult($sorobanTxData);
            }

            return '0';
        } catch (\Exception $e) {
            Log::error('Failed to get token balance: ' . $e->getMessage());
            return '0';
        }
    }

    /**
     * Get all available tokens for a wallet from the Soroban contract
     */
    public function getAvailableTokens($publicKey)
    {
        try {
            // Get admin account
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            // Create a transaction builder
            $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);

            // Create Soroban parameters
            $addressType = new XdrSCAddressType(0); // 0 = SC_ADDRESS_TYPE_ACCOUNT
            $walletAddress = new XdrSCAddress($addressType);

            // Create XdrAccountID with the public key
            $accountId = new XdrAccountID($publicKey);
            $walletAddress->setAccountId($accountId);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "get_available_tokens",
                [$walletAddress]
            );

            // Create operation with the host function
            $operation = new InvokeHostFunctionOperation($hostFunction);

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            if (config('stellar.network', 'testnet') === 'testnet') {
                $transaction->sign($this->adminKeypair, Network::testnet());
            } else {
                $transaction->sign($this->adminKeypair, Network::public());
            }

            // Submit the transaction
            $response = $this->sdk->submitTransaction($transaction);

            if ($response->isSuccessful()) {
                // Get the Soroban transaction data
                $txHash = $response->getHash();
                $sorobanTxData = $this->sorobanServer->getTransaction($txHash);

                // In a real implementation, parse the XDR result to get the tokens
                // This would depend on your contract's return format
                // For now, returning an empty array as placeholder

                // You would need to implement a method to parse the result
                return $this->parseTokensResult($sorobanTxData);
            } else {
                $resultCodes = $response->getExtras()->getResultCodes();
                Log::warning("Failed to get available tokens: " . $resultCodes->getOperationResultCodes()[0]);
                return [];
            }

        } catch (\Exception $e) {
            Log::error('Failed to get available tokens from contract: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Parse tokens result from Soroban transaction data
     * You'll need to implement this based on your contract's return format
     */
    protected function parseTokensResult($sorobanTxData)
    {
        // Example implementation - replace with actual parsing logic
        if ($sorobanTxData->getStatus() !== "SUCCESS") {
            return [];
        }

        // Here you would parse the result based on your contract's return format
        // This is just a placeholder implementation
        return [
            [
                'code' => 'XLM',
                'balance' => '0',
                'contract_id' => null
            ]
        ];
    }
}