<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\StellarWalletService;
use App\Services\RemitteaseContractInterface;

class StellarServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(RemitteaseContractInterface::class, function ($app) {
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
