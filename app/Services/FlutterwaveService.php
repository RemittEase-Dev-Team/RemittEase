<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlutterwaveService
{
    protected $baseUrl;
    protected $secretKey;
    protected $publicKey;

    public function __construct()
    {
        $this->baseUrl = config('services.flutterwave.base_url');
        $this->secretKey = config('services.flutterwave.secret_key');
        $this->publicKey = config('services.flutterwave.public_key');
    }

    public function createTransfer(array $data): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/transfers', [
                'account_bank' => $data['bank_code'],
                'account_number' => $data['account_number'],
                'amount' => $data['amount'],
                'currency' => $data['currency'],
                'narration' => $data['narration'] ?? 'RemittEase Transfer',
                'reference' => $data['reference'],
                'callback_url' => route('api.flutterwave.webhook'),
                'debit_currency' => 'USD'
            ]);

            $result = $response->json();

            if ($response->successful()) {
                Log::info('Flutterwave transfer initiated', [
                    'reference' => $data['reference'],
                    'response' => $result
                ]);

                return [
                    'success' => true,
                    'data' => $result['data'],
                    'message' => $result['message']
                ];
            }

            Log::error('Flutterwave transfer failed', [
                'reference' => $data['reference'],
                'response' => $result
            ]);

            return [
                'success' => false,
                'message' => $result['message'] ?? 'Transfer failed',
                'errors' => $result['errors'] ?? []
            ];

        } catch (\Exception $e) {
            Log::error('Flutterwave transfer exception', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while processing the transfer',
                'errors' => [$e->getMessage()]
            ];
        }
    }

    public function getBanks(string $country): array
    {
        try {
            // The correct endpoint for getting banks is /banks
            $url = rtrim($this->baseUrl, '/') . '/banks';

            Log::info('Making Flutterwave API request', [
                'url' => $url,
                'country' => $country,
                'headers' => [
                    'Authorization' => 'Bearer ' . substr($this->secretKey, 0, 10) . '...',
                    'Content-Type' => 'application/json'
                ]
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->get($url, [
                'country' => strtoupper($country)
            ]);

            Log::info('Flutterwave API response', [
                'status' => $response->status(),
                'headers' => $response->headers(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                $result = $response->json();

                // Check if the response has the expected structure
                if (!isset($result['status']) || $result['status'] !== 'success') {
                    Log::error('Invalid response status from Flutterwave', [
                        'response' => $result
                    ]);
                    return [
                        'success' => false,
                        'message' => $result['message'] ?? 'Failed to fetch banks',
                        'errors' => [$result['message'] ?? 'Invalid response status']
                    ];
                }

                // The banks data is directly in the response, not in a 'data' key
                $banks = $result['data'] ?? [];

                Log::info('Banks fetched successfully', [
                    'country' => $country,
                    'count' => count($banks),
                    'first_bank' => $banks[0] ?? null
                ]);

                return [
                    'success' => true,
                    'data' => $banks,
                    'message' => 'Banks retrieved successfully'
                ];
            }

            Log::error('Failed to fetch banks', [
                'url' => $url,
                'country' => $country,
                'status' => $response->status(),
                'response' => $response->json(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch banks',
                'errors' => $response->json()['errors'] ?? ['Unknown error occurred']
            ];
        } catch (\Exception $e) {
            Log::error('Failed to fetch banks', [
                'error' => $e->getMessage(),
                'url' => $url ?? null,
                'country' => $country,
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to fetch banks',
                'errors' => [$e->getMessage()]
            ];
        }
    }

    public function verifyBankAccount(string $accountNumber, string $bankCode): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->post($this->baseUrl . '/accounts/resolve', [
                'account_number' => $accountNumber,
                'account_bank' => $bankCode
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Failed to verify bank account', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Failed to verify bank account',
                'errors' => [$e->getMessage()]
            ];
        }
    }
}
