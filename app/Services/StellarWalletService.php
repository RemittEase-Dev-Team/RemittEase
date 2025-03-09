<?php

namespace App\Services;

use Soneso\StellarSDK\Keypair;
use Soneso\StellarSDK\SorobanServer;
use Soneso\StellarSDK\StellarSDK;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Log;

class StellarWalletService
{
    protected $sdk;
    protected $sorobanServer;
    protected $remitteaseContractId;

    public function __construct()
    {
        // Initialize Stellar SDK (use testnet for development, switch to public for production)
        $this->sdk = StellarSDK::getTestNetInstance();

        // Initialize Soroban server connection
        $this->sorobanServer = new SorobanServer("https://soroban-testnet.stellar.org");

        // Your deployed Remittease contract ID (replace with your actual contract ID)
        $this->remitteaseContractId = config('stellar.remittease_contract_id');
    }

    /**
     * Create a new Stellar wallet for a user
     */
    public function createWalletForUser(User $user)
    {
        try {
            // Generate a new Stellar keypair
            $keypair = Keypair::random();

            $publicKey = $keypair->getAccountId();
            $secretKey = $keypair->getSecretSeed();

            // Fund the account on testnet - for production you'd handle this differently
            if (config('app.env') !== 'production') {
                $this->fundTestAccount($publicKey);
            }

            // Call the Remittease contract to register this wallet
            $this->registerWalletWithContract($publicKey, $user->id);

            // Store wallet info in database (make sure to encrypt the secret key)
            $wallet = new Wallet();
            $wallet->user_id = $user->id;
            $wallet->public_key = $publicKey;
            $wallet->secret_key = encrypt($secretKey); // Encrypt the secret key!
            $wallet->save();

            return $wallet;
        } catch (\Exception $e) {
            Log::error('Failed to create Stellar wallet: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Register the wallet with the Remittease contract
     */
    private function registerWalletWithContract($publicKey, $userId)
    {
        // This is a simplified example - you'd need to implement the actual contract call
        // based on your Remittease contract's interface

        try {
            // Initialize contract interface (you'll need to implement this based on your contract)
            $contract = new RemitteaseContractInterface(
                $this->sorobanServer,
                $this->remitteaseContractId
            );

            // Call the contract method to register the wallet
            // (This is a placeholder - actual implementation depends on your contract)
            $result = $contract->registerWallet($publicKey, $userId);

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to register wallet with contract: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Fund a testnet account (for development only)
     */
    private function fundTestAccount($publicKey)
    {
        // Use Friendbot to fund the testnet account
        $response = $this->sdk->friendbot()->fundAccount($publicKey);
        return $response;
    }

    /**
     * Get wallet balance
     */
    public function getWalletBalance($publicKey)
    {
        $account = $this->sdk->accounts()->account($publicKey);
        $balances = [];

        foreach ($account->getBalances() as $balance) {
            $balances[] = [
                'asset_type' => $balance->getAssetType(),
                'balance' => $balance->getBalance(),
                'asset_code' => $balance->getAssetCode(),
                'asset_issuer' => $balance->getAssetIssuer()
            ];
        }

        return $balances;
    }

    /**
     * Send payment
     */
    public function sendPayment(Wallet $senderWallet, $destinationAddress, $amount, $assetCode = 'XLM')
    {
        // Decrypt the secret key
        $secretKey = decrypt($senderWallet->secret_key);
        $sourceKeypair = Keypair::fromSecretSeed($secretKey);

        // Get the account sequence number
        $account = $this->sdk->accounts()->account($senderWallet->public_key);

        // Create transaction
        $transaction = (new \Soneso\StellarSDK\TransactionBuilder($account))
            ->addOperation(
                \Soneso\StellarSDK\PaymentOperation::native(
                    $destinationAddress,
                    $amount
                )
            )
            ->build();

        // Sign the transaction
        $transaction->sign($sourceKeypair, $this->sdk->getNetwork());

        // Submit the transaction
        $response = $this->sdk->submitTransaction($transaction);

        return $response;
    }
}
