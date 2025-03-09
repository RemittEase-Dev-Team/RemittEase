<?php

namespace App\Services;

use Soneso\StellarSDK\SorobanServer;
use Soneso\StellarSDK\Keypair;
use Soneso\StellarSDK\Soroban\SorobanAuthorizationEntry;
use Soneso\StellarSDK\Soroban\Arguments\ScAddressObject;
use Soneso\StellarSDK\Soroban\Arguments\ScUint32Object;
use Soneso\StellarSDK\Soroban\Arguments\ScInt128Object;
use Soneso\StellarSDK\Soroban\Arguments\ScSymbolObject;
use Soneso\StellarSDK\StellarSDK;
use Illuminate\Support\Facades\Log;

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

        // Load the admin keypair from config (this should be securely stored)
        $adminSecret = config('stellar.admin_secret');
        if ($adminSecret) {
            $this->adminKeypair = Keypair::fromSecretSeed($adminSecret);
        } else {
            throw new \Exception("Admin secret key not found in configuration");
        }
    }

    /**
     * Register a wallet with the Remittease contract
     */
    public function registerWallet($publicKey, $userId)
    {
        try {
            // Get admin account
            $adminPublicKey = $this->adminKeypair->getAccountId();
            $account = $this->sdk->accounts()->account($adminPublicKey);

            // Create a transaction builder
            $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);

            // Create Soroban parameters
            $walletAddress = ScAddressObject::fromAccountId($publicKey);
            $userIdParam = ScUint32Object::from($userId);

            // Create invoke contract operation
            $operation = \Soneso\StellarSDK\Soroban\SorobanInvokeHostFunctionOperation::forContractFn(
                $this->contractId,
                "register_wallet",
                [$walletAddress, $userIdParam]
            );

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            $transaction->sign($this->adminKeypair, $this->sdk->getNetwork());

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
            $walletAddress = ScAddressObject::fromAccountId($publicKey);

            // Create invoke contract operation
            $operation = \Soneso\StellarSDK\Soroban\SorobanInvokeHostFunctionOperation::forContractFn(
                $this->contractId,
                "get_wallet",
                [$walletAddress]
            );

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            $transaction->sign($this->adminKeypair, $this->sdk->getNetwork());

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
            $walletAddress = ScAddressObject::fromAccountId($publicKey);

            // Create invoke contract operation
            $operation = \Soneso\StellarSDK\Soroban\SorobanInvokeHostFunctionOperation::forContractFn(
                $this->contractId,
                "verify_wallet",
                [$walletAddress]
            );

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            $transaction->sign($this->adminKeypair, $this->sdk->getNetwork());

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
            $fromAddress = ScAddressObject::fromAccountId($fromWallet);
            $toAddress = ScAddressObject::fromAccountId($toWallet);
            $amountParam = ScInt128Object::fromNativeAssetAmount($amount);
            $memoParam = ScSymbolObject::of($memo);

            // Create invoke contract operation
            $operation = \Soneso\StellarSDK\Soroban\SorobanInvokeHostFunctionOperation::forContractFn(
                $this->contractId,
                "record_transaction",
                [$fromAddress, $toAddress, $amountParam, $memoParam]
            );

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            $transaction->sign($this->adminKeypair, $this->sdk->getNetwork());

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
            $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);

            // Create Soroban parameters
            $userIdParam = ScUint32Object::from($userId);

            // Create invoke contract operation
            $operation = \Soneso\StellarSDK\Soroban\SorobanInvokeHostFunctionOperation::forContractFn(
                $this->contractId,
                "get_user_wallets",
                [$userIdParam]
            );

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            $transaction->sign($this->adminKeypair, $this->sdk->getNetwork());

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

            // Create invoke contract operation
            $operation = \Soneso\StellarSDK\Soroban\SorobanInvokeHostFunctionOperation::forContractFn(
                $this->contractId,
                "wallet_count",
                []
            );

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            $transaction->sign($this->adminKeypair, $this->sdk->getNetwork());

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

            // Create invoke contract operation
            $operation = \Soneso\StellarSDK\Soroban\SorobanInvokeHostFunctionOperation::forContractFn(
                $this->contractId,
                "version",
                []
            );

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            $transaction->sign($this->adminKeypair, $this->sdk->getNetwork());

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
            $newAdminAddress = ScAddressObject::fromAccountId($newAdminPublicKey);

            // Create invoke contract operation
            $operation = \Soneso\StellarSDK\Soroban\SorobanInvokeHostFunctionOperation::forContractFn(
                $this->contractId,
                "update_admin",
                [$newAdminAddress]
            );

            // Add the operation to the transaction
            $transaction = $transactionBuilder
                ->addOperation($operation)
                ->build();

            // Add transaction signature
            $transaction->sign($this->adminKeypair, $this->sdk->getNetwork());

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
}
