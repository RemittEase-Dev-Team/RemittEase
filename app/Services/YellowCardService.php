<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class YellowCardService
{
    protected $apiKey;
    protected $baseUrl;
    protected $isSandbox;
    protected $widgetKey;

    public function __construct()
    {
        $this->apiKey = Config::get('services.yellowcard.api_key');
        $this->widgetKey = Config::get('services.yellowcard.widget_key');
        $this->isSandbox = Config::get('services.yellowcard.sandbox', true);
        $this->baseUrl = $this->isSandbox
            ? 'https://sandbox-api.yellowcard.io/v1'
            : 'https://api.yellowcard.io/v1';
    }

    public function createTransaction(array $data)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/transactions', [
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'NGN',
                'crypto_currency' => 'XLM',
                'crypto_network' => 'stellar',
                'wallet_address' => $data['wallet_address'],
                'callback_url' => route('yellowcard.webhook'),
                'customer_email' => auth()->user()->email,
                'customer_name' => auth()->user()->name,
                'customer_phone' => auth()->user()->phone,
                'customer_id' => auth()->id(),
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error('YellowCard API Error', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create transaction'
            ];

        } catch (\Exception $e) {
            Log::error('YellowCard Service Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while processing your request'
            ];
        }
    }

    public function verifyTransaction(string $transactionId)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . '/transactions/' . $transactionId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to verify transaction'
            ];

        } catch (\Exception $e) {
            Log::error('YellowCard Verification Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while verifying the transaction'
            ];
        }
    }

    public function getWidgetKey()
    {
        return $this->widgetKey;
    }
}