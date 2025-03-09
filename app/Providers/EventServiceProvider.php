<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Listeners\CreateUserWallet;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            CreateUserWallet::class,
            // Keep any other existing listeners here
        ],
        // Other events...
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }
}
