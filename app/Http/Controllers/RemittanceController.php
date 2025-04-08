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
use Illuminate\Support\Facades\DB;

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
        \Log::info('Initiating transfer with data:', $request->all());

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
                'narration' => 'nullable|string|max:100',
            ]);

            // If recipient_id is provided, validate it and get recipient data
            if ($request->filled('recipient_id')) {
                $rules['recipient_id'] = 'exists:recipients,id';
                // Get recipient data
                $recipient = \App\Models\Recipient::find($request->recipient_id);
                if ($recipient) {
                    // Use recipient's phone if not provided
                    $request->merge(['phone' => $recipient->phone]);
                }
            } else {
                // If no recipient_id, phone is required
                $rules['phone'] = 'required|string';
            }
        }

        try {
            $validated = $request->validate($rules);
            \Log::info('Validation passed with data:', $validated);

            $user = auth()->user();
            $wallet = $user->wallet;

            if (!$wallet) {
                \Log::error('User wallet not found for user:', ['user_id' => $user->id]);
                return Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => 'Wallet not found. Please contact support.',
                    'error' => true
                ]);
            }

            // Get settings for fees and limits
            $settings = \App\Models\Settings::first();
            if (!$settings) {
                \Log::error('Settings not found');
                return Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => 'System settings not configured. Please contact support.',
                    'error' => true
                ]);
            }

            // Convert amount to float for proper comparison
            $amount = floatval($validated['amount']);
            $currency = $validated['currency'];
            $transactionFee = floatval($settings->transaction_fee ?? 0.025); // Default 2.5%
            $minAmount = floatval($settings->min_transaction_limit ?? 10);
            $maxAmount = floatval($settings->max_transaction_limit ?? 10000);

            // Convert amount to USD for limit validation
            $amountInUSD = $this->convertToUSD($amount, $currency);
            \Log::info('Amount conversion:', [
                'original_amount' => $amount,
                'currency' => $currency,
                'amount_in_usd' => $amountInUSD
            ]);

            \Log::info('Transaction limits:', [
                'amount_in_usd' => $amountInUSD,
                'min' => $minAmount,
                'max' => $maxAmount,
                'fee' => $transactionFee
            ]);

            // Validate amount against limits (in USD)
            if ($amountInUSD < $minAmount) {
                \Log::warning('Amount below minimum limit:', [
                    'amount_in_usd' => $amountInUSD,
                    'min' => $minAmount
                ]);
                return Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => "Minimum transfer amount is {$minAmount} USD (approximately " . number_format($this->convertFromUSD($minAmount, $currency), 2) . " {$currency})",
                    'error' => true
                ]);
            }

            if ($amountInUSD > $maxAmount) {
                \Log::warning('Amount above maximum limit:', [
                    'amount_in_usd' => $amountInUSD,
                    'max' => $maxAmount
                ]);
                return Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => "Maximum transfer amount is {$maxAmount} USD (approximately " . number_format($this->convertFromUSD($maxAmount, $currency), 2) . " {$currency}). Please split your transfer into smaller amounts.",
                    'error' => true
                ]);
            }

            // Calculate fees and total amount
            $feeAmount = $amount * $transactionFee;
            $totalAmount = $amount + $feeAmount;

            \Log::info('Calculated amounts:', [
                'amount' => $amount,
                'fee' => $feeAmount,
                'total' => $totalAmount,
                'currency' => $currency
            ]);

            // Convert total amount to XLM for admin wallet transfer
            $totalAmountInXLM = $this->convertToXLM($totalAmount, $currency);
            \Log::info('Amount in XLM:', [
                'total_amount' => $totalAmount,
                'currency' => $currency,
                'amount_in_xlm' => $totalAmountInXLM
            ]);

            // Check if user has sufficient balance in XLM
            $xlmBalance = $this->stellarWalletService->getWalletBalance($wallet->public_key);
            \Log::info('Wallet balance check:', [
                'balance_xlm' => $xlmBalance,
                'required_xlm' => $totalAmountInXLM
            ]);

            if ($xlmBalance < $totalAmountInXLM) {
                \Log::warning('Insufficient balance:', [
                    'balance_xlm' => $xlmBalance,
                    'required_xlm' => $totalAmountInXLM
                ]);
                return Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => 'Insufficient balance. Please add more funds to your wallet.',
                    'error' => true
                ]);
            }

            // Create transfer reference
            $reference = 'RMTEASE_' . Str::random(10);

            if ($request->transfer_type === 'crypto') {
                // Handle crypto transfer
                \Log::info('Processing crypto transfer');
                $result = $this->stellarWalletService->sendPayment(
                    $wallet,
                    $validated['wallet_address'],
                    $validated['amount'],
                    $validated['currency']
                );

                \Log::info('Crypto transfer result:', $result);

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

                    \Log::info('Crypto transaction recorded:', $transaction->toArray());

                    return Inertia::render('Wallet/Show', [
                        'success' => true,
                        'message' => 'Crypto transfer completed successfully',
                        'transaction' => $transaction
                    ]);
                } else {
                    \Log::error('Crypto transfer failed:', $result);
                    return Inertia::render('Wallet/Show', [
                        'success' => false,
                        'message' => $result['message'] ?? 'Transfer failed',
                        'error' => true
                    ]);
                }
            } else {
                // Handle cash transfer
                try {
                    DB::beginTransaction();
                    \Log::info('Processing cash transfer');

                    // Transfer amount to admin wallet in XLM
                    $adminWallet = \App\Models\User::role('admin')->first()->wallet;
                    if (!$adminWallet) {
                        throw new \Exception('Admin wallet not found');
                    }

                    \Log::info('Admin wallet found:', ['admin_wallet' => $adminWallet->public_key]);

                    $transferResult = $this->stellarWalletService->sendPayment(
                        $wallet,
                        $adminWallet->public_key,
                        $totalAmountInXLM,
                        'XLM'
                    );

                    \Log::info('Admin transfer result:', $transferResult);

                    if (!$transferResult['success']) {
                        throw new \Exception($transferResult['message'] ?? 'Failed to transfer to admin wallet');
                    }

                    // Record the remittance
                    $remittance = new \App\Models\Remittance([
                        'user_id' => $user->id,
                        'recipient_id' => $request->recipient_id ?? null,
                        'amount' => $amount,
                        'currency' => $currency,
                        'status' => 'pending',
                        'reference' => $reference,
                        'bank_code' => $validated['bank_code'],
                        'account_number' => $validated['account_number'],
                        'narration' => $validated['narration'] ?? 'RemittEase Transfer',
                        'phone' => $validated['phone'],
                        'fee_amount' => $feeAmount,
                        'total_amount' => $totalAmount,
                        'xlm_amount' => $totalAmountInXLM
                    ]);
                    $remittance->save();

                    \Log::info('Remittance recorded:', $remittance->toArray());

                    // Send notification to admin
                    $admin = \App\Models\User::role('admin')->first();
                    if ($admin) {
                        $admin->notify(new \App\Notifications\NewRemittanceNotification($remittance));
                        \Log::info('Admin notification sent');
                    }

                    DB::commit();
                    \Log::info('Cash transfer completed successfully');

                    return Inertia::render('Wallet/Show', [
                        'success' => true,
                        'message' => 'Cash transfer initiated successfully',
                        'remittance' => $remittance
                    ]);
                } catch (\Exception $e) {
                    DB::rollBack();
                    \Log::error('Cash transfer failed:', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return Inertia::render('Wallet/Show', [
                        'success' => false,
                        'message' => 'An error occurred while processing the transfer',
                        'error' => true
                    ]);
                }
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);
            return Inertia::render('Wallet/Show', [
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'error' => true
            ]);
        } catch (\Exception $e) {
            \Log::error('Transfer failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Inertia::render('Wallet/Show', [
                'success' => false,
                'message' => 'An error occurred while processing the transfer',
                'error' => true
            ]);
        }
    }

    /**
     * Get current exchange rates
     */
    private function getExchangeRates()
    {
        // Current market rates as of April 2025
        // TODO: Replace with real-time rates from an API
        return [
            'NGN' => 1/1500.0,    // 1 USD = 1500 NGN
            'GHS' => 1/12.50,     // 1 USD = 12.50 GHS
            'KES' => 1/130.0,     // 1 USD = 130 KES
            'UGX' => 1/3800.0,    // 1 USD = 3800 UGX
            'TZS' => 1/2500.0,    // 1 USD = 2500 TZS
            'ZAR' => 1/19.0,      // 1 USD = 19 ZAR
            'XLM' => 4.47,      // 1 USD = 4.47 XLM (current rate)
            'USD' => 1.0
        ];
    }

    /**
     * Convert amount to USD for limit validation
     */
    private function convertToUSD($amount, $currency)
    {
        $rates = $this->getExchangeRates();

        if ($currency === 'USD') {
            return $amount;
        }

        // Convert to USD using the rates
        return $amount * $rates[$currency];
    }

    /**
     * Convert USD amount to target currency
     */
    private function convertFromUSD($amount, $currency)
    {
        $rates = $this->getExchangeRates();

        if ($currency === 'USD') {
            return $amount;
        }

        // Convert from USD to target currency
        return $amount / $rates[$currency];
    }

    /**
     * Convert amount to XLM for admin wallet transfer
     */
    private function convertToXLM($amount, $currency)
    {
        if ($currency === 'XLM') {
            return $amount;
        }

        // First convert to USD
        $amountInUSD = $this->convertToUSD($amount, $currency);

        // Then convert USD to XLM using current rate
        $xlmRate = $this->getExchangeRates()['XLM'];
        return $amountInUSD / $xlmRate;
    }
}
