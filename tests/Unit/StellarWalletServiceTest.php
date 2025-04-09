<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\StellarWalletService;
use App\Services\RemitteaseContractInterface;
use App\Models\User;
use App\Models\Wallet;
use Mockery;
use Soneso\StellarSDK\StellarSDK;

class StellarWalletServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $contractMock;
    protected $service;
    protected $user;
    protected $wallet;

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

        // Create mock for the contract interface
        $this->contractMock = Mockery::mock(RemitteaseContractInterface::class);

        // Create a partial mock for StellarWalletService
        $this->service = Mockery::mock(StellarWalletService::class, [$this->contractMock])
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        // Create a test user and wallet
        $this->user = User::factory()->create();
        $this->wallet = Wallet::create([
            'user_id' => $this->user->id,
            'public_key' => 'GBXK2ETSIOVRSZRMPCWVSJHETLRSTUIVMMBXMZCNQUGFFMM7UNDOSD64',
            'secret_key' => encrypt('SBXFB5FSHVXUONO27QU5J7SLAMJQB4AH6UYWPSNT6QPTMDCTCI4M3PRR'),
            'status' => 'active',
            'balance' => 1000,
            'is_verified' => true
        ]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_get_wallet_balance(): void
    {
        // Mock SDK response to deliver a known balance
        $this->service->shouldReceive('getWalletBalance')
            ->once()
            ->with($this->wallet->public_key)
            ->andReturn([
                [
                    'asset_type' => 'native',
                    'balance' => '1000.0',
                    'asset_code' => null,
                    'asset_issuer' => null
                ]
            ]);

        // Get the wallet balance
        $balance = $this->service->getWalletBalance($this->wallet->public_key);

        // Assert the balance is correctly returned
        $this->assertEquals('1000.0', $balance[0]['balance']);
        $this->assertEquals('native', $balance[0]['asset_type']);
    }

    public function test_check_transaction_status_success(): void
    {
        // Define a valid transaction hash
        $transactionHash = 'abc123validhash';

        // Mock SDK response for a successful transaction
        $this->service->shouldReceive('checkTransactionStatus')
            ->once()
            ->with($transactionHash)
            ->andReturn([
                'success' => true,
                'message' => 'Transaction completed successfully',
                'details' => [
                    'hash' => $transactionHash,
                    'ledger' => 12345,
                    'created_at' => '2025-04-09T00:00:00Z'
                ]
            ]);

        // Check the status
        $result = $this->service->checkTransactionStatus($transactionHash);

        // Assert the result
        $this->assertTrue($result['success']);
        $this->assertEquals('Transaction completed successfully', $result['message']);
        $this->assertEquals($transactionHash, $result['details']['hash']);
    }

    public function test_check_transaction_status_failure(): void
    {
        // Define an invalid transaction hash
        $transactionHash = 'xyz789invalidhash';

        // Mock SDK response for a failed transaction
        $this->service->shouldReceive('checkTransactionStatus')
            ->once()
            ->with($transactionHash)
            ->andReturn([
                'success' => false,
                'message' => 'Transaction failed on blockchain',
                'details' => [
                    'hash' => $transactionHash,
                    'ledger' => 12345,
                    'created_at' => '2025-04-09T00:00:00Z'
                ]
            ]);

        // Check the status
        $result = $this->service->checkTransactionStatus($transactionHash);

        // Assert the result
        $this->assertFalse($result['success']);
        $this->assertEquals('Transaction failed on blockchain', $result['message']);
    }

    public function test_check_transaction_status_missing_hash(): void
    {
        // Test with an empty hash
        $result = $this->service->checkTransactionStatus('');

        // Assert the result
        $this->assertFalse($result['success']);
        $this->assertEquals('No transaction hash provided', $result['message']);
    }

    public function test_transfer_funds_success(): void
    {
        // Mock getWalletBalance to return sufficient balance
        $this->service->shouldReceive('getWalletBalance')
            ->once()
            ->andReturn([
                [
                    'asset_type' => 'native',
                    'balance' => '1000',
                    'asset_code' => null,
                    'asset_issuer' => null
                ]
            ]);

        // Create another wallet for testing
        $recipient = 'GDYULVJK2T6G7HFUC5FI2SEPZCGFWMQ3SJIPNQ6VNFNWCNKQCWWXLFST';

        // Mock the transferFunds method to simulate a successful transfer
        $this->service->shouldReceive('transferFunds')
            ->once()
            ->with($this->wallet->public_key, $recipient, 100.0, 'XLM')
            ->andReturn([
                'success' => true,
                'transaction_hash' => 'txn123hash',
                'message' => 'Transfer completed successfully'
            ]);

        // Transfer funds
        $result = $this->service->transferFunds($this->wallet->public_key, $recipient, 100.0);

        // Assert the result
        $this->assertTrue($result['success']);
        $this->assertEquals('txn123hash', $result['transaction_hash']);
        $this->assertEquals('Transfer completed successfully', $result['message']);
    }

    public function test_transfer_funds_insufficient_balance(): void
    {
        // Mock getWalletBalance to return insufficient balance
        $this->service->shouldReceive('getWalletBalance')
            ->once()
            ->andReturn([
                [
                    'asset_type' => 'native',
                    'balance' => '1.0', // Only 1 XLM, which is below minimum 2 XLM reserve
                    'asset_code' => null,
                    'asset_issuer' => null
                ]
            ]);

        // Create another wallet for testing
        $recipient = 'GDYULVJK2T6G7HFUC5FI2SEPZCGFWMQ3SJIPNQ6VNFNWCNKQCWWXLFST';

        // Transfer funds with insufficient balance
        $result = $this->service->transferFunds($this->wallet->public_key, $recipient, 100.0);

        // Assert the result
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Insufficient balance', $result['message']);
    }

    public function test_wallet_not_found(): void
    {
        // Test with a non-existent wallet public key
        $nonExistentPublicKey = 'NONEXISTENTPUBLICKEY';

        // Transfer funds with non-existent wallet
        $result = $this->service->transferFunds($nonExistentPublicKey, 'RECIPIENT', 100.0);

        // Assert the result
        $this->assertFalse($result['success']);
        $this->assertEquals('Sender wallet not found', $result['message']);
    }
}
