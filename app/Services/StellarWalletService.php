<?php

namespace App\Services;

use Soneso\StellarSDK\Crypto\KeyPair;
use Soneso\StellarSDK\StellarSDK;
use App\Models\User;
use App\Models\Wallet;
use App\Services\RemitteaseContractInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

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
        try {
            // Decrypt the secret key
            $secretKey = decrypt($senderWallet->secret_key);
            $sourceKeypair = KeyPair::fromSeed($secretKey);

            // Get the account
            $account = $this->sdk->accounts()->account($senderWallet->public_key);

            // Check if destination account exists
            try {
                $this->sdk->accounts()->account($destinationAddress);
            } catch (\Exception $e) {
                throw new \Exception('Destination account does not exist');
            }

            // Check if sender has sufficient balance
            $senderBalance = 0;
            foreach ($account->getBalances() as $balance) {
                if ($balance->getAssetType() === 'native') {
                    $senderBalance = floatval($balance->getBalance());
                    break;
                }
            }

            // Ensure minimum XLM reserve (2 XLM) plus transaction fee (0.00001 XLM)
            $minimumBalance = 2.00001;
            $totalRequired = $amount + $minimumBalance;

            if ($senderBalance < $totalRequired) {
                throw new \Exception(
                    "Insufficient balance. Required: {$totalRequired} XLM (including 2 XLM reserve), Available: {$senderBalance} XLM"
                );
            }

            // Create the transaction
            $transaction = (new \Soneso\StellarSDK\TransactionBuilder($account))
                ->addOperation((new \Soneso\StellarSDK\PaymentOperationBuilder(
                    $destinationAddress,
                    \Soneso\StellarSDK\Asset::native(),
                    strval($amount) // Convert to string to avoid precision issues
                ))->build()
                )
                ->addMemo(\Soneso\StellarSDK\Memo::text('RemittEase Transfer'))
                ->setTimeBounds(new \Soneso\StellarSDK\TimeBounds(new \DateTime('now'), new \DateTime('+60 seconds'))) // 60 seconds timeout
                ->build();

            // Get the correct network
            $network = $this->network === 'testnet'
                ? \Soneso\StellarSDK\Network::testnet()
                : \Soneso\StellarSDK\Network::public();

            // Sign and submit the transaction
            $transaction->sign($sourceKeypair, $network);

            try {
                $response = $this->sdk->submitTransaction($transaction);

                if ($response->isSuccessful()) {
                    $hash = $response->getHash();
                    Log::info("Transfer successful: {$amount} {$assetCode} from {$senderWallet->public_key} to {$destinationAddress}, hash: {$hash}");

                    // Record the transaction in the contract if possible
                    try {
                        $this->contractInterface->recordTransaction(
                            $senderWallet->public_key,
                            $destinationAddress,
                            $amount,
                            'payment'
                        );
                    } catch (\Exception $e) {
                        Log::warning('Failed to record transaction in contract: ' . $e->getMessage());
                        // Don't fail if contract recording fails
                    }

                    return [
                        'success' => true,
                        'transaction_hash' => $hash,
                        'message' => 'Transfer completed successfully'
                    ];
                } else {
                    // If we get here, the transaction failed
                    $extras = $response->getExtras();
                    $resultCodes = $extras->getResultCodes();

                    $txResultCode = $resultCodes->getTransactionResultCode() ?? 'unknown';
                    $opResultCodes = $resultCodes->getOperationResultCodes() ?? ['unknown'];

                    $errorDetails = [
                        'transaction_result' => $txResultCode,
                        'operation_results' => $opResultCodes,
                        'raw_response' => json_encode($extras)
                    ];

                    $errorMessage = "Transaction failed with code: {$txResultCode}. Operation result: " . implode(', ', $opResultCodes);
                    Log::error('Stellar transaction failed: ' . $errorMessage, $errorDetails);

                    return [
                        'success' => false,
                        'message' => $errorMessage,
                        'details' => $errorDetails
                    ];
                }
            } catch (\Exception $e) {
                $errorMessage = 'Transaction submission failed: ' . $e->getMessage();
                Log::error($errorMessage);

                // Try to extract error codes from the exception message
                $rawResponse = null;
                try {
                    $errorReason = $e->getMessage();
                    Log::error('Full error details: ' . $errorReason);

                    // Check if error contains 'transaction_failed'
                    if (strpos($errorReason, 'transaction_failed') !== false) {
                        Log::warning('Transaction failed error detected');
                    }

                    // More aggressive pattern matching for JSON
                    if (preg_match('/\{.*"result_codes".*\}/s', $errorReason, $matches)) {
                        $rawResponse = $matches[0];
                        Log::info('Found JSON error details: ' . $rawResponse);

                        $responseData = json_decode($rawResponse, true);
                        Log::info('Parsed JSON response: ' . json_encode($responseData));

                        if (isset($responseData['result_codes']) || isset($responseData['extras']['result_codes'])) {
                            $resultCodes = $responseData['result_codes'] ?? $responseData['extras']['result_codes'] ?? null;

                            if ($resultCodes) {
                                $txCode = $resultCodes['transaction'] ?? 'unknown';
                                $opCodes = $resultCodes['operations'] ?? ['unknown'];

                                $detailedError = "Transaction failed with code: {$txCode}. Operation result: " . implode(', ', $opCodes);
                                Log::error("Detailed Stellar error: {$detailedError}");

                                return [
                                    'success' => false,
                                    'message' => $detailedError,
                                    'details' => [
                                        'transaction_result' => $txCode,
                                        'operation_results' => $opCodes,
                                        'raw_response' => $rawResponse
                                    ]
                                ];
                            }
                        }
                    } else {
                        Log::warning('Could not find JSON error details in: ' . substr($errorReason, 0, 200) . '...');
                    }
                } catch (\Exception $parseEx) {
                    Log::error("Failed to parse error response: " . $parseEx->getMessage());
                }

                return [
                    'success' => false,
                    'message' => $errorMessage,
                    'raw_error' => $e->getMessage()
                ];
            }

        } catch (\Exception $e) {
            Log::error('Payment failed: ' . $e->getMessage());
            throw new \Exception('Payment failed: ' . $e->getMessage());
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
                'native' => '0',    // XLM balance
                'USDC' => '0',      // USDC balance
                'NGNC' => '0',      // Nigerian Naira Coin
                'EURC' => '0',      // Euro Coin
                'GBPC' => '0',      // British Pound Coin
                'GHCC' => '0',      // Ghana Cedis Coin
                'contract' => '0'   // Soroban contract token balance
            ];

            // Get XLM and other asset balances
            foreach ($account->getBalances() as $balance) {
                if ($balance->getAssetType() === 'native') {
                    $balances['native'] = $balance->getBalance();
                } else {
                    $assetCode = $balance->getAssetCode();
                    if (in_array($assetCode, ['USDC', 'NGNC', 'EURC', 'GBPC', 'GHCC'])) {
                        $balances[$assetCode] = $balance->getBalance();
                    }
                }
            }

            // Get contract token balance using Soroban
            try {
                $contractBalance = $this->contractInterface->getTokenBalance($publicKey);
                if ($contractBalance) {
                    $balances['contract'] = $contractBalance;
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get contract token balance: ' . $e->getMessage());
            }

            // Log available balances for debugging
            Log::info('Wallet balances for ' . $publicKey . ':', $balances);

            return $balances;
        } catch (\Exception $e) {
            Log::error('Failed to get token balances: ' . $e->getMessage());
            return [
                'native' => '0',
                'USDC' => '0',
                'NGNC' => '0',
                'EURC' => '0',
                'GBPC' => '0',
                'GHCC' => '0',
                'contract' => '0'
            ];
        }
    }

    /**
     * Get available tokens for the wallet
     */
    public function getAvailableTokens($publicKey)
    {
        try {
            $account = $this->sdk->accounts()->account($publicKey);
            $availableTokens = [];

            // Check native XLM balance
            foreach ($account->getBalances() as $balance) {
                if ($balance->getAssetType() === 'native') {
                    $availableTokens[] = [
                        'code' => 'XLM',
                        'balance' => $balance->getBalance(),
                        'type' => 'native'
                    ];
                } else {
                    $assetCode = $balance->getAssetCode();
                    if (in_array($assetCode, ['USDC', 'NGNC', 'EURC', 'GBPC', 'GHCC'])) {
                        $availableTokens[] = [
                            'code' => $assetCode,
                            'balance' => $balance->getBalance(),
                            'type' => 'stellar',
                            'issuer' => $balance->getAssetIssuer()
                        ];
                    }
                }
            }

            // Get Soroban contract tokens
            try {
                $contractTokens = $this->contractInterface->getAvailableTokens($publicKey);
                if ($contractTokens) {
                    foreach ($contractTokens as $token) {
                        $availableTokens[] = [
                            'code' => $token['code'],
                            'balance' => $token['balance'],
                            'type' => 'soroban',
                            'contract_id' => $token['contract_id']
                        ];
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get Soroban contract tokens: ' . $e->getMessage());
            }

            return $availableTokens;
        } catch (\Exception $e) {
            Log::error('Failed to get available tokens: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Transfer funds from one wallet to another
     * Used for both crypto and cash remittances
     */
    public function transferFunds($senderPublicKey, $recipientPublicKey, $amount, $assetCode = 'XLM')
    {
        try {
            // Get sender wallet
            $senderWallet = Wallet::where('public_key', $senderPublicKey)->first();
            if (!$senderWallet) {
                return [
                    'success' => false,
                    'message' => 'Sender wallet not found'
                ];
            }

            // Calculate transaction fee (0.00001 XLM)
            $txFee = 0.00001;

            // Get the balance of the sender
            $balanceArray = $this->getWalletBalance($senderPublicKey);
            $senderBalance = 0;

            // Find the requested asset balance
            foreach ($balanceArray as $balance) {
                if ($assetCode === 'XLM' && $balance['asset_type'] === 'native') {
                    $senderBalance = floatval($balance['balance']);
                    break;
                } elseif ($balance['asset_code'] === $assetCode) {
                    $senderBalance = floatval($balance['balance']);
                    break;
                }
            }

            // Ensure minimum XLM reserve (2 XLM) plus transaction fee
            $minimumBalance = 2.00001;
            $totalRequired = ($assetCode === 'XLM') ? $amount + $minimumBalance : $minimumBalance;

            if ($senderBalance < $totalRequired) {
                return [
                    'success' => false,
                    'message' => "Insufficient balance. Required: {$totalRequired} XLM (including 2 XLM reserve), Available: {$senderBalance} XLM"
                ];
            }

            // Check if we need to create an account for the recipient
            $needToCreateAccount = false;
            try {
                $this->sdk->accounts()->account($recipientPublicKey);
            } catch (\Exception $e) {
                $needToCreateAccount = true;
            }

            // Decrypt the secret key
            $secretKey = decrypt($senderWallet->secret_key);
            $sourceKeypair = KeyPair::fromSeed($secretKey);

            // Get the account
            $account = $this->sdk->accounts()->account($senderPublicKey);

            // Prepare transaction builder
            $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);

            // If recipient account doesn't exist and we're sending XLM, create account
            if ($needToCreateAccount && $assetCode === 'XLM') {
                // Add create account operation
                $transactionBuilder->addOperation(
                    (new \Soneso\StellarSDK\CreateAccountOperationBuilder(
                        $recipientPublicKey,
                        strval(max(1, $amount)) // Ensure at least 1 XLM for account creation
                    ))->build()
                );
            } else {
                // Add payment operation for existing account
                if ($assetCode === 'XLM') {
                    // Native XLM payment
                    $transactionBuilder->addOperation(
                        (new \Soneso\StellarSDK\PaymentOperationBuilder(
                            $recipientPublicKey,
                            \Soneso\StellarSDK\Asset::native(),
                            strval($amount)
                        ))->build()
                    );
                } else {
                    // Custom asset payment - would need issuer information
                    // This is a placeholder - you'd need to implement token transfers
                    // based on your specific token implementation
                    return [
                        'success' => false,
                        'message' => 'Token transfers not implemented yet'
                    ];
                }
            }

            // Build the transaction
            $transaction = $transactionBuilder
                ->addMemo(\Soneso\StellarSDK\Memo::text('RemittEase Transfer'))
                ->setTimeBounds(new \Soneso\StellarSDK\TimeBounds(new \DateTime('now'), new \DateTime('+60 seconds'))) // 60 seconds timeout
                ->build();

            // Get the correct network
            $network = $this->network === 'testnet'
                ? \Soneso\StellarSDK\Network::testnet()
                : \Soneso\StellarSDK\Network::public();

            // Sign and submit the transaction
            $transaction->sign($sourceKeypair, $network);

            try {
                $response = $this->sdk->submitTransaction($transaction);

                if ($response->isSuccessful()) {
                    $hash = $response->getHash();
                    Log::info("Transfer successful: {$amount} {$assetCode} from {$senderPublicKey} to {$recipientPublicKey}, hash: {$hash}");

                    // Record the transaction in the contract if possible
                    try {
                        $this->contractInterface->recordTransaction(
                            $senderPublicKey,
                            $recipientPublicKey,
                            $amount,
                            'remittance'
                        );
                    } catch (\Exception $e) {
                        Log::warning('Failed to record transaction in contract: ' . $e->getMessage());
                        // Don't fail if contract recording fails
                    }

                    return [
                        'success' => true,
                        'transaction_hash' => $hash,
                        'message' => 'Transfer completed successfully'
                    ];
                } else {
                    // If we get here, the transaction failed
                    $extras = $response->getExtras();
                    $resultCodes = $extras->getResultCodes();

                    $txResultCode = $resultCodes->getTransactionResultCode() ?? 'unknown';
                    $opResultCodes = $resultCodes->getOperationResultCodes() ?? ['unknown'];

                    $errorDetails = [
                        'transaction_result' => $txResultCode,
                        'operation_results' => $opResultCodes,
                        'raw_response' => json_encode($extras)
                    ];

                    $errorMessage = "Transaction failed with code: {$txResultCode}. Operation result: " . implode(', ', $opResultCodes);
                    Log::error('Stellar transaction failed: ' . $errorMessage, $errorDetails);

                    return [
                        'success' => false,
                        'message' => $errorMessage,
                        'details' => $errorDetails
                    ];
                }
            } catch (\Exception $e) {
                $errorMessage = 'Transaction submission failed: ' . $e->getMessage();
                Log::error($errorMessage);

                // Try to extract error codes from the exception message
                $rawResponse = null;
                try {
                    $errorReason = $e->getMessage();
                    Log::error('Full error details: ' . $errorReason);

                    // Check if error contains 'transaction_failed'
                    if (strpos($errorReason, 'transaction_failed') !== false) {
                        Log::warning('Transaction failed error detected');
                    }

                    // More aggressive pattern matching for JSON
                    if (preg_match('/\{.*"result_codes".*\}/s', $errorReason, $matches)) {
                        $rawResponse = $matches[0];
                        Log::info('Found JSON error details: ' . $rawResponse);

                        $responseData = json_decode($rawResponse, true);
                        Log::info('Parsed JSON response: ' . json_encode($responseData));

                        if (isset($responseData['result_codes']) || isset($responseData['extras']['result_codes'])) {
                            $resultCodes = $responseData['result_codes'] ?? $responseData['extras']['result_codes'] ?? null;

                            if ($resultCodes) {
                                $txCode = $resultCodes['transaction'] ?? 'unknown';
                                $opCodes = $resultCodes['operations'] ?? ['unknown'];

                                $detailedError = "Transaction failed with code: {$txCode}. Operation result: " . implode(', ', $opCodes);
                                Log::error("Detailed Stellar error: {$detailedError}");

                                return [
                                    'success' => false,
                                    'message' => $detailedError,
                                    'details' => [
                                        'transaction_result' => $txCode,
                                        'operation_results' => $opCodes,
                                        'raw_response' => $rawResponse
                                    ]
                                ];
                            }
                        }
                    } else {
                        Log::warning('Could not find JSON error details in: ' . substr($errorReason, 0, 200) . '...');
                    }
                } catch (\Exception $parseEx) {
                    Log::error("Failed to parse error response: " . $parseEx->getMessage());
                }

                return [
                    'success' => false,
                    'message' => $errorMessage,
                    'raw_error' => $e->getMessage()
                ];
            }

        } catch (\Exception $e) {
            Log::error('Transfer failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Transfer failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check transaction status on the blockchain
     */
    public function checkTransactionStatus($transactionHash)
    {
        try {
            if (empty($transactionHash)) {
                return [
                    'success' => false,
                    'message' => 'No transaction hash provided'
                ];
            }

            // Query the transaction
            $transaction = $this->sdk->transactions()->transaction($transactionHash);

            if ($transaction) {
                // Check if successful
                $successful = $transaction->isSuccessful();

                if ($successful) {
                    return [
                        'success' => true,
                        'message' => 'Transaction completed successfully',
                        'details' => [
                            'hash' => $transactionHash,
                            'ledger' => $transaction->getLedger(),
                            'created_at' => $transaction->getCreatedAt()
                        ]
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Transaction failed on blockchain',
                        'details' => [
                            'hash' => $transactionHash,
                            'ledger' => $transaction->getLedger(),
                            'created_at' => $transaction->getCreatedAt()
                        ]
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'Transaction not found on blockchain'
                ];
            }
        } catch (\Exception $e) {
            Log::error('Failed to check transaction status: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to check transaction status: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get wallet's native XLM balance
     *
     * @param string $publicKey Stellar public key
     * @return float The native XLM balance
     */
    public function getWalletNativeBalance($publicKey)
    {
        try {
            $account = $this->sdk->accounts()->account($publicKey);
            $nativeBalance = 0;

            foreach ($account->getBalances() as $balance) {
                if ($balance->getAssetType() === 'native') {
                    $nativeBalance = floatval($balance->getBalance());
                    break;
                }
            }

            return $nativeBalance;
        } catch (\Exception $e) {
            Log::error('Failed to get native balance: ' . $e->getMessage());
            return 0; // Return 0 if account not found or error
        }
    }

    /**
     * Test an XLM transfer with a minimal amount to diagnose issues
     *
     * @param string $senderPublicKey The sender's public key
     * @param string $recipientPublicKey The recipient's public key
     * @return array Success status and details
     */
    public function testXLMTransfer($senderPublicKey, $recipientPublicKey)
    {
        try {
            // Get sender wallet
            $senderWallet = Wallet::where('public_key', $senderPublicKey)->first();
            if (!$senderWallet) {
                return [
                    'success' => false,
                    'message' => 'Sender wallet not found'
                ];
            }

            // Use a very small test amount
            $amount = 0.1; // 0.1 XLM

            // Get the balance of the sender
            $nativeXLMBalance = $this->getWalletNativeBalance($senderPublicKey);

            // Check if sender has sufficient balance (including 2 XLM reserve)
            $minimumBalance = 2.1; // 2 XLM reserve + our test amount + fee buffer

            if ($nativeXLMBalance < $minimumBalance) {
                return [
                    'success' => false,
                    'message' => "Insufficient balance for test. Required: {$minimumBalance} XLM, Available: {$nativeXLMBalance} XLM"
                ];
            }

            // Log test attempt details
            Log::info("Attempting test XLM transfer: {$amount} XLM from {$senderPublicKey} to {$recipientPublicKey}");
            Log::info("Sender balance: {$nativeXLMBalance} XLM");

            // Decrypt the secret key
            $secretKey = decrypt($senderWallet->secret_key);
            $sourceKeypair = KeyPair::fromSeed($secretKey);

            // Get the account
            $account = $this->sdk->accounts()->account($senderPublicKey);

            // Check recipient account existence
            $recipientExists = true;
            try {
                $this->sdk->accounts()->account($recipientPublicKey);
            } catch (\Exception $e) {
                $recipientExists = false;
                Log::warning("Recipient account does not exist: {$recipientPublicKey}");
            }

            // Create transaction builder
            $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);

            // Add appropriate operation based on recipient existence
            if (!$recipientExists) {
                Log::info("Adding CreateAccount operation for new recipient");
                $transactionBuilder->addOperation(
                    (new \Soneso\StellarSDK\CreateAccountOperationBuilder(
                        $recipientPublicKey,
                        strval($amount) // Use our small test amount
                    ))->build()
                );
            } else {
                Log::info("Adding Payment operation for existing recipient");
                $transactionBuilder->addOperation(
                    (new \Soneso\StellarSDK\PaymentOperationBuilder(
                        $recipientPublicKey,
                        \Soneso\StellarSDK\Asset::native(),
                        strval($amount)
                    ))->build()
                );
            }

            // Build transaction with extended expiration time
            $transaction = $transactionBuilder
                ->addMemo(\Soneso\StellarSDK\Memo::text('RemittEase Test'))
                ->setTimeBounds(new \Soneso\StellarSDK\TimeBounds(new \DateTime('now'), new \DateTime('+5 minutes')))
                ->build();

            // Get the correct network
            $network = $this->network === 'testnet'
                ? \Soneso\StellarSDK\Network::testnet()
                : \Soneso\StellarSDK\Network::public();

            // Sign and submit the transaction
            $transaction->sign($sourceKeypair, $network);

            try {
                $response = $this->sdk->submitTransaction($transaction);

                if ($response->isSuccessful()) {
                    $hash = $response->getHash();
                    Log::info("Test transfer successful: {$amount} XLM from {$senderPublicKey} to {$recipientPublicKey}, hash: {$hash}");

                    return [
                        'success' => true,
                        'message' => 'Test transfer completed successfully',
                        'transaction_hash' => $hash
                    ];
                } else {
                    // If we get here, the transaction failed
                    $extras = $response->getExtras();
                    $resultCodes = $extras->getResultCodes();

                    $txResultCode = $resultCodes->getTransactionResultCode() ?? 'unknown';
                    $opResultCodes = $resultCodes->getOperationResultCodes() ?? ['unknown'];

                    $errorDetails = [
                        'transaction_result' => $txResultCode,
                        'operation_results' => $opResultCodes,
                        'raw_response' => json_encode($extras)
                    ];

                    $errorMessage = "Test transaction failed with code: {$txResultCode}. Operation result: " . implode(', ', $opResultCodes);
                    Log::error('Stellar test transaction failed: ' . $errorMessage, $errorDetails);

                    return [
                        'success' => false,
                        'message' => $errorMessage,
                        'details' => $errorDetails
                    ];
                }
            } catch (\Exception $e) {
                $errorMessage = 'Test transaction submission failed: ' . $e->getMessage();
                Log::error($errorMessage);

                // Try to extract error codes from the exception message
                $rawResponse = null;
                try {
                    $errorReason = $e->getMessage();
                    Log::error('Full error details: ' . $errorReason);

                    // Check if error contains 'transaction_failed'
                    if (strpos($errorReason, 'transaction_failed') !== false) {
                        Log::warning('Transaction failed error detected');
                    }

                    // More aggressive pattern matching for JSON
                    if (preg_match('/\{.*"result_codes".*\}/s', $errorReason, $matches)) {
                        $rawResponse = $matches[0];
                        Log::info('Found JSON error details: ' . $rawResponse);

                        $responseData = json_decode($rawResponse, true);
                        Log::info('Parsed JSON response: ' . json_encode($responseData));

                        if (isset($responseData['result_codes']) || isset($responseData['extras']['result_codes'])) {
                            $resultCodes = $responseData['result_codes'] ?? $responseData['extras']['result_codes'] ?? null;

                            if ($resultCodes) {
                                $txCode = $resultCodes['transaction'] ?? 'unknown';
                                $opCodes = $resultCodes['operations'] ?? ['unknown'];

                                $detailedError = "Transaction failed with code: {$txCode}. Operation result: " . implode(', ', $opCodes);
                                Log::error("Detailed Stellar error: {$detailedError}");

                                return [
                                    'success' => false,
                                    'message' => $detailedError,
                                    'details' => [
                                        'transaction_result' => $txCode,
                                        'operation_results' => $opCodes,
                                        'raw_response' => $rawResponse
                                    ]
                                ];
                            }
                        }
                    } else {
                        Log::warning('Could not find JSON error details in: ' . substr($errorReason, 0, 200) . '...');
                    }
                } catch (\Exception $parseEx) {
                    Log::error("Failed to parse error response: " . $parseEx->getMessage());
                }

                return [
                    'success' => false,
                    'message' => $errorMessage,
                    'raw_error' => $e->getMessage()
                ];
            }
        } catch (\Exception $e) {
            Log::error('Test transfer failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Test transfer failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create a demo transaction record for demonstration purposes
     *
     * @param int $userId User ID
     * @param string $senderPublicKey Sender's public key
     * @param string $recipientPublicKey Recipient's public key
     * @param float $amount Amount to send
     * @param string|null $transactionHash Transaction hash (if available)
     * @return \App\Models\Transaction
     */
    public function createDemoTransaction($userId, $senderPublicKey, $recipientPublicKey, $amount, $transactionHash = null)
    {
        // Create a unique reference
        $reference = 'DEMO_' . Str::random(8);

        // Create a new transaction record
        $transaction = new \App\Models\Transaction([
            'user_id' => $userId,
            'type' => 'test',
            'amount' => $amount,
            'asset_code' => 'XLM',
            'recipient_address' => $recipientPublicKey,
            'sender_address' => $senderPublicKey,
            'status' => 'completed',
            'transaction_hash' => $transactionHash ?? 'DEMO_'.uniqid(),
            'reference' => $reference,
            'description' => 'Demo transaction for demonstration purposes',
            'fees' => 0.00001, // Standard XLM transaction fee
        ]);

        $transaction->save();

        return $transaction;
    }
}
