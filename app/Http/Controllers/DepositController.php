<?php

namespace App\Http\Controllers;

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
        $validated = $request->validate([
            'provider' => 'required|string|in:moonpay,linkio,yellowcard',
            'currency' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'wallet_address' => 'required|string'
        ]);

        try {
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

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
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
                    // Handle Linkio webhook
                    break;
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
        $transaction = Transaction::where('provider_transaction_id', $payload['transaction_id'])
            ->where('provider', 'yellowcard')
            ->first();

        if (!$transaction) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        // Update transaction status
        $transaction->update([
            'status' => $payload['status'],
            'metadata' => array_merge($transaction->metadata ?? [], [
                'webhook_data' => $payload
            ])
        ]);

        // If transaction is successful, update user's XLM balance
        if ($payload['status'] === 'completed') {
            $this->stellarWalletService->updateBalance(
                $transaction->user_id,
                $payload['crypto_amount'],
                'XLM'
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
}
