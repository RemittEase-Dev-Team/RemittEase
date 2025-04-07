<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

use App\Models\Settings;
use App\Models\Transaction;

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
            'base_uri' => 'https://api.moonpay.com/v1/',
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

    public function createTransaction(array $data)
    {
        try {
            // Validate required fields
            if (empty($data['amount']) || empty($data['wallet_address'])) {
                return [
                    'success' => false,
                    'message' => 'Missing required fields',
                    'data' => ['error' => 'amount and wallet_address are required']
                ];
            }

            // Prepare transaction data
            $transactionData = [
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'XLM',
                'wallet_address' => $data['wallet_address'],
                'network' => 'stellar',
                'customer_email' => auth()->user()->email,
                'customer_name' => auth()->user()->name,
                'customer_id' => auth()->id(),
                'external_transaction_id' => $data['transaction_id'],
                'metadata' => $data['metadata'] ?? []
            ];

            // Log the request
            Log::info('MoonPay Transaction Request', [
                'data' => $transactionData,
                'user_id' => auth()->id()
            ]);

            // Create transaction record first
            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'provider' => 'moonpay',
                'external_id' => $data['transaction_id'],
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'XLM',
                'recipient_address' => $data['wallet_address'],
                'type' => 'deposit',
                'status' => 'pending',
                'metadata' => $data['metadata'] ?? [],
                'error_message' => null
            ]);

            return [
                'success' => true,
                'message' => 'Transaction created successfully',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'external_id' => $transaction->external_id,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'created_at' => $transaction->created_at->toISOString()
                ]
            ];

        } catch (\Exception $e) {
            Log::error('MoonPay Transaction Creation Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $data
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create transaction: ' . $e->getMessage(),
                'data' => ['error' => $e->getMessage()]
            ];
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
