<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\MoonpayService;
use App\Services\LinkioService;
use App\Services\YellowCardService;
use App\Services\StellarWalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DepositController extends Controller
{
    protected $moonpayService;
    protected $linkioService;
    protected $yellowCardService;
    protected $stellarWalletService;

    public function __construct(
        MoonpayService $moonpayService,
        LinkioService $linkioService,
        YellowCardService $yellowCardService,
        StellarWalletService $stellarWalletService
    ) {
        $this->moonpayService = $moonpayService;
        $this->linkioService = $linkioService;
        $this->yellowCardService = $yellowCardService;
        $this->stellarWalletService = $stellarWalletService;
    }

    public function initiateFiatDeposit(Request $request)
    {
        try {
            $validated = $request->validate([
                'provider' => 'required|string|in:moonpay,linkio,yellowcard',
                'currency' => 'required|string',
                'amount' => 'required|numeric|min:1',
                'wallet_address' => 'required|string',
                'transaction_id' => 'required|string',
                'metadata' => 'nullable|array'
            ]);

            // Handle provider-specific logic first
            $response = null;
            switch($validated['provider']) {
                case 'moonpay':
                    $response = $this->moonpayService->createTransaction($validated);
                    break;
                case 'linkio':
                    $response = $this->linkioService->createTransaction($validated);
                    break;
                case 'yellowcard':
                    $response = $this->yellowCardService->createTransaction($validated);
                    break;
            }

            if (!$response || !$response['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $response['message'] ?? 'Failed to initiate transaction'
                ], 400);
            }

            // Create transaction record only after successful provider response
            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'provider' => $validated['provider'],
                'external_id' => $validated['transaction_id'],
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'recipient_address' => $validated['wallet_address'],
                'type' => 'deposit',
                'status' => 'pending',
                'reference' => uniqid('TXN_' . strtoupper($validated['provider']) . '_', true),
                'metadata' => array_merge($validated['metadata'] ?? [], [
                    'provider_response' => $response['data']
                ]),
                'error_message' => null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction initiated successfully',
                'transaction' => [
                    'id' => $transaction->external_id,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'timestamp' => $transaction->created_at->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Fiat Deposit Initiation Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your request'
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->all();
        $provider = $request->header('X-Provider');

        try {
            switch ($provider) {
                case 'yellowcard':
                    return $this->handleYellowCardWebhook($request);
                case 'moonpay':
                    // Handle MoonPay webhook
                    break;
                case 'linkio':
                    return $this->handleLinkioWebhook($request);
                default:
                    return response()->json(['error' => 'Unknown provider'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Webhook Processing Error', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'payload' => $payload
            ]);
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    protected function handleYellowCardWebhook(Request $request)
    {
        $signature = $request->header('X-YellowCard-Signature');
        if (!$this->verifyYellowCardSignature($signature, $request->getContent())) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $payload = $request->all();
        Log::info('YellowCard Webhook Received', $payload);

        // Find and update transaction
        $transaction = Transaction::where('external_id', $payload['transaction_id'])
            ->where('provider', 'yellowcard')
            ->first();

        if (!$transaction) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        // Update transaction status
        $transaction->update([
            'status' => $payload['status'],
            'error_message' => $payload['error_message'] ?? null,
            'metadata' => array_merge($transaction->metadata ?? [], [
                'webhook_data' => $payload,
                'last_webhook_received' => now()->toISOString()
            ])
        ]);

        // If transaction is successful, update user's balance
        if ($payload['status'] === 'completed') {
            $this->stellarWalletService->updateBalance(
                $transaction->user_id,
                $payload['crypto_amount'] ?? $transaction->amount,
                $transaction->currency
            );
        }

        return response()->json(['success' => true]);
    }

    protected function verifyYellowCardSignature($signature, $payload)
    {
        $webhookSecret = config('services.yellowcard.webhook_secret');
        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        return hash_equals($expectedSignature, $signature);
    }

    protected function handleLinkioWebhook(Request $request)
    {
        $signature = $request->header('X-Linkio-Signature');
        if (!$this->verifyLinkioSignature($signature, $request->getContent())) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $payload = $request->all();
        Log::info('Linkio Webhook Received', $payload);

        // Find and update transaction
        $transaction = Transaction::where('external_id', $payload['transaction_id'])
            ->where('provider', 'linkio')
            ->first();

        if (!$transaction) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        // Update transaction status
        $transaction->update([
            'status' => $payload['status'],
            'error_message' => $payload['error_message'] ?? null,
            'metadata' => array_merge($transaction->metadata ?? [], [
                'webhook_data' => $payload,
                'last_webhook_received' => now()->toISOString()
            ])
        ]);

        // If transaction is successful, update user's balance
        if ($payload['status'] === 'completed') {
            $this->stellarWalletService->updateBalance(
                $transaction->user_id,
                $payload['crypto_amount'] ?? $transaction->amount,
                $transaction->currency
            );
        }

        return response()->json(['success' => true]);
    }

    protected function verifyLinkioSignature($signature, $payload)
    {
        $webhookSecret = config('services.linkio.webhook_secret');
        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        return hash_equals($expectedSignature, $signature);
    }

    public function checkStatus(Request $request, $id)
    {
        try {
            $transaction = Transaction::where('external_id', $id)
                ->orWhere('id', $id)
                ->first();

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            // Check status with provider
            $status = null;
            switch ($transaction->provider) {
                case 'moonpay':
                    $status = $this->moonpayService->checkTransactionStatus($transaction->external_id);
                    break;
                case 'linkio':
                    $status = $this->linkioService->checkTransactionStatus($transaction->external_id);
                    break;
                case 'yellowcard':
                    $status = $this->yellowCardService->checkTransactionStatus($transaction->external_id);
                    break;
            }

            if ($status && $status['status'] !== $transaction->status) {
                $transaction->update([
                    'status' => $status['status'],
                    'error_message' => $status['error_message'] ?? null,
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'last_status_check' => now()->toISOString(),
                        'status_response' => $status
                    ])
                ]);

                // If transaction is completed, update user's balance
                if ($status['status'] === 'completed') {
                    $this->stellarWalletService->updateBalance(
                        $transaction->user_id,
                        $status['crypto_amount'] ?? $transaction->amount,
                        $transaction->currency
                    );
                }
            }

            return response()->json([
                'success' => true,
                'transaction' => [
                    'id' => $transaction->external_id,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'timestamp' => $transaction->created_at->toISOString(),
                    'error_message' => $transaction->error_message
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Transaction Status Check Error', [
                'transaction_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while checking transaction status'
            ], 500);
        }
    }

    public function getTransactionHistory(Request $request)
    {
        try {
            $transactions = Transaction::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'transactions' => $transactions->map(function ($transaction) {
                    return [
                        'id' => $transaction->provider_transaction_id,
                        'provider' => $transaction->provider,
                        'status' => $transaction->status,
                        'amount' => $transaction->amount,
                        'currency' => $transaction->currency,
                        'crypto_amount' => $transaction->crypto_amount,
                        'crypto_currency' => $transaction->crypto_currency,
                        'timestamp' => $transaction->created_at->toISOString(),
                        'error' => $transaction->error_message,
                        'metadata' => $transaction->metadata
                    ];
                }),
                'pagination' => [
                    'current_page' => $transactions->currentPage(),
                    'last_page' => $transactions->lastPage(),
                    'per_page' => $transactions->perPage(),
                    'total' => $transactions->total()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Transaction History Error', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transaction history'
            ], 500);
        }
    }
}
