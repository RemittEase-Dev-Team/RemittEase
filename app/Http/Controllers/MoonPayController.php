<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Transaction;

class MoonPayController extends Controller
{
    private $apiKey;
    private $baseUrl;
    private $secretKey;

    public function __construct()
    {
        $this->apiKey = env('MOONPAY_API_KEY');
        $this->secretKey = env('MOONPAY_SECRET_KEY');
        $this->baseUrl = env('MOONPAY_BASE_URL', 'https://api.moonpay.com');
    }

    public function createTransaction(Request $request)
    {
        $request->validate([
            'currency' => 'required|string',
            'amount' => 'required|numeric',
            'walletAddress' => 'required|string',
        ]);

        $user = Auth::user();

        // Generate a signature for security
        $signature = $this->generateSignature([
            'apiKey' => $this->apiKey,
            'currencyCode' => $request->currency,
            'walletAddress' => $request->walletAddress,
            'externalCustomerId' => $user->id,
            'externalTransactionId' => 'TX' . time() . rand(1000, 9999),
            'email' => $user->email,
            'baseCurrencyAmount' => $request->amount,
            'redirectURL' => route('dashboard'),
        ]);

        // Create MoonPay transaction
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Signature' => $signature
        ])->post($this->baseUrl . '/v1/transactions', [
            'apiKey' => $this->apiKey,
            'currencyCode' => $request->currency,
            'walletAddress' => $request->walletAddress,
            'externalCustomerId' => $user->id,
            'externalTransactionId' => 'TX' . time() . rand(1000, 9999),
            'email' => $user->email,
            'baseCurrencyAmount' => $request->amount,
            'redirectURL' => route('dashboard'),
        ]);

        if ($response->successful()) {
            // Record transaction in our database
            Transaction::create([
                'user_id' => $user->id,
                'type' => 'deposit',
                'status' => 'pending',
                'amount' => $request->amount,
                'currency' => $request->currency,
                'external_id' => $response->json('id'),
                'metadata' => json_encode($response->json()),
            ]);

            return response()->json([
                'success' => true,
                'url' => $response->json('redirectUrl'),
                'transactionId' => $response->json('id')
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to create MoonPay transaction',
            'errors' => $response->json()
        ], 422);
    }

    public function webhook(Request $request)
    {
        // Verify the webhook signature
        $signature = $request->header('X-Signature');
        if (!$this->verifySignature($request->getContent(), $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $data = $request->all();
        $externalId = $data['externalTransactionId'] ?? null;

        if ($externalId) {
            $transaction = Transaction::where('external_id', $externalId)->first();
            if ($transaction) {
                // Update transaction status
                $transaction->status = $data['status'];
                $transaction->metadata = json_encode($data);
                $transaction->save();

                // If completed, update user's wallet balance
                if ($data['status'] === 'completed') {
                    $user = User::find($transaction->user_id);
                    $wallet = $user->wallet;
                    $wallet->balance += $transaction->amount;
                    $wallet->save();
                }
            }
        }

        return response()->json(['success' => true]);
    }

    private function generateSignature($data)
    {
        return hash_hmac('sha256', json_encode($data), $this->secretKey);
    }

    private function verifySignature($payload, $signature)
    {
        $expectedSignature = hash_hmac('sha256', $payload, $this->secretKey);
        return hash_equals($expectedSignature, $signature);
    }
}
