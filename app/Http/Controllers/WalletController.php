<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\StellarWalletService;
use App\Models\Wallet;
use Illuminate\Support\Facades\Auth;
use App\Services\FlutterwaveService;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    protected $walletService;
    protected $flutterwaveService;

    public function __construct(StellarWalletService $walletService, FlutterwaveService $flutterwaveService)
    {
        $this->walletService = $walletService;
        $this->flutterwaveService = $flutterwaveService;
        $this->middleware('auth');
    }

    /**
     * Display wallet dashboard
     */
    public function index()
    {
        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet) {
            // Automatically create wallet if user doesn't have one
            $wallet = $this->walletService->createWalletForUser($user);
        }

        // Get wallet balance
        $balances = $this->walletService->getWalletBalance($wallet->public_key);

        // Get recent transactions
        $transactions = $wallet->transactions()
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Wallet/Dashboard', [
            'wallet' => [
                'publicKey' => $wallet->public_key,
                'balances' => $balances
            ],
            'transactions' => $transactions
        ]);
    }

    /**
     * Send payment
     */
    public function sendTransaction(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.0000001',
            'currency' => 'required|string',
            'transfer_type' => 'required|in:crypto,cash',
            'bank_code' => 'required_if:transfer_type,cash|string',
            'account_number' => 'required_if:transfer_type,cash|string',
            'wallet_address' => 'required_if:transfer_type,crypto|string',
            'narration' => 'nullable|string',
            'recipient_id' => 'nullable|exists:recipients,id'
        ]);

        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Create transaction record with common fields
            $transaction = new Transaction();
            $transaction->user_id = $user->id;
            $transaction->amount = $validated['amount'];
            $transaction->currency = $validated['currency'];
            $transaction->type = $validated['transfer_type'];
            $transaction->status = 'pending';
            $transaction->memo = $validated['narration'] ?? 'Transfer from RemittEase';
            $transaction->sender_wallet_id = $wallet->id;
            $transaction->metadata = [
                'transfer_type' => $validated['transfer_type'],
                'created_at' => now()->toIso8601String()
            ];

            if ($validated['transfer_type'] === 'crypto') {
                // Handle crypto transfer
                $transaction->provider = 'stellar';
                $transaction->recipient_address = $validated['wallet_address'];

                try {
                    $response = $this->walletService->sendPayment(
                        $wallet,
                        $validated['wallet_address'],
                        $validated['amount'],
                        $validated['currency']
                    );

                    $transaction->transaction_hash = $response->getHash();
                    $transaction->status = 'completed';
                    $transaction->metadata['stellar_response'] = $response->toArray();
                } catch (\Exception $e) {
                    $transaction->status = 'failed';
                    $transaction->error_message = $e->getMessage();
                    $transaction->metadata['error'] = [
                        'message' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ];
                    throw $e;
                }
            } else {
                // Handle cash transfer via Flutterwave
                $transaction->provider = 'flutterwave';
                $transaction->recipient_address = $validated['account_number'];

                if ($validated['recipient_id']) {
                    $recipient = \App\Models\Recipient::find($validated['recipient_id']);
                    $transaction->recipient_wallet_id = $recipient->wallet_id;
                    $transaction->metadata['recipient'] = [
                        'id' => $recipient->id,
                        'name' => $recipient->name
                    ];
                }

                try {
                    // Get Flutterwave configuration from environment
                    $flutterwaveConfig = [
                        'public_key' => config('services.flutterwave.public_key'),
                        'secret_key' => config('services.flutterwave.secret_key'),
                        'encryption_key' => config('services.flutterwave.encryption_key'),
                        'webhook_secret' => config('services.flutterwave.webhook_secret'),
                        'is_live' => config('services.flutterwave.is_live', false)
                    ];

                    // Add configuration to transaction metadata
                    $transaction->metadata['flutterwave_config'] = [
                        'is_live' => $flutterwaveConfig['is_live']
                    ];

                    // Initiate Flutterwave transfer with configuration
                    $flutterwaveResponse = $this->flutterwaveService->initiateTransfer($transaction, $flutterwaveConfig);

                    if (!$flutterwaveResponse['success']) {
                        throw new \Exception($flutterwaveResponse['message']);
                    }

                    $transaction->external_id = $flutterwaveResponse['reference'];
                    $transaction->metadata['flutterwave_response'] = $flutterwaveResponse;
                } catch (\Exception $e) {
                    $transaction->status = 'failed';
                    $transaction->error_message = $e->getMessage();
                    $transaction->metadata['error'] = [
                        'message' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ];
                    throw $e;
                }
            }

            $transaction->save();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaction initiated successfully',
                'transaction_id' => $transaction->id,
                'reference' => $transaction->reference,
                'status' => $transaction->status,
                'stellar_explorer_url' => $transaction->stellar_explorer_url
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supported currencies
     */
    public function getCurrencies()
    {
        return response()->json([
            'success' => true,
            'data' => [
                ['code' => 'XLM', 'name' => 'Stellar Lumens', 'flag' => '🌐'],
                ['code' => 'NGN', 'name' => 'Nigerian Naira', 'flag' => '🇳🇬'],
                ['code' => 'GHS', 'name' => 'Ghanaian Cedi', 'flag' => '🇬🇭'],
                ['code' => 'KES', 'name' => 'Kenyan Shilling', 'flag' => '🇰🇪'],
                ['code' => 'UGX', 'name' => 'Ugandan Shilling', 'flag' => '🇺🇬'],
                ['code' => 'ZAR', 'name' => 'South African Rand', 'flag' => '🇿🇦'],
                ['code' => 'ZMW', 'name' => 'Zambian Kwacha', 'flag' => '🇿🇲'],
                ['code' => 'XAF', 'name' => 'Central African CFA Franc', 'flag' => '🇨🇲'],
                ['code' => 'XOF', 'name' => 'West African CFA Franc', 'flag' => '🇨🇮'],
                ['code' => 'EGP', 'name' => 'Egyptian Pound', 'flag' => '🇪🇬'],
                ['code' => 'MAD', 'name' => 'Moroccan Dirham', 'flag' => '🇲🇦']
            ]
        ]);
    }

    /**
     * Get supported banks for a country
     */
    public function getBanks(Request $request)
    {
        $validated = $request->validate([
            'country' => 'required|string|size:2'
        ]);

        $response = $this->flutterwaveService->getBanks($validated['country']);

        if (!$response['success']) {
            return response()->json([
                'success' => false,
                'message' => $response['message']
            ], 400);
        }

        return response()->json($response);
    }

    /**
     * Verify bank account
     */
    public function verifyAccount(Request $request)
    {
        $validated = $request->validate([
            'account_number' => 'required|string',
            'bank_code' => 'required|string'
        ]);

        $response = $this->flutterwaveService->verifyBankAccount(
            $validated['account_number'],
            $validated['bank_code']
        );

        if (!$response['success']) {
            return response()->json([
                'success' => false,
                'message' => $response['message']
            ], 400);
        }

        return response()->json($response);
    }

    /**
     * Show wallet details
     */
    public function show()
    {
        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return redirect()->route('wallet.index');
        }

        return Inertia::render('Wallet/Details', [
            'wallet' => [
                'publicKey' => $wallet->public_key,
                'createdAt' => $wallet->created_at
            ]
        ]);
    }
}
