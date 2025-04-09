<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Remittance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get crypto transactions
        $cryptoTransactions = Transaction::where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($transaction) use ($user) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'amount' => floatval($transaction->amount),
                    'currency' => $transaction->currency,
                    'date' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'status' => $transaction->status,
                    'isOutgoing' => ($transaction->type === 'test')
                        ? true  // Always treat test transactions as outgoing
                        : ($user->wallet ? $transaction->sender_address === $user->wallet->public_key : false),
                    'recipientAddress' => $transaction->recipient_address,
                    'transactionHash' => $transaction->transaction_hash,
                    'transactionType' => 'crypto',
                    'reference' => $transaction->reference,
                    'memo' => $transaction->memo,
                ];
            });

        // Get fiat transactions (remittances)
        $fiatTransactions = Remittance::where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($remittance) {
                return [
                    'id' => $remittance->id,
                    'type' => 'remittance',
                    'amount' => floatval($remittance->amount),
                    'currency' => $remittance->currency,
                    'date' => $remittance->created_at->format('Y-m-d H:i:s'),
                    'status' => $remittance->status,
                    'isOutgoing' => true,
                    'recipient' => $remittance->recipient ? [
                        'name' => $remittance->recipient->name,
                        'country' => $remittance->recipient->country,
                    ] : null,
                    'transactionType' => 'fiat',
                    'reference' => $remittance->reference,
                    'bankCode' => $remittance->bank_code,
                    'accountNumber' => $remittance->account_number,
                    'narration' => $remittance->narration,
                ];
            });

        // Combine and sort all transactions by date
        $allTransactions = $cryptoTransactions->concat($fiatTransactions)
            ->sortByDesc('date')
            ->values();

        return Inertia::render('User/History/Index', [
            'transactions' => $allTransactions,
        ]);
    }
}
