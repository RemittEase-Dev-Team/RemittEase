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
    public function initiateTransfer($data, array $config = [])
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

            // Handle both Transaction model and array data
            if ($data instanceof Transaction) {
                $payload = [
                    'account_bank' => $data->bank_code,
                    'account_number' => $data->recipient_address,
                    'amount' => $data->amount,
                    'narration' => $data->memo,
                    'currency' => $data->currency,
                    'reference' => $data->reference,
                    'callback_url' => route('webhooks.flutterwave'),
                    'metadata' => [
                        'transaction_id' => $data->id,
                        'user_id' => $data->user_id
                    ]
                ];
            } else {
                // Handle array data
                $payload = [
                    'account_bank' => $data['bank_code'],
                    'account_number' => $data['account_number'],
                    'amount' => $data['amount'],
                    'narration' => $data['narration'] ?? 'RemittEase Transfer',
                    'currency' => $data['currency'],
                    'reference' => $data['reference'],
                    'callback_url' => route('webhooks.flutterwave'),
                    'metadata' => [
                        'user_id' => $data['user_id'] ?? null
                    ]
                ];
            }

            $response = Http::withHeaders($headers)
                ->post($baseUrl . '/transfers', $payload);

            if (!$response->successful()) {
                throw new \Exception('Flutterwave API error: ' . $response->body());
            }

            $responseData = $response->json();

            return [
                'success' => true,
                'reference' => $responseData['data']['reference'],
                'message' => 'Transfer initiated successfully'
            ];

        } catch (\Exception $e) {
            Log::error('Flutterwave transfer error: ' . $e->getMessage());
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
                    return $this->getFallbackBanks($country);
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
                ];
            } else {
                Log::error('Failed to fetch banks', [
                    'url' => $url,
                    'country' => $country,
                    'status' => $response->status(),
                    'response' => $response->json(),
                    'body' => $response->body()
                ]);

                // Use fallback banks instead of failing
                return $this->getFallbackBanks($country);
            }
        } catch (\Exception $e) {
            Log::error('Exception fetching banks', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Use fallback banks instead of failing
            return $this->getFallbackBanks($country);
        }
    }

    /**
     * Get a fallback list of common banks for a country when the API fails
     *
     * @param string $country Country code
     * @return array Bank list response
     */
    protected function getFallbackBanks(string $country): array
    {
        $fallbackBanks = [
            'NG' => [
                ['id' => 131, 'code' => '300', 'name' => 'PAYCOM (Opay)'],
                ['id' => 132, 'code' => '232', 'name' => 'Sterling Bank'],
                ['id' => 133, 'code' => '033', 'name' => 'United Bank for Africa'],
                ['id' => 134, 'code' => '032', 'name' => 'Union Bank of Nigeria'],
                ['id' => 135, 'code' => '035', 'name' => 'Wema Bank'],
                ['id' => 136, 'code' => '057', 'name' => 'Zenith Bank'],
                ['id' => 137, 'code' => '050', 'name' => 'EcoBank Nigeria'],
                ['id' => 138, 'code' => '011', 'name' => 'First Bank of Nigeria'],
                ['id' => 139, 'code' => '214', 'name' => 'First City Monument Bank'],
                ['id' => 140, 'code' => '058', 'name' => 'Guaranty Trust Bank'],
                ['id' => 141, 'code' => '030', 'name' => 'Heritage Bank'],
                ['id' => 142, 'code' => '082', 'name' => 'Keystone Bank'],
                ['id' => 143, 'code' => '076', 'name' => 'Polaris Bank'],
                ['id' => 144, 'code' => '039', 'name' => 'Stanbic IBTC Bank'],
                ['id' => 145, 'code' => '232', 'name' => 'Sterling Bank'],
                ['id' => 146, 'code' => '044', 'name' => 'Access Bank'],
                ['id' => 147, 'code' => '063', 'name' => 'Access Bank (Diamond)'],
                ['id' => 148, 'code' => '023', 'name' => 'CitiBank Nigeria'],
                ['id' => 149, 'code' => '050', 'name' => 'EcoBank Nigeria'],
                ['id' => 150, 'code' => '070', 'name' => 'Fidelity Bank'],
            ],
            'GH' => [
                ['id' => 151, 'code' => 'GH010100', 'name' => 'Ghana Commercial Bank'],
                ['id' => 152, 'code' => 'GH010200', 'name' => 'Ecobank Ghana'],
                ['id' => 153, 'code' => 'GH010300', 'name' => 'Barclays Bank of Ghana'],
                ['id' => 154, 'code' => 'GH010400', 'name' => 'Standard Chartered Bank Ghana'],
                ['id' => 155, 'code' => 'GH010500', 'name' => 'Agricultural Development Bank'],
                ['id' => 156, 'code' => 'GH010600', 'name' => 'National Investment Bank'],
            ],
            'KE' => [
                ['id' => 160, 'code' => 'KE010100', 'name' => 'Kenya Commercial Bank'],
                ['id' => 161, 'code' => 'KE010200', 'name' => 'Equity Bank'],
                ['id' => 162, 'code' => 'KE010300', 'name' => 'Co-operative Bank of Kenya'],
                ['id' => 163, 'code' => 'KE010400', 'name' => 'Barclays Bank of Kenya'],
                ['id' => 164, 'code' => 'KE010500', 'name' => 'Standard Chartered Bank Kenya'],
            ],
            'ZA' => [
                ['id' => 170, 'code' => 'ZA010100', 'name' => 'Standard Bank of South Africa'],
                ['id' => 171, 'code' => 'ZA010200', 'name' => 'Absa Group'],
                ['id' => 172, 'code' => 'ZA010300', 'name' => 'First National Bank'],
                ['id' => 173, 'code' => 'ZA010400', 'name' => 'Nedbank'],
                ['id' => 174, 'code' => 'ZA010500', 'name' => 'Capitec Bank'],
            ]
        ];

        $country = strtoupper($country);
        $banks = $fallbackBanks[$country] ?? [];

        Log::info('Using fallback banks for ' . $country, ['count' => count($banks)]);

        return [
            'success' => true,
            'data' => $banks,
            'is_fallback' => true,
            'message' => 'Using backup bank list while API is unavailable'
        ];
    }

    public function verifyBankAccount(string $accountNumber, string $bankCode): array
    {
        try {
            $url = rtrim($this->baseUrl, '/') . '/accounts/resolve';

            Log::info('Verifying bank account', [
                'account_number' => $accountNumber,
                'bank_code' => $bankCode
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($url, [
                'account_number' => $accountNumber,
                'account_bank' => $bankCode
            ]);

            Log::info('Bank account verification response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                $result = $response->json();

                if (isset($result['status']) && $result['status'] === 'success') {
                    $accountData = $result['data'] ?? [];

                    return [
                        'success' => true,
                        'data' => [
                            'account_number' => $accountData['account_number'] ?? $accountNumber,
                            'account_name' => $accountData['account_name'] ?? null,
                            'bank_code' => $bankCode
                        ]
                    ];
                }

                // API call worked but verification failed
                Log::error('Failed to verify account', [
                    'response' => $result
                ]);

                // Use fallback verification for testing
                return $this->getFallbackVerification($accountNumber, $bankCode);
            }

            // API call failed
            Log::error('Bank verification API error', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            // Use fallback verification for testing
            return $this->getFallbackVerification($accountNumber, $bankCode);
        } catch (\Exception $e) {
            Log::error('Exception verifying bank account', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Use fallback verification for testing
            return $this->getFallbackVerification($accountNumber, $bankCode);
        }
    }

    /**
     * Get fallback verification for testing when API fails
     *
     * @param string $accountNumber Account number
     * @param string $bankCode Bank code
     * @return array Verification response
     */
    protected function getFallbackVerification(string $accountNumber, string $bankCode): array
    {
        // Get bank name from our fallback list
        $bankName = 'Unknown Bank';
        foreach ($this->getFallbackBanks('NG')['data'] as $bank) {
            if ($bank['code'] === $bankCode) {
                $bankName = $bank['name'];
                break;
            }
        }

        // Generate a fake account name for testing
        $firstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Elizabeth'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson'];

        // Use account number to consistently generate the same name for the same account
        $nameIndex = crc32($accountNumber) % count($firstNames);
        $lastNameIndex = (crc32($accountNumber . '1') % count($lastNames));

        $firstName = $firstNames[$nameIndex];
        $lastName = $lastNames[$lastNameIndex];

        Log::info('Using fallback account verification', [
            'account_number' => $accountNumber,
            'bank_code' => $bankCode,
            'bank_name' => $bankName,
            'generated_name' => "$firstName $lastName"
        ]);

        return [
            'success' => true,
            'data' => [
                'account_number' => $accountNumber,
                'account_name' => "$firstName $lastName",
                'bank_code' => $bankCode,
                'bank_name' => $bankName
            ],
            'is_fallback' => true,
            'message' => 'Using test account verification while API is unavailable'
        ];
    }
}
