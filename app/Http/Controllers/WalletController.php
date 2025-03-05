<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class WalletController extends Controller
{
    public function connect(Request $request)
    {
        // Implement wallet connection logic
        Log::info('Wallet connect request received: ' . json_encode($request->all()));

        $walletAddress = $request->input('walletAddress');

        if ($walletAddress) {
            Session::put('walletAddress', $walletAddress);
            return response()->json(['message' => 'Wallet connected successfully', 'walletAddress' => $walletAddress]);
        } else {
            return response()->json(['message' => 'Wallet connection failed', 'error' => 'Wallet address not provided'], 400);
        }
    }

    public function sendTransaction(Request $request)
    {
        // TODO: Implement send transaction logic
        Log::info('Send transaction request received: ' . json_encode($request->all()));

        // Simulate transaction processing
        $transactionData = $request->all();
        $transactionHash = '0x' . md5(json_encode($transactionData)); // Generate a dummy transaction hash

        // Store transaction details in the database
        $transaction = new \App\Models\Transaction();
        $transaction->user_id = auth()->id(); // Assuming user is authenticated
        $transaction->transaction_hash = $transactionHash;
        $transaction->amount = $transactionData['amount'] ?? 0; // Assuming amount is passed in the request
        $transaction->currency = $transactionData['currency'] ?? 'USD'; // Assuming currency is passed in the request
        $transaction->status = 'pending'; // Set initial status to pending
        $transaction->save();

        return response()->json(['message' => 'Transaction sent successfully', 'transactionHash' => $transactionHash]);
    }

    public function getBalance(Request $request)
    {
        // TODO: Implement get balance logic
        Log::info('Get balance request received: ' . json_encode($request->all()));

        return response()->json(['balance' => 0]);
    }
}
