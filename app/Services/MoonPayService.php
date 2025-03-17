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

    public function createTransaction($userId, $amount, $currencyCode = 'xlm')
    {
        // Generate a signature for the request
        $signature = $this->generateSignature([
            'userId' => $userId,
            'amount' => $amount,
            'currencyCode' => $currencyCode
        ]);

        $response = $this->client->post($this->baseUrl . '/transactions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'X-Signature' => $signature
            ],
            'json' => [
                'userId' => $userId,
                'amount' => $amount,
                'currencyCode' => $currencyCode,
                'walletAddress' => $this->getUserStellarAddress($userId),
                'returnUrl' => route('moonpay.callback')
            ]
        ]);

        return json_decode($response->getBody()->getContents(), true);
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

    public function createBuyTransaction($userId, $cryptoCurrency, $amount, $walletAddress, $returnUrl)
    {
        try {
            $response = $this->client->post('/v1/transactions', [
                'json' => [
                    'customerId' => $userId,
                    'currencyCode' => $cryptoCurrency,
                    'baseCurrencyAmount' => $amount,
                    'walletAddress' => $walletAddress,
                    'returnUrl' => $returnUrl,
                    'externalTransactionId' => $this->generateTransactionId()
                ]
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('MoonPay API Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getTransaction($transactionId)
    {
        try {
            $response = $this->client->get("/v1/transactions/{$transactionId}");
            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('MoonPay API Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function verifyWebhookSignature($payload, $signature)
    {
        $computedSignature = hash_hmac(
            'sha256',
            $payload,
            config('services.moonpay.webhook_secret')
        );

        return hash_equals($computedSignature, $signature);
    }

    private function generateTransactionId()
    {
        return uniqid('tx_', true);
    }

    public function isMoonPayEnabled(): bool
    {
        return $this->moonpayEnabled;
    }
}
