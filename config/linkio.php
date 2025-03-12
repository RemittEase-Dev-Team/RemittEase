<?php

return [
    'api_key'        => env('LINKIO_API_KEY', ''),
    'api_secret'     => env('LINKIO_API_SECRET', ''),
    'base_url'       => env('LINKIO_BASE_URL', 'https://api.linkio.world/v1'),
    'webhook_secret' => env('LINKIO_WEBHOOK_SECRET', ''),
];
