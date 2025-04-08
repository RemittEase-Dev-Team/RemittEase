<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Models\Wallet;
use App\Services\MoonPayService;
use Inertia\Inertia;
use App\Services\FlutterwaveService;
use App\Services\StellarWalletService;
use Illuminate\Support\Str;

class RemittanceController extends Controller
{
    protected $flutterwaveService;
    protected $stellarWalletService;

    public function __construct(
        FlutterwaveService $flutterwaveService,
        StellarWalletService $stellarWalletService
    ) {
        $this->flutterwaveService = $flutterwaveService;
        $this->stellarWalletService = $stellarWalletService;
    }

    public function loadCash(Request $request)
    {
        $moonpayService = new MoonPayService();

        if ($moonpayService->isMoonPayEnabled()) {
            // Use MoonPay for deposit
            $user = Auth::user();
            $customerData = [
                'email' => $user->email,
                'firstName' => $user->name,
                'lastName' => '', // You might want to add a last name field to your users table
                'country' => 'US', // You might want to add a country field to your users table
            ];

            $customer = $moonpayService->createCustomer($customerData);

            if ($customer) {
                $queryParams = [
                    'customerId' => $customer['id'],
                    'currencyCode' => $request->currency,
                    'requestedAmount' => $request->amount,
                ];

                $checkoutURL = $moonpayService->getCheckoutURL($queryParams);

                if ($checkoutURL) {
                    return redirect()->away($checkoutURL);
                } else {
                    return Inertia::render('Wallet/Show', [
                        'success' => false,
                        'message' => 'MoonPay checkout URL could not be generated.',
                    ]);
                }
            } else {
                return Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => 'MoonPay customer could not be created.',
                ]);
            }
        } else {
            // Use existing LinkIO for deposit
            $response = Http::withHeaders([
                'accept' => 'application/json',
                'ngnc-sec-key' => env('LINKIO_SECRET_KEY'),
                'content-type' => 'application/json',
            ])->post('https://api.linkio.world/transactions/v1/onramp', [
                'business_id' => env('LINKIO_BUSINESS_ID'),
                'link_tag' => Auth::user()->id,
                'type' => 'deposit',
                'currency' => 'USD', // Assuming USD for LinkIO
                'amount' => $request->amount,
            ]);

            if ($response->successful()) {
                // Update wallet balance
                $wallet = Auth::user()->wallet ?? new Wallet(['user_id' => Auth::id()]);
                $wallet->balance += $request->amount;
                $wallet->save();

                return Inertia::render('Wallet/Show', [
                    'success' => true,
                    'message' => 'Amount deposited successfully',
                ]);
            } else {
                return Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => 'Deposit failed',
                ]);
            }
        }
    }

    public function withdrawFunds(Request $request)
    {
        $response = Http::withHeaders([
            'accept' => 'application/json',
            'ngnc-sec-key' => env('LINKIO_SECRET_KEY'),
            'content-type' => 'application/json',
        ])->post('https://api.linkio.world/transactions/v1/offramp', [
            'business_id' => env('LINKIO_BUSINESS_ID'),
            'link_tag' => Auth::user()->id,
            'type' => 'deposit',
            'currency' => 'USD',
            'amount' => $request->amount,
        ]);

        if ($response->successful()) {
            // Update wallet balance
            $wallet = Auth::user()->wallet ?? new Wallet(['user_id' => Auth::id()]);
            $wallet->balance += $request->amount;
            $wallet->save();

                return Inertia::render('Wallet/Show', [
                    'success' => true,
                    'message' => 'Amount deposited successfully',
                ]);

            // return response()->json(['success' => true, 'message' => 'Cash loaded successfully.']);
        } else {
            // return response()->json(['success' => false, 'error' => 'Transaction failed.'], 500);
            return Inertia::render('Wallet/Show', [
                'success' => false,
                'message' => 'Deposit failed',
            ]);
        }
    }

    public function getBanks(Request $request)
    {
        $country = $request->get('country', 'NG');
        $banks = $this->flutterwaveService->getBanks($country);

        return response()->json($banks);
    }

    public function verifyAccount(Request $request)
    {
        $validated = $request->validate([
            'account_number' => 'required|string',
            'bank_code' => 'required|string'
        ]);

        $result = $this->flutterwaveService->verifyBankAccount(
            $validated['account_number'],
            $validated['bank_code']
        );

        return response()->json($result);
    }

    // public function initiateTransfer(Request $request)
    // {
    //     $validated = $request->validate([
    //         'recipient_id' => 'required|exists:recipients,id',
    //         'amount' => 'required|numeric|min:1',
    //         'currency' => 'required|string|in:NGN,GHS,KES,UGX,TZS,ZAR',
    //         'narration' => 'nullable|string|max:100'
    //     ]);

    //     $recipient = \App\Models\Recipient::find($validated['recipient_id']);
    //     $user = auth()->user();
    //     $wallet = $user->wallet;

    //     // Check if user has sufficient balance
    //     $xlmBalance = $this->stellarWalletService->getBalance($wallet);
    //     if ($xlmBalance < $validated['amount']) {
    //         return back()->withErrors(['amount' => 'Insufficient balance']);
    //     }

    //     // Create transfer reference
    //     $reference = 'RMTEASE_' . Str::random(10);

    //     // Prepare transfer data
    //     $transferData = [
    //         'bank_code' => $recipient->bank_code,
    //         'account_number' => $recipient->account_number,
    //         'amount' => $validated['amount'],
    //         'currency' => $validated['currency'],
    //         'narration' => $validated['narration'] ?? 'RemittEase Transfer',
    //         'reference' => $reference
    //     ];

    //     // Initiate transfer
    //     $result = $this->flutterwaveService->createTransfer($transferData);

    //     if ($result['success']) {
    //         // Record the remittance
    //         $remittance = new \App\Models\Remittance([
    //             'user_id' => $user->id,
    //             'recipient_id' => $recipient->id,
    //             'amount' => $validated['amount'],
    //             'currency' => $validated['currency'],
    //             'status' => 'pending',
    //             'reference' => $reference
    //         ]);
    //         $remittance->save();

    //         return back()->with('success', 'Transfer initiated successfully');
    //     }

    //     return back()->withErrors(['transfer' => $result['message']]);
    // }

    public function initiateTransfer(Request $request)
    {
        // Validate the request based on transfer type
        $rules = [
            'amount' => 'required|numeric|min:1',
            'transfer_type' => 'required|in:crypto,cash',
        ];

        if ($request->transfer_type === 'crypto') {
            $rules = array_merge($rules, [
                'currency' => 'required|string',
                'wallet_address' => 'required|string'
            ]);
        } else { // cash transfer
            $rules = array_merge($rules, [
                'bank_code' => 'required|string',
                'account_number' => 'required|string',
                'currency' => 'required|string',
                'narration' => 'nullable|string|max:100'
            ]);

            // If recipient_id is provided, validate it
            if ($request->filled('recipient_id')) {
                $rules['recipient_id'] = 'exists:recipients,id';
            }
        }

        $validated = $request->validate($rules);
        $user = auth()->user();
        $wallet = $user->wallet;

        // Check if user has sufficient balance
        $xlmBalance = $this->stellarWalletService->getWalletBalance($wallet->public_key);
        if ($xlmBalance < $validated['amount']) {
            return $request->wantsJson()
                ? response()->json([
                    'success' => false,
                    'message' => 'Insufficient balance'
                ], 400)
                : Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => 'Insufficient balance'
                ]);
        }

        // Create transfer reference
        $reference = 'RMTEASE_' . Str::random(10);

        try {
            if ($request->transfer_type === 'crypto') {
                // Handle crypto transfer
                $result = $this->stellarWalletService->transferFunds(
                    $wallet->public_key,
                    $validated['wallet_address'],
                    $validated['amount'],
                    $validated['currency']
                );

                if ($result['success']) {
                    // Record the transaction
                    $transaction = new \App\Models\Transaction([
                        'user_id' => $user->id,
                        'type' => 'crypto_transfer',
                        'amount' => $validated['amount'],
                        'asset_code' => $validated['currency'],
                        'recipient_address' => $validated['wallet_address'],
                        'status' => 'completed',
                        'transaction_hash' => $result['transaction_hash'] ?? null
                    ]);
                    $transaction->save();

                    return $request->wantsJson()
                        ? response()->json([
                            'success' => true,
                            'message' => 'Crypto transfer completed successfully'
                        ])
                        : Inertia::render('Wallet/Show', [
                            'success' => true,
                            'message' => 'Crypto transfer completed successfully'
                        ]);
                } else {
                    return $request->wantsJson()
                        ? response()->json([
                            'success' => false,
                            'message' => $result['message'] ?? 'Transfer failed'
                        ], 500)
                        : Inertia::render('Wallet/Show', [
                            'success' => false,
                            'message' => $result['message'] ?? 'Transfer failed'
                        ]);
                }
            } else {
                // Handle cash transfer
                // Prepare transfer data for Flutterwave
                $transferData = [
                    'bank_code' => $validated['bank_code'],
                    'account_number' => $validated['account_number'],
                    'amount' => $validated['amount'],
                    'currency' => $validated['currency'],
                    'narration' => $validated['narration'] ?? 'RemittEase Transfer',
                    'reference' => $reference
                ];

                // Initiate transfer through Flutterwave
                $result = $this->flutterwaveService->createTransfer($transferData);

                if ($result['success']) {
                    // Record the remittance
                    $remittance = new \App\Models\Remittance([
                        'user_id' => $user->id,
                        'recipient_id' => $request->recipient_id ?? null,
                        'amount' => $validated['amount'],
                        'currency' => $validated['currency'],
                        'status' => 'pending',
                        'reference' => $reference
                    ]);
                    $remittance->save();

                    return $request->wantsJson()
                        ? response()->json([
                            'success' => true,
                            'message' => 'Cash transfer initiated successfully'
                        ])
                        : Inertia::render('Wallet/Show', [
                            'success' => true,
                            'message' => 'Cash transfer initiated successfully'
                        ]);
                } else {
                    return $request->wantsJson()
                        ? response()->json([
                            'success' => false,
                            'message' => $result['message'] ?? 'Transfer failed'
                        ], 500)
                        : Inertia::render('Wallet/Show', [
                            'success' => false,
                            'message' => $result['message'] ?? 'Transfer failed'
                        ]);
                }
            }
        } catch (\Exception $e) {
            return $request->wantsJson()
                ? response()->json([
                    'success' => false,
                    'message' => 'Transfer failed: ' . $e->getMessage()
                ], 500)
                : Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => 'An error occurred while processing the transfer'
                ]);
        }
    }
}