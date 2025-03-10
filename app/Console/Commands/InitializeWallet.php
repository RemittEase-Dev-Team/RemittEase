<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\StellarWalletService;

class InitializeWallet extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wallet:initialize {email : The user\'s email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize a Stellar wallet for a user';

    /**
     * Execute the console command.
     */
    public function handle(StellarWalletService $walletService)
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found!");
            return 1;
        }

        if ($user->hasWallet()) {
            $this->info("User already has a wallet:");
            $this->info("Public Key: {$user->wallet->public_key}");
            $this->info("Balance: {$user->wallet->balance} XLM");
            $this->info("Status: {$user->wallet->status}");
            $this->info("Verified: " . ($user->wallet->is_verified ? 'Yes' : 'No'));
            return 0;
        }

        $this->info("Creating wallet for user {$user->name}...");

        try {
            $wallet = $walletService->createWalletForUser($user);

            $this->info("Wallet created successfully!");
            $this->info("Public Key: {$wallet->public_key}");
            $this->info("Balance: {$wallet->balance} XLM");
            $this->info("Status: {$wallet->status}");
            $this->info("Verified: " . ($wallet->is_verified ? 'Yes' : 'No'));

            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to create wallet: " . $e->getMessage());
            return 1;
        }
    }
}
