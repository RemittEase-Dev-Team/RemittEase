<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Settings;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\KYC;
use App\Models\Currency;
use App\Services\StellarWalletService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    protected $walletService;

    public function __construct(StellarWalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    public function index()
    {
        try {
            $user = Auth::user();
            $totalTransactions = Transaction::where('user_id', $user->id)->count();
            $settings = Settings::first();
            $moonpayEnabled = $settings->moonpay_enabled ?? true;
            $yellowCardEnabled = $settings->yellowcard_enabled ?? true;
            $linkioEnabled = $settings->linkio_enabled ?? true;

            $currencies = Currency::all();
            $wallet = null;

            // Check if user has a wallet
            if (!$user->hasWallet()) {
                try {
                    $wallet = $this->walletService->createWalletForUser($user);
                    // If contract interaction fails, we still want to show the wallet
                    if ($wallet) {
                        Log::info('New wallet created for user: ' . $user->id . ' with address: ' . $wallet->public_key);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to create wallet: ' . $e->getMessage());
                    // Don't throw here, we'll show what we have
                }
            } else {
                $wallet = $user->wallet;
            }

            // If we have a wallet, try to get its balance
            if ($wallet) {
                try {
                    $balances = $this->walletService->getWalletBalance($wallet->public_key);

                    // Update wallet balance from blockchain
                    foreach ($balances as $balance) {
                        if ($balance['asset_type'] === 'native') {
                            $wallet->balance = $balance['balance'];
                            $wallet->save();
                            break;
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to update wallet balance: ' . $e->getMessage());
                    // Continue with existing balance
                }

                // Format the public key for display
                $formattedPublicKey = substr($wallet->public_key, 0, 4) . '...' . substr($wallet->public_key, -4);
                $wallet->formatted_public_key = $formattedPublicKey;
            }

            $balances = null;
            $availableTokens = [];
            if ($wallet) {
                try {
                    $balances = $this->walletService->getTokenBalances($wallet->public_key);
                    $availableTokens = $this->walletService->getAvailableTokens($wallet->public_key);
                } catch (\Exception $e) {
                    Log::error('Failed to get token balances: ' . $e->getMessage());
                    $balances = [
                        'native' => '0',
                        'USDC' => '0',
                        'NGNC' => '0',
                        'EURC' => '0',
                        'GBPC' => '0',
                        'GHCC' => '0',
                        'contract' => '0'
                    ];
                    $availableTokens = [];
                }
            }

            // Get recent transactions
            $recentTransactions = Transaction::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->map(function ($transaction) use ($user) {
                    return [
                        'id' => $transaction->id,
                        'type' => $transaction->type,
                        'amount' => floatval($transaction->amount),
                        'currency' => $transaction->asset_code,
                        'date' => $transaction->created_at->format('d M, Y'),
                        'status' => $transaction->status,
                        'isOutgoing' => ($transaction->type === 'test')
                            ? true // Always treat test transactions as outgoing
                            : in_array($transaction->type, ['withdrawal', 'transfer']) ||
                              ($user->wallet && $transaction->sender_address === $user->wallet->public_key),
                        'recipientAddress' => $transaction->recipient_address,
                        'transactionHash' => $transaction->transaction_hash,
                    ];
                });

            return Inertia::render('Dashboard', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'kyc_status' => $user->kyc_status,
                    'can_skip_kyc' => $totalTransactions < 100,
                ],
                'wallet' => $wallet ? [
                    'publicKey' => $wallet->public_key,
                    'formattedPublicKey' => $wallet->formatted_public_key,
                    'balance' => floatval($wallet->balance ?? 0),
                    'status' => $wallet->status,
                    'isVerified' => $wallet->is_verified,
                    'created_at' => $wallet->created_at->format('Y-m-d H:i:s'),
                ] : null,
                'moonpayEnabled' => $moonpayEnabled,
                'yellowCardEnabled' => $yellowCardEnabled,
                'linkioEnabled' => $linkioEnabled,
                'transactions' => $recentTransactions,
                'currencies' => $currencies,
                'balances' => $balances,
                'availableTokens' => $availableTokens,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in dashboard: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Unable to load dashboard data.');
        }
    }

    public function deposit($id)
    {
        // $user = auth()->user();
        // $wallet = $user->wallet;
        // $formattedPublicKey = $wallet ? Str::limit($wallet->public_key, 8) : null;
        $wallet = auth()->user()->wallet;
        $formattedPublicKey = substr($wallet->public_key, 0, 4) . '...' . substr($wallet->public_key, -4);

        // Get YellowCard configuration
        $yellowcardConfig = [
            'widget_key' => config('services.yellowcard.widget_key'),
            'sandbox' => config('services.yellowcard.sandbox', true),
        ];

        return Inertia::render('Deposit', [
            'formattedPublicKey' => $formattedPublicKey,
            'wallet' => $wallet,
            'yellowcard_config' => $yellowcardConfig,
        ]);
    }

}
