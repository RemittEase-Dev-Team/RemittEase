<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

use App\Models\Settings;

class MoonPayService
{
    protected $client;
    protected $publicKey;
    protected $secretKey;
    protected $moonpayEnabled;

    public function __construct()
    {
        $this->publicKey = config('services.moonpay.public_key');
        $this->secretKey = config('services.moonpay.secret_key');
        $this->moonpayEnabled = Settings::first()->moonpay_enabled ?? true;

        $this->client = new Client([
            'base_uri' => 'https://api.moonpay.com/v3/',
            'headers' => [
                'Content-Type' => 'application/json',
                'X-API-Key' => $this->secretKey,
            ],
        ]);
    }

    public function createCustomer(array $data)
    {
        if (!$this->moonpayEnabled) {
            return null;
        }

        try {
            $response = $this->client->post('customers', [
                'json' => $data,
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('MoonPay createCustomer error: ' . $e->getMessage());
            return null;
        }
    }

    public function getCheckoutURL(array $queryParams)
    {
         if (!$this->moonpayEnabled) {
            return null;
        }

        $queryParams['apiKey'] = $this->publicKey;
        $queryString = http_build_query($queryParams);

        return 'https://buy.moonpay.com?' . $queryString;
    }

    public function handleWebhook(array $data)
    {
        // TODO: Implement webhook handling logic
        Log::info('MoonPay webhook received: ' . json_encode($data));
    }

    public function isMoonPayEnabled(): bool
    {
        return $this->moonpayEnabled;
    }
}
