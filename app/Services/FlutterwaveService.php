<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use App\Events\TransferCompleted;

class FlutterwaveService
{
    protected $publicKey;
    protected $secretKey;
    protected $baseUrl;
    protected $encryptionKey;
    protected $webhookSecret;
    protected $sandbox;

    public function __construct()
    {
        $this->publicKey = config('services.flutterwave.public_key');
        $this->secretKey = config('services.flutterwave.secret_key');
        $this->baseUrl = config('services.flutterwave.base_url');
        $this->encryptionKey = config('services.flutterwave.encryption_key');
        $this->webhookSecret = config('services.flutterwave.webhook_secret');
        $this->sandbox = config('services.flutterwave.sandbox', true);
    }

    /**
     * Initiate a transfer
     */
    public function initiateTransfer(Transaction $transaction, array $config = [])
    {
        try {
            // Use provided config or fallback to environment variables
            $publicKey = $config['public_key'] ?? config('services.flutterwave.public_key');
            $secretKey = $config['secret_key'] ?? config('services.flutterwave.secret_key');
            $encryptionKey = $config['encryption_key'] ?? config('services.flutterwave.encryption_key');
            $isLive = $config['is_live'] ?? config('services.flutterwave.is_live', false);

            if (!$publicKey || !$secretKey || !$encryptionKey) {
                throw new \Exception('Flutterwave configuration is incomplete');
            }

            $baseUrl = $isLive ? 'https://api.flutterwave.com/v3' : 'https://sandbox.flutterwave.com/v3';

            $headers = [
                'Authorization' => 'Bearer ' . $secretKey,
                'Content-Type' => 'application/json'
            ];

            $payload = [
                'account_bank' => $transaction->bank_code,
                'account_number' => $transaction->recipient_address,
                'amount' => $transaction->amount,
                'narration' => $transaction->memo,
                'currency' => $transaction->currency,
                'reference' => $transaction->reference,
                'callback_url' => route('webhooks.flutterwave'),
                'metadata' => [
                    'transaction_id' => $transaction->id,
                    'user_id' => $transaction->user_id
                ]
            ];

            $response = Http::withHeaders($headers)
                ->post($baseUrl . '/transfers', $payload);

            if (!$response->successful()) {
                throw new \Exception('Flutterwave API error: ' . $response->body());
            }

            $data = $response->json();

            return [
                'success' => true,
                'reference' => $data['data']['reference'],
                'message' => 'Transfer initiated successfully'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function verifyTransfer(string $reference): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . '/v3/transfers/' . $reference);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'message' => 'Failed to verify transfer'
                ];
            }

            $data = $response->json();
            $status = $data['data']['status'] ?? 'pending';

            return [
                'success' => true,
                'status' => $status,
                'message' => $this->getStatusMessage($status)
            ];

        } catch (\Exception $e) {
            Log::error('Flutterwave verification error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage()
            ];
        }
    }

    public function handleWebhook(array $payload, string $signature): bool
    {
        // Verify webhook signature
        if (!$this->verifyWebhookSignature($payload, $signature)) {
            Log::error('Invalid Flutterwave webhook signature');
            return false;
        }

        try {
            $event = $payload['event'] ?? '';
            $data = $payload['data'] ?? [];

            if ($event === 'transfer.completed') {
                $transaction = Transaction::where('flutterwave_reference', $data['reference'])->first();

                if ($transaction) {
                    $transaction->update([
                        'flutterwave_status' => 'completed',
                        'status' => 'completed'
                    ]);

                    // Dispatch completion event
                    event(new TransferCompleted($transaction));
                }
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Webhook processing error: ' . $e->getMessage());
            return false;
        }
    }

    protected function verifyWebhookSignature(array $payload, string $signature): bool
    {
        $computedSignature = hash_hmac(
            'sha512',
            json_encode($payload),
            $this->webhookSecret
        );

        return hash_equals($computedSignature, $signature);
    }

    protected function getStatusMessage(string $status): string
    {
        return match ($status) {
            'successful' => 'Transfer completed successfully',
            'failed' => 'Transfer failed',
            'pending' => 'Transfer is processing',
            default => 'Unknown transfer status'
        };
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
            Log::info('Verifying bank account', [
                'account_number' => $accountNumber,
                'bank_code' => $bankCode
            ]);

            // Use the correct base URL based on sandbox mode
            $baseUrl = $this->sandbox ? 'https://sandbox.flutterwave.com/v3' : 'https://api.flutterwave.com/v3';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($baseUrl . '/accounts/resolve', [
                'account_number' => $accountNumber,
                'account_bank' => $bankCode
            ]);

            Log::info('Bank account verification response', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            if ($response->successful()) {
                $result = $response->json();

                if (!isset($result['status']) || $result['status'] !== 'success') {
                    Log::error('Invalid response status from Flutterwave', [
                        'response' => $result
                    ]);
                    return [
                        'success' => false,
                        'message' => $result['message'] ?? 'Failed to verify account',
                        'errors' => [$result['message'] ?? 'Invalid response status']
                    ];
                }

                return [
                    'success' => true,
                    'data' => [
                        'account_name' => $result['data']['account_name'] ?? '',
                        'account_number' => $result['data']['account_number'] ?? '',
                        'bank_code' => $result['data']['bank_code'] ?? ''
                    ],
                    'message' => 'Account verified successfully'
                ];
            }

            Log::error('Failed to verify bank account', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to verify account',
                'errors' => $response->json()['errors'] ?? ['Unknown error occurred']
            ];
        } catch (\Exception $e) {
            Log::error('Bank account verification exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to verify account',
                'errors' => [$e->getMessage()]
            ];
        }
    }
}
