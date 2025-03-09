<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\StellarWalletService;
use App\Models\Wallet;
use Illuminate\Support\Facades\Auth;

class WalletController extends Controller
{
    protected $walletService;

    public function __construct(StellarWalletService $walletService)
    {
        $this->walletService = $walletService;
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
    public function sendPayment(Request $request)
    {
        $validated = $request->validate([
            'destination' => 'required|string',
            'amount' => 'required|numeric|min:0.0000001',
            'asset_code' => 'sometimes|string'
        ]);

        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return back()->withErrors([
                'wallet' => 'Wallet not found'
            ]);
        }

        try {
            $response = $this->walletService->sendPayment(
                $wallet,
                $validated['destination'],
                $validated['amount'],
                $validated['asset_code'] ?? 'XLM'
            );

            // Record the transaction in the database
            $transaction = new \App\Models\Transaction();
            $transaction->sender_wallet_id = $wallet->id;
            $transaction->recipient_address = $validated['destination'];
            $transaction->amount = $validated['amount'];
            $transaction->asset_code = $validated['asset_code'] ?? 'XLM';
            $transaction->transaction_hash = $response->getHash();
            $transaction->status = 'completed';
            $transaction->save();

            return back()->with('success', 'Payment sent successfully');
        } catch (\Exception $e) {
            return back()->withErrors([
                'payment' => 'Failed to send payment: ' . $e->getMessage()
            ]);
        }
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
