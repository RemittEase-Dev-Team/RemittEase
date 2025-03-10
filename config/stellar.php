<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Stellar Network Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration settings for the Stellar network
    | integration in the application.
    |
    */

    // Network settings (testnet or public)
    'network' => env('STELLAR_NETWORK', 'testnet'),

    // Soroban RPC endpoints
    'soroban_rpc' => [
        'testnet' => 'https://soroban-testnet.stellar.org',
        'public' => 'https://soroban.stellar.org'
    ],

    // Network passphrases for signing transactions
    'network_passphrase' => [
        'testnet' => 'Test SDF Network ; September 2015',
        'public' => 'Public Global Stellar Network ; September 2015'
    ],

    // Remittease contract ID
    'remittease_contract_id' => env('REMITTEASE_CONTRACT_ID'),

    // Admin account for contract interactions
    'admin_secret' => env('STELLAR_ADMIN_SECRET'),

    // Friendbot URL for funding testnet accounts
    'friendbot_url' => 'https://friendbot.stellar.org',

    // Default fee for transactions (in stroops)
    'default_base_fee' => 100,

    // Default transaction timeout (in seconds)
    'transaction_timeout' => 30,
];
