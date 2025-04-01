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
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
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
        'public_key' => env('MOONPAY_PUBLIC_KEY'),
        'secret_key' => env('MOONPAY_SECRET_KEY'),
        'base_url' => env('MOONPAY_BASE_URL', 'https://api.moonpay.com'),
    ],

    'yellowcard' => [
        'api_key' => env('YELLOWCARD_API_KEY'),
        'webhook_secret' => env('YELLOWCARD_WEBHOOK_SECRET'),
        'sandbox' => env('YELLOWCARD_SANDBOX', true),
        'widget_key' => env('YELLOWCARD_WIDGET_KEY'),
    ],

    'onfido' => [
        'api_token' => env('ONFIDO_API_TOKEN'),
        'webhook_token' => env('ONFIDO_WEBHOOK_TOKEN'),
    ],

];
