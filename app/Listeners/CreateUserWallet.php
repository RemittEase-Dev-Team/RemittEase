<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Services\StellarWalletService;

class CreateUserWallet implements ShouldQueue
{
    protected $walletService;

    /**
     * Create the event listener.
     */
    public function __construct(StellarWalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Handle the event.
     */
    public function handle(Registered $event)
    {
        // Create a wallet for the newly registered user
        $this->walletService->createWalletForUser($event->user);
    }
}
