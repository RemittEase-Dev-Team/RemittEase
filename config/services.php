<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('SES_ACCESS_KEY_ID'),
        'secret' => env('SES_SECRET_ACCESS_KEY'),
        'region' => env('SES_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'stellar' => [
        'network' => env('STELLAR_NETWORK', 'testnet'),
        'horizon_url' => env('HORIZON_URL', 'https://horizon-testnet.stellar.org'),
    ],

    'moonpay' => [
        'api_key' => env('MOONPAY_API_KEY'),
        'secret_key' => env('MOONPAY_SECRET_KEY'),
        'sandbox' => env('MOONPAY_SANDBOX', true),
    ],

    'yellowcard' => [
        'api_key' => env('YELLOWCARD_API_KEY'),
        'widget_key' => env('YELLOWCARD_WIDGET_KEY'),
        'webhook_secret' => env('YELLOWCARD_WEBHOOK_SECRET'),
        'sandbox' => env('YELLOWCARD_SANDBOX', true),
    ],

    'onfido' => [
        'api_token' => env('ONFIDO_API_TOKEN'),
        'webhook_token' => env('ONFIDO_WEBHOOK_TOKEN'),
    ],

    'flutterwave' => [
        'public_key' => env('FLUTTERWAVE_PUBLIC_KEY'),
        'secret_key' => env('FLUTTERWAVE_SECRET_KEY'),
        'base_url' => env('FLUTTERWAVE_BASE_URL', 'https://api.flutterwave.com'),
        'encryption_key' => env('FLUTTERWAVE_ENCRYPTION_KEY'),
        'webhook_secret' => env('FLUTTERWAVE_WEBHOOK_SECRET'),
        'sandbox' => env('FLUTTERWAVE_SANDBOX', true),
    ],

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
    ],

    'sparkpost' => [
        'secret' => env('SPARKPOST_SECRET'),
    ],

    'stripe' => [
        'model' => App\Models\User::class,
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook' => [
            'secret' => env('STRIPE_WEBHOOK_SECRET'),
            'tolerance' => env('STRIPE_WEBHOOK_TOLERANCE', 300),
        ],
    ],

    'linkio' => [
        'api_key' => env('LINKIO_API_KEY'),
        'sandbox' => env('LINKIO_SANDBOX', true),
    ],

];
