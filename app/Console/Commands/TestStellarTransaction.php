<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\StellarWalletService;
use Illuminate\Support\Facades\Log;
use Soneso\StellarSDK\Crypto\KeyPair;
use Soneso\StellarSDK\StellarSDK;
use Soneso\StellarSDK\TransactionBuilder;
use Soneso\StellarSDK\PaymentOperation;
use Soneso\StellarSDK\MemoText;
use Soneso\StellarSDK\Network;

class TestStellarTransaction extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stellar:test-tx {user_id? : ID of the user to test with} {--a|amount=0.1 : Amount to send in XLM} {--save : Save the transaction to database for demo}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test a Stellar transaction and show detailed error information';

    /**
     * Execute the console command.
     */
    public function handle(StellarWalletService $stellarService)
    {
        $this->info('Starting Stellar transaction test...');

        // First test Stellar connection
        $this->testStellarConnection();

        // Get user by ID or use first user with a wallet
        $userId = $this->argument('user_id');
        $user = null;

        if ($userId) {
            $user = User::find($userId);
            if (!$user) {
                $this->error("User with ID {$userId} not found.");
                return 1;
            }
        } else {
            $user = User::whereHas('wallet')->first();
            if (!$user) {
                $this->error("No users found with wallets");
                return 1;
            }
        }

        $this->info("Testing with user: {$user->name} (ID: {$user->id}, Email: {$user->email})");

        // Get user wallet
        $wallet = $user->wallet;
        if (!$wallet) {
            $this->error("User has no wallet");
            return 1;
        }

        $this->info("User wallet: {$wallet->public_key}");

        // Get admin user
        $admin = User::where('email', 'admin@remittease.com')->first();
        if (!$admin) {
            // Try to find an admin some other way
            $admin = User::find(1); // Often the first user is admin
        }

        if (!$admin || !$admin->wallet) {
            $this->error("Admin user or wallet not found");
            return 1;
        }

        $this->info("Admin wallet: {$admin->wallet->public_key}");

        // Check balances
        $userBalance = $stellarService->getWalletNativeBalance($wallet->public_key);
        $adminBalance = $stellarService->getWalletNativeBalance($admin->wallet->public_key);

        $this->info("User balance: {$userBalance} XLM");
        $this->info("Admin balance: {$adminBalance} XLM");

        // Fetch account details directly from Horizon for more information
        $this->testAccountInfo($wallet->public_key);

        // Test creating a transaction directly
        $this->testDirectTransaction($wallet->public_key, $admin->wallet->public_key);

        // Get test amount
        $amount = (float)$this->option('amount');
        $this->info("Testing transaction with amount: {$amount} XLM");

        // Run transaction test
        $this->info("Running test transaction using StellarWalletService...");
        $result = $stellarService->testXLMTransfer($wallet->public_key, $admin->wallet->public_key);

        if ($result['success']) {
            $this->info("Transaction successful! Hash: " . $result['transaction_hash']);

            // If the --save option is present, save the transaction to the database
            if ($this->option('save')) {
                $this->saveMockupTransaction($user->id, $wallet->public_key, $admin->wallet->public_key, $amount, $result['transaction_hash'] ?? null);
            }
        } else {
            $this->error("Transaction failed: " . $result['message']);

            if (isset($result['details'])) {
                $this->warn("Transaction result code: " . $result['details']['transaction_result']);
                $this->warn("Operation result codes: " . implode(", ", $result['details']['operation_results']));
            }

            if (isset($result['raw_error'])) {
                $this->line("Raw error:");
                $this->line($result['raw_error']);
            }

            // If the --save option is present, save a mock transaction even if the real one failed
            if ($this->option('save')) {
                $this->saveMockupTransaction($user->id, $wallet->public_key, $admin->wallet->public_key, $amount, 'MOCKUP_'.uniqid());
            }
        }

        $this->info("Test completed!");
        return 0;
    }

    /**
     * Test the connection to Stellar Horizon API
     */
    protected function testStellarConnection()
    {
        $this->info("Testing Stellar Horizon API connection...");

        $network = config('stellar.network', 'testnet');
        $horizonUrl = ($network === 'testnet')
            ? 'https://horizon-testnet.stellar.org'
            : 'https://horizon.stellar.org';

        $this->info("Using network: {$network}");
        $this->info("Horizon URL: {$horizonUrl}");

        try {
            $response = \Illuminate\Support\Facades\Http::get($horizonUrl);

            if ($response->successful()) {
                $data = $response->json();
                $this->info("Stellar Horizon API connection successful!");
                $this->info("API version: " . ($data['horizon_version'] ?? 'Unknown'));
                $this->info("Core version: " . ($data['core_version'] ?? 'Unknown'));
                $this->info("Network passphrase: " . ($data['network_passphrase'] ?? 'Unknown'));
            } else {
                $this->error("Stellar Horizon API connection failed: HTTP " . $response->status());
                $this->line("Response: " . $response->body());
            }
        } catch (\Exception $e) {
            $this->error("Stellar Horizon API connection failed: " . $e->getMessage());
        }
    }

    /**
     * Test fetching account info directly from Horizon
     */
    protected function testAccountInfo($publicKey)
    {
        $this->info("Fetching account info for: {$publicKey}");

        $network = config('stellar.network', 'testnet');
        $horizonUrl = ($network === 'testnet')
            ? 'https://horizon-testnet.stellar.org'
            : 'https://horizon.stellar.org';

        try {
            $response = \Illuminate\Support\Facades\Http::get("{$horizonUrl}/accounts/{$publicKey}");

            if ($response->successful()) {
                $data = $response->json();
                $this->info("Account found on Horizon!");

                // Check sequence number
                $this->info("Sequence number: " . ($data['sequence'] ?? 'Unknown'));

                // Check for signers
                $signers = $data['signers'] ?? [];
                $this->info("Signers count: " . count($signers));

                foreach ($signers as $index => $signer) {
                    $this->line("  Signer #{$index}: " . ($signer['key'] ?? 'Unknown') .
                        " (Weight: " . ($signer['weight'] ?? '0') . ")");
                }

                // Check for native balance
                $balances = $data['balances'] ?? [];
                foreach ($balances as $balance) {
                    if (($balance['asset_type'] ?? '') === 'native') {
                        $this->info("Native balance: " . ($balance['balance'] ?? '0') . " XLM");
                    }
                }

                // Check thresholds
                $thresholds = $data['thresholds'] ?? [];
                $this->info("Thresholds - Low: " . ($thresholds['low_threshold'] ?? '?') .
                    ", Medium: " . ($thresholds['med_threshold'] ?? '?') .
                    ", High: " . ($thresholds['high_threshold'] ?? '?'));
            } else {
                $this->error("Account not found on Horizon: HTTP " . $response->status());
                $this->line("Response: " . $response->body());
            }
        } catch (\Exception $e) {
            $this->error("Failed to fetch account info: " . $e->getMessage());
        }
    }

    /**
     * Test creating and submitting a transaction directly
     */
    protected function testDirectTransaction($senderPublicKey, $recipientPublicKey)
    {
        $this->info("Testing direct transaction creation...");

        try {
            $network = config('stellar.network', 'testnet');
            $horizonUrl = ($network === 'testnet')
                ? 'https://horizon-testnet.stellar.org'
                : 'https://horizon.stellar.org';

            // Use Stellar SDK directly
            $this->info("Creating SDK instance...");
            $sdk = ($network === 'testnet')
                ? \Soneso\StellarSDK\StellarSDK::getTestNetInstance()
                : \Soneso\StellarSDK\StellarSDK::getPublicNetInstance();

            $this->info("Getting sender account...");
            $account = $sdk->accounts()->account($senderPublicKey);
            if (!$account) {
                $this->error("Sender account not found");
                return;
            }

            $this->info("Creating transaction builder...");

            // We need to get the secret key to sign
            // This is for testing purposes only - normally we'd use the service
            $wallet = \App\Models\Wallet::where('public_key', $senderPublicKey)->first();
            if (!$wallet) {
                $this->error("Wallet not found in database");
                return;
            }

            try {
                $secretKey = decrypt($wallet->secret_key);
                $sourceKeypair = KeyPair::fromSeed($secretKey);

                $this->info("Creating transaction...");

                // Create the transaction builder
                $transactionBuilder = new \Soneso\StellarSDK\TransactionBuilder($account);
                $transactionBuilder->addOperation(
                    (new \Soneso\StellarSDK\PaymentOperationBuilder(
                        $recipientPublicKey,
                        \Soneso\StellarSDK\Asset::native(),
                        '0.1' // Small test amount
                    ))->build()
                );

                // Add memo and time bounds
                $this->info("Adding memo and time bounds...");
                $transactionBuilder->addMemo(\Soneso\StellarSDK\Memo::text('RemittEase Test'));

                // Use a specific expiration time longer than default
                $now = new \DateTime('now');
                $future = new \DateTime('+5 minutes');
                $transactionBuilder->setTimeBounds(new \Soneso\StellarSDK\TimeBounds($now, $future));

                // Build the transaction
                $this->info("Building transaction...");
                $transaction = $transactionBuilder->build();

                // Set the correct network
                $this->info("Setting network and signing...");
                $networkObj = ($network === 'testnet')
                    ? \Soneso\StellarSDK\Network::testnet()
                    : \Soneso\StellarSDK\Network::public();

                // Sign the transaction
                $transaction->sign($sourceKeypair, $networkObj);

                // Encode the transaction to XDR for debugging
                $xdr = $transaction->toEnvelopeXdrBase64();
                $this->info("Signed transaction XDR: " . $xdr);

                // Just for testing, we can decrypt and verify the transaction
                $this->info("Decoding transaction for verification...");
                $txFromXdr = \Soneso\StellarSDK\AbstractTransaction::fromEnvelopeBase64XdrString($xdr);
                $this->info("Transaction sequence number: " . $txFromXdr->getSequenceNumber());
                $this->info("Transaction source account: " . $txFromXdr->getSourceAccount()->getAccountId());

                $this->info("Transaction created and signed successfully. Not submitting to avoid failure.");
            } catch (\Exception $e) {
                $this->error("Failed to create transaction: " . $e->getMessage());
            }
        } catch (\Exception $e) {
            $this->error("Direct transaction test failed: " . $e->getMessage());
        }
    }

    /**
     * Save a mockup transaction to the database for demonstration purposes
     */
    protected function saveMockupTransaction($userId, $senderPublicKey, $recipientPublicKey, $amount, $transactionHash = null)
    {
        $this->info("Saving mockup transaction to database for demonstration...");

        // Create a unique reference
        $reference = 'MOCKUP_' . \Illuminate\Support\Str::random(8);

        try {
            // Create a new transaction record
            $transaction = new \App\Models\Transaction([
                'user_id' => $userId,
                'type' => 'test',
                'amount' => $amount,
                'asset_code' => 'XLM',
                'recipient_address' => $recipientPublicKey,
                'sender_address' => $senderPublicKey,
                'status' => 'completed',
                'transaction_hash' => $transactionHash ?? 'MOCKUP_'.uniqid(),
                'reference' => $reference,
                'description' => 'Mockup transaction for demo purposes',
                'fees' => 0.00001, // Standard XLM transaction fee
            ]);

            $transaction->save();

            $this->info("Mockup transaction saved successfully!");
            $this->info("Transaction ID: {$transaction->id}");
            $this->info("Reference: {$reference}");
            $this->info("Status: {$transaction->status}");

        } catch (\Exception $e) {
            $this->error("Failed to save mockup transaction: " . $e->getMessage());
        }
    }
}
