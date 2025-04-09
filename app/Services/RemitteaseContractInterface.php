<?php

namespace App\Services;

use Soneso\StellarSDK\Soroban\SorobanAuthorizationEntry;
use Soneso\StellarSDK\Xdr\XdrSCAddress;
use Soneso\StellarSDK\Xdr\XdrSCAddressType;
use Soneso\StellarSDK\Xdr\XdrAccountID;
use Soneso\StellarSDK\Xdr\XdrSCVal;
use Soneso\StellarSDK\Xdr\XdrUInt32;
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
        // Get the network from config
        $network = config('stellar.network', 'testnet');

        // Initialize Stellar SDK
        if ($network === 'testnet') {
            $this->sdk = StellarSDK::getTestNetInstance();
            $sorobanRpcUrl = 'https://soroban-testnet.stellar.org';
        } else {
            $this->sdk = StellarSDK::getPublicNetInstance();
            $sorobanRpcUrl = 'https://soroban.stellar.org';
        }

        // Initialize Soroban server
        $this->sorobanServer = new SorobanServer($sorobanRpcUrl);
        $this->contractId = $contractId;

        // Load or generate admin keypair
        $this->initializeAdminKeypair();
    }

    protected function initializeAdminKeypair()
    {
        $adminSecret = config('stellar.admin_secret');

        if (empty($adminSecret)) {
            if (app()->environment('local', 'testing')) {
                // Generate new keypair for testing
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
            // Verify the keypair is valid by getting the public key
            $publicKey = $this->adminKeypair->getAccountId();
            Log::info('Successfully initialized admin keypair for: ' . $publicKey);
        } catch (\Exception $e) {
            Log::error('Failed to create KeyPair: ' . $e->getMessage());
            throw new \Exception("Invalid admin secret key. Please generate a new one using 'php artisan stellar:generate-keypair'");
        }
    }

    /**
     * Fund a test account using Friendbot
     */
    public function fundTestAccount($publicKey)
    {
        try {
            if (config('stellar.network', 'testnet') !== 'testnet') {
                throw new \Exception("Friendbot funding only available on testnet");
            }

            $client = new Client();
            $response = $client->get("https://friendbot.stellar.org?addr=" . $publicKey);

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

    /**
     * Register a wallet with the Remittease contract
     */
    public function registerWallet($publicKey, $userId)
    {
        try {
            // Fund the account if on testnet
            if (config('stellar.network', 'testnet') === 'testnet') {
                $this->fundTestAccount($publicKey);
            }

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

            // Create user ID parameter using XdrUInt32
            $userIdParam = new XdrUInt32($userId);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "register_wallet",
                [$walletAddress, $userIdParam]
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
                    'message' => "Wallet registered successfully",
                    'user_id' => $userId,
                    'public_key' => $publicKey,
                    'transaction_hash' => $response->getHash()
                ];
            } else {
                $resultCodes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to register wallet: " . $resultCodes->getOperationResultCodes()[0]);
            }
        } catch (\Exception $e) {
            Log::error('Contract interaction error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get wallet details from the contract
     */
    public function getWalletDetails($publicKey)
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
            $walletAddress->setAccountId($publicKey);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "get_wallet",
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

                // Process the result (this is simplified)
                // In a real implementation, you would parse the XDR result properly
                if ($sorobanTxData->getStatus() === "SUCCESS") {
                    return [
                        'public_key' => $publicKey,
                        'user_id' => null, // Would be extracted from the result
                        'status' => 'active', // Would be extracted from the result
                        'is_verified' => false, // Would be extracted from the result
                        'created_at' => now()->timestamp,
                    ];
                }

                return null; // Wallet not found
            } else {
                $resultCodes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to get wallet details: " . $resultCodes->getOperationResultCodes()[0]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to get wallet details: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify a wallet in the contract
     */
    public function verifyWallet($publicKey)
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
            $walletAddress->setAccountId($publicKey);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "verify_wallet",
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
                return [
                    'success' => true,
                    'message' => "Wallet verified successfully",
                    'public_key' => $publicKey,
                    'transaction_hash' => $response->getHash()
                ];
            } else {
                $resultCodes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to verify wallet: " . $resultCodes->getOperationResultCodes()[0]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to verify wallet: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Record a transaction in the contract
     * Note: Using shortened symbol 'tx' to match the contract
     */
    public function recordTransaction($fromWallet, $toWallet, $amount, $memo = "payment")
    {
        try {
            // Get admin account
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            // Create a transaction builder
            $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);

            // Create Soroban parameters
            $addressType = new XdrSCAddressType(0); // 0 = SC_ADDRESS_TYPE_ACCOUNT
            $fromAddress = new XdrSCAddress($addressType);
            $fromAddress->setAccountId($fromWallet);
            $toAddress = new XdrSCAddress($addressType);
            $toAddress->setAccountId($toWallet);
            $amountParam = new XdrInt128Parts($amount);
            $memoParam = new XdrSCSpecType($memo);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "record_transaction",
                [$fromAddress, $toAddress, $amountParam, $memoParam]
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
                    'message' => "Transaction recorded successfully",
                    'from_wallet' => $fromWallet,
                    'to_wallet' => $toWallet,
                    'amount' => $amount,
                    'transaction_hash' => $response->getHash()
                ];
            } else {
                $resultCodes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to record transaction: " . $resultCodes->getOperationResultCodes()[0]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to record transaction: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all wallets for a specific user
     */
    public function getUserWallets($userId)
    {
        try {
            // Get admin account
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            // Create a transaction builder
            $transactionBuilder = new TransactionBuilder($account);

            // Create Soroban parameters
            $userIdParam = new XdrUInt32($userId);

            // Create host function for contract invocation
            $hostFunction = new \Soneso\StellarSDK\InvokeContractHostFunction(
                $this->contractId,
                "get_user_wallets",
                [$userIdParam]
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

                // In a real implementation, parse the XDR result to get the wallet addresses
                // This is simplified for illustration
                return [
                    'user_id' => $userId,
                    'wallets' => [] // Would contain wallet addresses extracted from result
                ];
            } else {
                $resultCodes = $response->getExtras()->getResultCodes();
                throw new \Exception("Failed to get user wallets: " . $resultCodes->getOperationResultCodes()[0]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to get user wallets: ' . $e->getMessage());
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
