<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Models\Wallet;
use App\Services\MoonPayService;
use Inertia\Inertia;

class RemittanceController extends Controller
{
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
}
