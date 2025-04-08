<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class LinkioService
{
    protected $apiKey;
    protected $baseUrl;
    protected $isSandbox;

    public function __construct()
    {
        $this->apiKey = Config::get('services.linkio.api_key');
        $this->isSandbox = Config::get('services.linkio.sandbox', true);
        $this->baseUrl = $this->isSandbox
            ? 'https://sandbox-api.linkio.io/v1'
            : 'https://api.linkio.io/v1';
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
                'callback_url' => route('linkio.webhook'),
                'customer_email' => auth()->user()->email,
                'customer_name' => auth()->user()->name,
                'customer_phone' => auth()->user()->phone,
                'customer_id' => auth()->id(),
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                return [
                    'success' => true,
                    'data' => $responseData,
                    'message' => 'Transaction created successfully'
                ];
            }

            $errorData = $response->json();
            Log::error('Linkio API Error', [
                'status' => $response->status(),
                'response' => $errorData
            ]);

            return [
                'success' => false,
                'message' => $errorData['message'] ?? 'Failed to create transaction',
                'data' => $errorData
            ];

        } catch (\Exception $e) {
            Log::error('Linkio Service Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $data
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while processing your request',
                'data' => ['error' => $e->getMessage()]
            ];
        }
    }

    public function checkTransactionStatus(string $transactionId)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . '/transactions/' . $transactionId);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'status' => $data['status'] ?? 'pending',
                    'crypto_amount' => $data['crypto_amount'] ?? null,
                    'error_message' => $data['error_message'] ?? null,
                    'data' => $data
                ];
            }

            $errorData = $response->json();
            Log::error('Linkio Status Check Error', [
                'status' => $response->status(),
                'response' => $errorData
            ]);

            return [
                'success' => false,
                'status' => 'failed',
                'error_message' => $errorData['message'] ?? 'Failed to verify transaction',
                'data' => $errorData
            ];

        } catch (\Exception $e) {
            Log::error('Linkio Status Check Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'transaction_id' => $transactionId
            ]);

            return [
                'success' => false,
                'status' => 'failed',
                'error_message' => 'An error occurred while checking transaction status',
                'data' => ['error' => $e->getMessage()]
            ];
        }
    }
}
