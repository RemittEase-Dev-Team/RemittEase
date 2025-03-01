<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Models\Wallet;

class RemittanceController extends Controller
{
    public function loadCash(Request $request)
    {
        $response = Http::withHeaders([
            'accept' => 'application/json',
            'ngnc-sec-key' => env('LINKIO_SECRET_KEY'),
            'content-type' => 'application/json',
        ])->post('https://api.linkio.world/transactions/v1/onramp', [
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

            return response()->json(['success' => true, 'message' => 'Cash loaded successfully.']);
        } else {
            return response()->json(['success' => false, 'error' => 'Transaction failed.'], 500);
        }
    }

    public function withdrawFunds(Request $request)
    {
        // Similar to loadCash(), but for withdrawals using Linkio.offramp
    }
}
