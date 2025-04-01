<?php

namespace App\Services;

use Soneso\StellarSDK\Crypto\KeyPair;
use Soneso\StellarSDK\StellarSDK;
use App\Models\User;
use App\Models\Wallet;
use App\Services\RemitteaseContractInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class StellarWalletService
{
    protected $sdk;
    protected $contractInterface;
    protected $network;

    public function __construct(RemitteaseContractInterface $contractInterface)
    {
        $this->contractInterface = $contractInterface;

        // Initialize Stellar SDK (use testnet for development, switch to public for production)
        $this->network = config('stellar.network', 'testnet');
        if ($this->network === 'testnet') {
            $this->sdk = StellarSDK::getTestNetInstance();
        } else {
            $this->sdk = StellarSDK::getPublicNetInstance();
        }
    }

    /**
     * Create a new Stellar wallet for a user
     */
    public function createWalletForUser(User $user)
    {
        try {
            // First check if user already has a wallet in the database
            $existingWallet = Wallet::where('user_id', $user->id)->first();
            if ($existingWallet) {
                Log::info("Existing wallet found for user {$user->id}: {$existingWallet->public_key}");
                return $existingWallet;
            }

            // Generate a new Stellar keypair
            $keypair = KeyPair::random();
            $publicKey = $keypair->getAccountId();
            $secretKey = $keypair->getSecretSeed();

            // Create wallet in database FIRST
            $wallet = new Wallet();
            $wallet->user_id = $user->id;
            $wallet->public_key = $publicKey;
            $wallet->secret_key = encrypt($secretKey);
            $wallet->status = 'pending'; // Start with pending status
            $wallet->balance = 0;
            $wallet->is_verified = false;
            $wallet->save();

            Log::info("Created new wallet for user {$user->id}: {$publicKey}");

            // Fund the account on testnet only if not already funded
            if ($this->network === 'testnet') {
                try {
                    // Check if account exists first
                    try {
                        $this->sdk->accounts()->account($publicKey);
                        Log::info("Account {$publicKey} already exists, skipping funding");
                    } catch (\Exception $e) {
                        // Account doesn't exist, fund it
                        $fundingResult = $this->fundTestAccount($publicKey);
                        if ($fundingResult) {
                            Log::info("Successfully funded new account: {$publicKey}");
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to fund account {$publicKey}: " . $e->getMessage());
                    // Don't throw here, we can try funding later
                }
            }

            // Try to register with contract, but don't fail if it doesn't work
            try {
                $registerResult = $this->contractInterface->registerWallet($publicKey, $user->id);
                if (isset($registerResult['success']) && $registerResult['success']) {
                    $wallet->status = 'active';
                    $wallet->save();
                    Log::info("Registered wallet with contract: {$publicKey}");
                }
            } catch (\Exception $e) {
                Log::error("Failed to register wallet with contract: " . $e->getMessage());
                // Don't throw here, we can retry contract registration later
            }

            return $wallet;

        } catch (\Exception $e) {
            Log::error('Failed to create Stellar wallet: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Fund a testnet account
     */
    private function fundTestAccount($publicKey)
    {
        try {
            $friendbotUrl = config('stellar.friendbot_url');
            $response = Http::get("{$friendbotUrl}?addr={$publicKey}");

            if ($response->successful()) {
                Log::info("Successfully funded testnet account: {$publicKey}");
                return true;
            } else {
                Log::warning("Failed to fund testnet account: {$publicKey}. Response: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Failed to fund testnet account: {$publicKey}. Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get wallet balance
     */
    public function getWalletBalance($publicKey)
    {
        try {
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
        } catch (\Exception $e) {
            Log::error('Failed to get wallet balance: ' . $e->getMessage());

            // Return a default balance structure with 0 XLM
            return [
                [
                    'asset_type' => 'native',
                    'balance' => '0',
                    'asset_code' => null,
                    'asset_issuer' => null
                ]
            ];
        }
    }

    /**
     * Send payment
     */
    public function sendPayment(Wallet $senderWallet, $destinationAddress, $amount, $assetCode = 'XLM')
    {
        // Decrypt the secret key
        $secretKey = decrypt($senderWallet->secret_key);
        $sourceKeypair = KeyPair::fromSecretSeed($secretKey);

        try {
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

            if ($response->isSuccessful()) {
                // Record the transaction in the contract
                try {
                    $this->contractInterface->recordTransaction(
                        $senderWallet->public_key,
                        $destinationAddress,
                        $amount,
                        'payment'
                    );
                } catch (\Exception $e) {
                    // Log the error but continue - the blockchain transaction was successful
                    Log::warning('Failed to record transaction in contract: ' . $e->getMessage());
                }

                return [
                    'success' => true,
                    'hash' => $response->getHash(),
                    'message' => 'Payment sent successfully'
                ];
            } else {
                $errorCodes = $response->getExtras()->getResultCodes();
                throw new \Exception('Transaction failed: ' . json_encode($errorCodes));
            }
        } catch (\Exception $e) {
            Log::error('Failed to send payment: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify a wallet in the Remittease contract
     */
    public function verifyWallet(Wallet $wallet)
    {
        try {
            $result = $this->contractInterface->verifyWallet($wallet->public_key);

            if ($result['success']) {
                $wallet->is_verified = true;
                $wallet->save();

                return [
                    'success' => true,
                    'message' => 'Wallet verified successfully'
                ];
            } else {
                throw new \Exception($result['message'] ?? 'Verification failed');
            }
        } catch (\Exception $e) {
            Log::error('Failed to verify wallet: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get wallet details from the Remittease contract
     */
    public function getWalletDetails(Wallet $wallet)
    {
        try {
            return $this->contractInterface->getWalletDetails($wallet->public_key);
        } catch (\Exception $e) {
            Log::error('Failed to get wallet details: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update wallet status in the Remittease contract
     */
    public function updateWalletStatus(Wallet $wallet, $newStatus)
    {
        try {
            $result = $this->contractInterface->updateWalletStatus(
                $wallet->public_key,
                $newStatus
            );

            if (isset($result['success']) && $result['success']) {
                $wallet->status = $newStatus;
                $wallet->save();

                return [
                    'success' => true,
                    'message' => 'Wallet status updated successfully'
                ];
            } else {
                throw new \Exception($result['message'] ?? 'Update failed');
            }
        } catch (\Exception $e) {
            Log::error('Failed to update wallet status: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getTokenBalances($publicKey)
    {
        try {
            $account = $this->sdk->accounts()->account($publicKey);
            $balances = [
                'native' => '0', // XLM balance
                'token' => '0'   // Your token balance
            ];

            // Get XLM and other asset balances
            foreach ($account->getBalances() as $balance) {
                if ($balance->getAssetType() === 'native') {
                    $balances['native'] = $balance->getBalance();
                } else if ($balance->getAssetCode() === 'RMT') { // Your token code
                    $balances['token'] = $balance->getBalance();
                }
            }

            // Get contract token balance using Soroban
            try {
                $contractBalance = $this->contractInterface->getTokenBalance($publicKey);
                if ($contractBalance) {
                    $balances['token'] = $contractBalance;
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get contract token balance: ' . $e->getMessage());
            }

            return $balances;
        } catch (\Exception $e) {
            Log::error('Failed to get token balances: ' . $e->getMessage());
            return [
                'native' => '0',
                'token' => '0'
            ];
        }
    }
}
