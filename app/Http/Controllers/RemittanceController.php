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
use Illuminate\Support\Facades\Log;

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
                'narration' => 'nullable|string|max:100',
                'phone' => 'required|string'
            ]);

            // If recipient_id is provided, validate it
            if ($request->filled('recipient_id')) {
                $rules['recipient_id'] = 'exists:recipients,id';
            }
        }

        $validated = $request->validate($rules);
        $user = auth()->user();
        $wallet = $user->wallet;

        // Get settings for fees and limits
        $settings = \App\Models\Settings::first();
        $transactionFee = $settings->transaction_fee ?? 0.025; // Default 2.5%
        $minAmount = $settings->min_transaction_limit ?? 10;
        $maxAmount = $settings->max_transaction_limit ?? 10000;

        // Convert amount to USD for limit validation
        $amountInUSD = $this->convertToUSD($validated['amount'], $validated['currency']);

        // Validate amount against limits (in USD)
        if ($amountInUSD < 20) { // Minimum $20 USD equivalent
            return $request->wantsJson()
                ? response()->json([
                    'success' => false,
                    'message' => "Minimum transfer amount is $20 USD"
                ], 400)
                : Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => "Minimum transfer amount is $20 USD"
                ]);
        }

        if ($amountInUSD > 5000) { // Maximum $5000 USD equivalent
            return $request->wantsJson()
                ? response()->json([
                    'success' => false,
                    'message' => "Maximum transfer amount is $5000 USD"
                ], 400)
                : Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => "Maximum transfer amount is $5000 USD"
                ]);
        }

        // Calculate fee (fixed $2 USD equivalent)
        $feeAmountUSD = 2.0; // Fixed $2 USD fee
        $feeAmount = $this->convertFromUSD($feeAmountUSD, $validated['currency']);

        // Total amount in original currency
        $totalAmount = $validated['amount'] + $feeAmount;

        // Convert to XLM for blockchain operations
        $totalAmountXLM = $this->convertToXLM($totalAmount, $validated['currency']);

        // Check if user has sufficient balance in XLM - use direct native balance check
        $nativeXLMBalance = $this->stellarWalletService->getWalletNativeBalance($wallet->public_key);

        // Minimum required XLM balance (2 XLM reserve + transaction amount + 0.00001 fee)
        $requiredXLMBalance = $totalAmountXLM + 2.00001;

        Log::info("Remittance balance check: User: {$user->id}, Amount: {$validated['amount']} {$validated['currency']}, XLM equivalent: {$totalAmountXLM}, Available: {$nativeXLMBalance}, Required: {$requiredXLMBalance}");

        if ($nativeXLMBalance < $requiredXLMBalance) {
            $errorMessage = "Insufficient balance. Required: {$requiredXLMBalance} XLM (including 2 XLM reserve), Available: {$nativeXLMBalance} XLM";
            Log::warning($errorMessage);

            return $request->wantsJson()
                ? response()->json([
                    'success' => false,
                    'message' => $errorMessage
                ], 400)
                : Inertia::render('Wallet/Show', [
                    'success' => false,
                    'message' => $errorMessage
                ]);
        }

        // Create transfer reference
        $reference = 'RMTEASE_' . Str::random(10);

        try {
            if ($request->transfer_type === 'crypto') {
                // First create transaction record with pending status
                $transaction = new \App\Models\Transaction([
                    'user_id' => $user->id,
                    'type' => 'crypto_transfer',
                    'amount' => $validated['amount'],
                    'asset_code' => $validated['currency'],
                    'recipient_address' => $validated['wallet_address'],
                    'status' => 'pending',
                    'reference' => $reference
                ]);
                $transaction->save();

                // Handle crypto transfer
                $result = $this->stellarWalletService->transferFunds(
                    $wallet->public_key,
                    $validated['wallet_address'],
                    $validated['amount'],
                    $validated['currency']
                );

                if ($result['success']) {
                    // Update the transaction record
                    $transaction->status = 'completed';
                    $transaction->transaction_hash = $result['transaction_hash'] ?? null;
                    $transaction->save();

                    // Schedule a job to verify transaction status after some time
                    \App\Jobs\CheckTransactionStatus::dispatch($transaction->id)
                        ->delay(now()->addMinutes(5));

                    return $request->wantsJson()
                        ? response()->json([
                            'success' => true,
                            'message' => 'Crypto transfer initiated successfully',
                            'transaction_id' => $transaction->id,
                            'reference' => $reference
                        ])
                        : Inertia::render('Wallet/Show', [
                            'success' => true,
                            'message' => 'Crypto transfer initiated successfully'
                        ]);
                } else {
                    // Update transaction to failed
                    $transaction->status = 'failed';
                    $transaction->failure_reason = $result['message'] ?? 'Unknown error';
                    $transaction->save();

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
                try {
                    DB::beginTransaction();

                    // Get admin wallet as recipient
                    $admin = \App\Models\User::where('email', 'admin@remittease.com')
                        ->orWhereHas('roles', function($query) {
                            $query->where('name', 'admin');
                        })->first();

                    if (!$admin || !$admin->wallet) {
                        throw new \Exception('Admin wallet not found for testing');
                    }

                    $adminWallet = $admin->wallet;
                    if (!$adminWallet) {
                        throw new \Exception('Admin wallet not found');
                    }

                    // First create the remittance record with pending status
                    $remittance = new \App\Models\Remittance([
                        'user_id' => $user->id,
                        'recipient_id' => $request->recipient_id ?? null,
                        'amount' => $validated['amount'],
                        'currency' => $validated['currency'],
                        'status' => 'pending',
                        'reference' => $reference,
                        'bank_code' => $validated['bank_code'],
                        'account_number' => $validated['account_number'],
                        'narration' => $validated['narration'] ?? 'RemittEase Transfer',
                        'phone' => $validated['phone'],
                        'fee_amount' => $feeAmount,
                        'total_amount' => $totalAmount
                    ]);
                    $remittance->save();

                    // Create a transaction record
                    $transaction = new \App\Models\Transaction([
                        'user_id' => $user->id,
                        'type' => 'remittance',
                        'amount' => $totalAmountXLM,
                        'asset_code' => 'XLM',
                        'recipient_address' => $adminWallet->public_key,
                        'status' => 'pending',
                        'reference' => $reference,
                        'remittance_id' => $remittance->id
                    ]);
                    $transaction->save();

                    // Transfer amount to admin wallet in XLM
                    $transferResult = $this->stellarWalletService->transferFunds(
                        $wallet->public_key,
                        $adminWallet->public_key,
                        $totalAmountXLM,
                        'XLM'
                    );

                    if (!$transferResult['success']) {
                        // Update records to failed status
                        $transaction->status = 'failed';
                        $transaction->failure_reason = $transferResult['message'] ?? 'Blockchain transfer failed';
                        $transaction->save();

                        $remittance->status = 'failed';
                        $remittance->failure_reason = $transferResult['message'] ?? 'Blockchain transfer failed';
                        $remittance->save();

                        throw new \Exception($transferResult['message'] ?? 'Failed to transfer to admin wallet');
                    }

                    // Update transaction with success info
                    $transaction->status = 'completed';
                    $transaction->transaction_hash = $transferResult['transaction_hash'] ?? null;
                    $transaction->save();

                    // Update remittance status to processing (admin needs to manually complete it)
                    $remittance->status = 'processing';
                    $remittance->save();

                    // Schedule a job to verify transaction status after some time
                    \App\Jobs\CheckTransactionStatus::dispatch($transaction->id)
                        ->delay(now()->addMinutes(5));

                    // Send notification to admin
                    if ($admin) {
                        $admin->notify(new \App\Notifications\RemittanceStatusUpdate($remittance));
                    }

                    DB::commit();

                    return $request->wantsJson()
                        ? response()->json([
                            'success' => true,
                            'message' => 'Cash transfer initiated successfully',
                            'transaction_id' => $transaction->id,
                            'remittance_id' => $remittance->id,
                            'reference' => $reference
                        ])
                        : Inertia::render('Wallet/Show', [
                            'success' => true,
                            'message' => 'Cash transfer initiated successfully'
                        ]);
                } catch (\Exception $e) {
                    DB::rollBack();
                    return $request->wantsJson()
                        ? response()->json([
                            'success' => false,
                            'message' => 'Transfer failed: ' . $e->getMessage()
                        ], 500)
                        : Inertia::render('Wallet/Show', [
                            'success' => false,
                            'message' => 'An error occurred while processing the transfer: ' . $e->getMessage()
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
                    'message' => 'An error occurred while processing the transfer: ' . $e->getMessage()
                ]);
        }
    }

    /**
     * Check and update transaction status on the blockchain
     */
    public function checkTransactionStatus($transactionId)
    {
        try {
            $transaction = \App\Models\Transaction::findOrFail($transactionId);

            // Only check pending transactions
            if ($transaction->status !== 'pending') {
                return response()->json([
                    'success' => true,
                    'message' => 'Transaction is already in final state: ' . $transaction->status
                ]);
            }

            // Check transaction status on blockchain
            $result = $this->stellarWalletService->checkTransactionStatus($transaction->transaction_hash);

            if ($result['success']) {
                $transaction->status = 'completed';
                $transaction->save();

                // If this transaction is linked to a remittance, update its status
                if ($transaction->remittance_id) {
                    $remittance = \App\Models\Remittance::find($transaction->remittance_id);
                    if ($remittance && $remittance->status === 'pending') {
                        $remittance->status = 'processing'; // Admin still needs to process it
                        $remittance->save();

                        // Notify admin
                        $admin = \App\Models\User::where('email', 'admin@remittease.com')
                            ->orWhereHas('roles', function($query) {
                                $query->where('name', 'admin');
                            })->first();
                        if ($admin) {
                            $admin->notify(new \App\Notifications\RemittanceStatusUpdate($remittance));
                        }
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Transaction completed successfully',
                    'status' => 'completed'
                ]);
            } else {
                // If transaction failed or not found
                $transaction->status = 'failed';
                $transaction->failure_reason = $result['message'] ?? 'Transaction verification failed';
                $transaction->save();

                // If this transaction is linked to a remittance, update its status
                if ($transaction->remittance_id) {
                    $remittance = \App\Models\Remittance::find($transaction->remittance_id);
                    if ($remittance && $remittance->status === 'pending') {
                        $remittance->status = 'failed';
                        $remittance->failure_reason = $result['message'] ?? 'Transaction verification failed';
                        $remittance->save();
                    }
                }

                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Transaction verification failed',
                    'status' => 'failed'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking transaction status: ' . $e->getMessage()
            ], 500);
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
            'NGN' => 1500.0,    // 1 USD = 1500 NGN
            'GHS' => 12.50,     // 1 USD = 12.50 GHS
            'KES' => 130.0,     // 1 USD = 130 KES
            'UGX' => 3800.0,    // 1 USD = 3800 UGX
            'TZS' => 2500.0,    // 1 USD = 2500 TZS
            'ZAR' => 19.0,      // 1 USD = 19 ZAR
            'XLM' => 4.47,      // 1 USD = 4.47 XLM (current rate)
            'USD' => 1.0        // 1 USD = 1 USD
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

        // Convert to USD (divide by rate since rate is currency per 1 USD)
        return $amount / $rates[$currency];
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

        // Convert from USD to target currency (multiply by rate)
        return $amount * $rates[$currency];
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

        // For XLM, the rate is units per USD, so we multiply
        $xlmAmount = $amountInUSD * $xlmRate;

        // Round to 7 decimal places (Stellar precision)
        return round($xlmAmount, 7);
    }

    /**
     * Test a simple XLM transfer to diagnose issues
     */
    public function testXLMTransfer(Request $request)
    {
        // Only allow authorized users
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $user = auth()->user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'No wallet found for user'
            ], 400);
        }

        // Get admin wallet as recipient
        $admin = \App\Models\User::where('email', 'admin@remittease.com')
            ->orWhereHas('roles', function($query) {
                $query->where('name', 'admin');
            })->first();

        if (!$admin || !$admin->wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Admin wallet not found for testing'
            ], 400);
        }

        $recipientWallet = $admin->wallet;

        // Log the test attempt
        Log::info("Testing XLM transfer: From {$user->email} ({$wallet->public_key}) to admin ({$recipientWallet->public_key})");

        // Run the test transfer
        $result = $this->stellarWalletService->testXLMTransfer(
            $wallet->public_key,
            $recipientWallet->public_key
        );

        return response()->json($result);
    }

    /**
     * Debug Stellar transaction issues
     */
    public function stellarTest()
    {
        try {
            // Get user and admin for test
            $user = auth()->user() ?? \App\Models\User::find(3); // Use logged in user or fallback to user ID 3

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No test user found'
                ]);
            }

            $wallet = $user->wallet;

            if (!$wallet) {
                return response()->json([
                    'success' => false,
                    'message' => 'User has no wallet'
                ]);
            }

            // Get admin wallet
            $admin = \App\Models\User::where('email', 'admin@remittease.com')
                ->orWhereHas('roles', function($query) {
                    $query->where('name', 'admin');
                })->first();

            if (!$admin || !$admin->wallet) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin or admin wallet not found'
                ]);
            }

            // Log wallet details
            $userNativeBalance = $this->stellarWalletService->getWalletNativeBalance($wallet->public_key);
            $adminNativeBalance = $this->stellarWalletService->getWalletNativeBalance($admin->wallet->public_key);

            Log::info('Stellar test wallets', [
                'user_public_key' => $wallet->public_key,
                'user_balance' => $userNativeBalance,
                'admin_public_key' => $admin->wallet->public_key,
                'admin_balance' => $adminNativeBalance
            ]);

            // Try a small test transaction
            $result = $this->stellarWalletService->testXLMTransfer($wallet->public_key, $admin->wallet->public_key);

            Log::info('Stellar test transaction result', $result);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'user_public_key' => $wallet->public_key,
                'user_balance' => $userNativeBalance,
                'admin_public_key' => $admin->wallet->public_key,
                'admin_balance' => $adminNativeBalance,
                'details' => $result['details'] ?? null,
                'raw_error' => $result['raw_error'] ?? null
            ]);

        } catch (\Exception $e) {
            Log::error('Stellar test exception: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Test failed with exception: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Create a demo transaction for testing/demonstration purposes
     * This will create a transaction to the admin account and save it to the database
     */
    public function createDemoTransaction(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'amount' => 'required|numeric|min:0.1',
            ]);

            $user = auth()->user();
            if (!$user || !$user->wallet) {
                return response()->json([
                    'success' => false,
                    'message' => 'No wallet found for user'
                ], 400);
            }

            // Get admin wallet as recipient
            $admin = \App\Models\User::where('email', 'admin@remittease.com')
                ->orWhereHas('roles', function($query) {
                    $query->where('name', 'admin');
                })->first();

            if (!$admin || !$admin->wallet) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin wallet not found for testing'
                ], 400);
            }

            // Create a unique demo transaction hash
            $transactionHash = 'DEMO_TX_' . uniqid();

            // Create the demo transaction using our service
            $transaction = $this->stellarWalletService->createDemoTransaction(
                $user->id,
                $user->wallet->public_key,
                $admin->wallet->public_key,
                $request->amount,
                $transactionHash
            );

            Log::info("Demo transaction created: {$transaction->id}");

            return response()->json([
                'success' => true,
                'message' => 'Demo transaction created successfully',
                'transaction' => [
                    'id' => $transaction->id,
                    'reference' => $transaction->reference,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'asset_code' => $transaction->asset_code,
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'transaction_hash' => $transaction->transaction_hash
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create demo transaction: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create demo transaction: ' . $e->getMessage()
            ], 500);
        }
    }
}
