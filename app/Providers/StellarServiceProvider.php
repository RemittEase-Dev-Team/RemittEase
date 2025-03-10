<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\StellarWalletService;
use App\Services\RemitteaseContractInterface;
use Illuminate\Support\Facades\Log;
use StellarSDK\KeyPair;

class StellarServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(RemitteaseContractInterface::class, function ($app) {
            // For testing, generate a random keypair if no secret is provided
            if (app()->environment('local', 'testing') && !config('stellar.admin_secret')) {
                $keypair = KeyPair::random();
                config(['stellar.admin_secret' => $keypair->getSecretSeed()]);
            }

            return new RemitteaseContractInterface(
                config('stellar.remittease_contract_id')
            );
        });

        $this->app->singleton(StellarWalletService::class, function ($app) {
            return new StellarWalletService(
                $app->make(RemitteaseContractInterface::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
