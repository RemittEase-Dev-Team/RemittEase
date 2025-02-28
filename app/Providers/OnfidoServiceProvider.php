<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Onfido\Configuration;
use Onfido\Api\DefaultApi;

class OnfidoServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(DefaultApi::class, function ($app) {
            $config = Configuration::getDefaultConfiguration()->setApiToken(env('ONFIDO_API_TOKEN'));
            return new DefaultApi(null, $config);
        });
    }
}
