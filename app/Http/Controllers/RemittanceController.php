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

    public function initiateTransfer(Request $request)
    {
        $validated = $request->validate([
            'recipient_id' => 'required|exists:recipients,id',
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|in:NGN,GHS,KES,UGX,TZS,ZAR',
            'narration' => 'nullable|string|max:100'
        ]);

        $recipient = \App\Models\Recipient::find($validated['recipient_id']);
        $user = auth()->user();
        $wallet = $user->wallet;

        // Check if user has sufficient balance
        $xlmBalance = $this->stellarWalletService->getBalance($wallet);
        if ($xlmBalance < $validated['amount']) {
            return back()->withErrors(['amount' => 'Insufficient balance']);
        }

        // Create transfer reference
        $reference = 'RMTEASE_' . Str::random(10);

        // Prepare transfer data
        $transferData = [
            'bank_code' => $recipient->bank_code,
            'account_number' => $recipient->account_number,
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'narration' => $validated['narration'] ?? 'RemittEase Transfer',
            'reference' => $reference
        ];

        // Initiate transfer
        $result = $this->flutterwaveService->createTransfer($transferData);

        if ($result['success']) {
            // Record the remittance
            $remittance = new \App\Models\Remittance([
                'user_id' => $user->id,
                'recipient_id' => $recipient->id,
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'status' => 'pending',
                'reference' => $reference
            ]);
            $remittance->save();

            return back()->with('success', 'Transfer initiated successfully');
        }

        return back()->withErrors(['transfer' => $result['message']]);
    }
}
