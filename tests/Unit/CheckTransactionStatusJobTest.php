<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Jobs\CheckTransactionStatus;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Remittance;
use App\Services\StellarWalletService;
use Mockery;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;

class CheckTransactionStatusJobTest extends TestCase
{
    use RefreshDatabase;

    protected $stellarWalletServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a settings record with all required fields
        \App\Models\Settings::create([
            'app_name' => 'RemittEase',
            'app_version' => '1.0.0',
            'currency' => 'USD',
            'default_currency' => 'USD',
            'transaction_fee' => 0.025,
            'min_transaction_limit' => 10,
            'max_transaction_limit' => 10000,
        ]);

        // Create the admin role for testing
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Create an admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@remittease.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
            ]
        );
        $admin->assignRole('admin');

        // Mock the StellarWalletService
        $this->stellarWalletServiceMock = Mockery::mock(StellarWalletService::class);
        $this->app->instance(StellarWalletService::class, $this->stellarWalletServiceMock);

        // Disable queueing for the test
        Queue::fake();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_job_updates_transaction_status_to_completed(): void
    {
        // Create a user
        $user = User::factory()->create();

        // Create a pending transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => 'crypto_transfer',
            'amount' => 100,
            'asset_code' => 'XLM',
            'currency' => 'XLM',
            'recipient_address' => 'RECIPIENT_ADDRESS',
            'status' => 'pending',
            'transaction_hash' => 'transaction_hash_123',
            'reference' => 'REF123'
        ]);

        // Set up the StellarWalletService mock to return a successful result
        $this->stellarWalletServiceMock->shouldReceive('checkTransactionStatus')
            ->once()
            ->with('transaction_hash_123')
            ->andReturn([
                'success' => true,
                'message' => 'Transaction completed successfully',
                'details' => [
                    'hash' => 'transaction_hash_123',
                    'ledger' => 12345,
                    'created_at' => '2025-04-09T00:00:00Z'
                ]
            ]);

        // Run the job
        $job = new CheckTransactionStatus($transaction->id);
        $job->handle($this->stellarWalletServiceMock);

        // Assert that the transaction status was updated to "completed"
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'status' => 'completed'
        ]);
    }

    public function test_job_updates_transaction_status_to_failed(): void
    {
        // Create a user
        $user = User::factory()->create();

        // Create a pending transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => 'crypto_transfer',
            'amount' => 100,
            'asset_code' => 'XLM',
            'currency' => 'XLM',
            'recipient_address' => 'RECIPIENT_ADDRESS',
            'status' => 'pending',
            'transaction_hash' => 'transaction_hash_456',
            'reference' => 'REF456'
        ]);

        // Set up the StellarWalletService mock to return a failed result
        $this->stellarWalletServiceMock->shouldReceive('checkTransactionStatus')
            ->once()
            ->with('transaction_hash_456')
            ->andReturn([
                'success' => false,
                'message' => 'Transaction failed on blockchain',
            ]);

        // Run the job
        $job = new CheckTransactionStatus($transaction->id);
        $job->handle($this->stellarWalletServiceMock);

        // Assert that the transaction status was updated to "failed"
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'status' => 'failed',
            'failure_reason' => 'Transaction failed on blockchain'
        ]);
    }

    public function test_job_updates_remittance_status_when_transaction_completes(): void
    {
        // Create a user
        $user = User::factory()->create();

        // Create a remittance
        $remittance = Remittance::create([
            'user_id' => $user->id,
            'amount' => 200,
            'currency' => 'NGN',
            'status' => 'pending',
            'bank_code' => '044',
            'account_number' => '1234567890',
            'narration' => 'Test remittance',
            'phone' => '1234567890',
            'fee_amount' => 5,
            'total_amount' => 205,
            'reference' => 'RMTEASE_123456'
        ]);

        // Create a pending transaction linked to the remittance
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => 'remittance',
            'amount' => 205, // Including fee
            'asset_code' => 'XLM',
            'currency' => 'XLM',
            'recipient_address' => 'ADMIN_ADDRESS',
            'status' => 'pending',
            'transaction_hash' => 'transaction_hash_789',
            'reference' => 'REF789',
            'remittance_id' => $remittance->id
        ]);

        // Set up the StellarWalletService mock to return a successful result
        $this->stellarWalletServiceMock->shouldReceive('checkTransactionStatus')
            ->once()
            ->with('transaction_hash_789')
            ->andReturn([
                'success' => true,
                'message' => 'Transaction completed successfully',
                'details' => [
                    'hash' => 'transaction_hash_789',
                    'ledger' => 12345,
                    'created_at' => '2025-04-09T00:00:00Z'
                ]
            ]);

        // Run the job
        $job = new CheckTransactionStatus($transaction->id);
        $job->handle($this->stellarWalletServiceMock);

        // Assert that the transaction status was updated to "completed"
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'status' => 'completed'
        ]);

        // Assert that the remittance status was updated to "processing"
        $this->assertDatabaseHas('remittances', [
            'id' => $remittance->id,
            'status' => 'processing'
        ]);
    }

    public function test_job_handles_missing_transaction(): void
    {
        // Set up the service mock to expect no calls
        $this->stellarWalletServiceMock->shouldNotReceive('checkTransactionStatus');

        // Run the job with a non-existent transaction ID
        $job = new CheckTransactionStatus(999999);
        $job->handle($this->stellarWalletServiceMock);

        // No assertion needed, just check that no exception was thrown
        $this->assertTrue(true);
    }

    public function test_job_skips_non_pending_transactions(): void
    {
        // Create a user
        $user = User::factory()->create();

        // Create a completed transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => 'crypto_transfer',
            'amount' => 100,
            'asset_code' => 'XLM',
            'currency' => 'XLM',
            'recipient_address' => 'RECIPIENT_ADDRESS',
            'status' => 'completed', // Already completed, should be skipped
            'transaction_hash' => 'transaction_hash_123',
            'reference' => 'REF123'
        ]);

        // Set up the service mock to expect no calls
        $this->stellarWalletServiceMock->shouldNotReceive('checkTransactionStatus');

        // Run the job
        $job = new CheckTransactionStatus($transaction->id);
        $job->handle($this->stellarWalletServiceMock);

        // Assert that the transaction status remains "completed"
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'status' => 'completed'
        ]);
    }

    public function test_job_handles_missing_transaction_hash(): void
    {
        // Create a user
        $user = User::factory()->create();

        // Create a pending transaction without a transaction hash
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => 'crypto_transfer',
            'amount' => 100,
            'asset_code' => 'XLM',
            'currency' => 'XLM',
            'recipient_address' => 'RECIPIENT_ADDRESS',
            'status' => 'pending',
            'transaction_hash' => null, // No transaction hash
            'reference' => 'REF123'
        ]);

        // Set up the service mock to expect no calls
        $this->stellarWalletServiceMock->shouldNotReceive('checkTransactionStatus');

        // Run the job
        $job = new CheckTransactionStatus($transaction->id);
        $job->handle($this->stellarWalletServiceMock);

        // Assert that the transaction status was updated to "failed"
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'status' => 'failed',
            'failure_reason' => 'No transaction hash available for verification'
        ]);
    }
}
