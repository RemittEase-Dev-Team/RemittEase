<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Services\StellarWalletService;

class StellarIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_wallet_creation_for_user()
    {
        // Create a user
        $user = User::factory()->create();

        // Get the wallet service
        $walletService = app(StellarWalletService::class);

        // Create a wallet for the user
        $wallet = $walletService->createWalletForUser($user);

        // Assert wallet was created
        $this->assertNotNull($wallet);
        $this->assertEquals($user->id, $wallet->user_id);
        $this->assertNotEmpty($wallet->public_key);
    }
}
