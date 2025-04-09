<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Remittance;
use App\Models\User;
use App\Services\StellarWalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ManageTransactionController extends Controller
{
    protected $stellarWalletService;

    public function __construct(StellarWalletService $stellarWalletService)
    {
        $this->stellarWalletService = $stellarWalletService;
    }

    public function index()
    {
        $pendingCount = Transaction::where('status', 'pending')->count();
        $completedCount = Transaction::where('status', 'completed')->count();
        $failedCount = Transaction::where('status', 'failed')->count();

        $transactions = Transaction::with('user')
            ->latest()
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'user_id' => $transaction->user_id,
                    'user_name' => $transaction->user ? $transaction->user->name : 'Unknown',
                    'user_email' => $transaction->user ? $transaction->user->email : 'Unknown',
                    'transaction_hash' => $transaction->transaction_hash,
                    'amount' => floatval($transaction->amount),
                    'currency' => $transaction->currency ?? $transaction->asset_code,
                    'type' => $transaction->type,
                    'status' => $transaction->status,
                    'reference' => $transaction->reference,
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'sender_address' => $transaction->sender_address,
                    'recipient_address' => $transaction->recipient_address,
                ];
            });

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'stats' => [
                'pending' => $pendingCount,
                'completed' => $completedCount,
                'failed' => $failedCount,
                'total' => $pendingCount + $completedCount + $failedCount,
            ],
        ]);
    }

    public function approve($id)
    {
        try {
            $transaction = Transaction::findOrFail($id);

            if ($transaction->status !== 'pending') {
                return redirect()->back()->with('error', 'Only pending transactions can be approved.');
            }

            // Perform approval logic
            $transaction->status = 'completed';
            $transaction->save();

            // If it's a remittance transaction, we may need to execute the actual transfer
            if ($transaction->type === 'remittance' && $transaction->remittance_id) {
                $remittance = Remittance::find($transaction->remittance_id);
                if ($remittance) {
                    $remittance->status = 'completed';
                    $remittance->save();
                }
            }

            return redirect()->back()->with('success', 'Transaction approved successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to approve transaction: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to approve transaction: ' . $e->getMessage());
        }
    }

    public function reject($id)
    {
        try {
            $transaction = Transaction::findOrFail($id);

            if ($transaction->status !== 'pending') {
                return redirect()->back()->with('error', 'Only pending transactions can be rejected.');
            }

            // Perform rejection logic
            $transaction->status = 'failed';
            $transaction->failure_reason = 'Rejected by admin';
            $transaction->save();

            // If it's a remittance transaction, update the remittance status
            if ($transaction->type === 'remittance' && $transaction->remittance_id) {
                $remittance = Remittance::find($transaction->remittance_id);
                if ($remittance) {
                    $remittance->status = 'failed';
                    $remittance->save();
                }
            }

            return redirect()->back()->with('success', 'Transaction rejected successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to reject transaction: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to reject transaction: ' . $e->getMessage());
        }
    }

    public function bulkApprove(Request $request)
    {
        try {
            $transactionIds = $request->input('transaction_ids', []);

            if (empty($transactionIds)) {
                return redirect()->back()->with('error', 'No transactions selected.');
            }

            $count = Transaction::whereIn('id', $transactionIds)
                ->where('status', 'pending')
                ->update(['status' => 'completed']);

            // Also update related remittances
            $relatedRemittanceIds = Transaction::whereIn('id', $transactionIds)
                ->where('type', 'remittance')
                ->whereNotNull('remittance_id')
                ->pluck('remittance_id');

            if (!empty($relatedRemittanceIds)) {
                Remittance::whereIn('id', $relatedRemittanceIds)
                    ->update(['status' => 'completed']);
            }

            return redirect()->back()->with('success', "{$count} transactions approved successfully.");
        } catch (\Exception $e) {
            Log::error('Failed to process bulk approval: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to process bulk approval: ' . $e->getMessage());
        }
    }

    public function bulkReject(Request $request)
    {
        try {
            $transactionIds = $request->input('transaction_ids', []);

            if (empty($transactionIds)) {
                return redirect()->back()->with('error', 'No transactions selected.');
            }

            $count = Transaction::whereIn('id', $transactionIds)
                ->where('status', 'pending')
                ->update([
                    'status' => 'failed',
                    'failure_reason' => 'Rejected in bulk by admin'
                ]);

            // Also update related remittances
            $relatedRemittanceIds = Transaction::whereIn('id', $transactionIds)
                ->where('type', 'remittance')
                ->whereNotNull('remittance_id')
                ->pluck('remittance_id');

            if (!empty($relatedRemittanceIds)) {
                Remittance::whereIn('id', $relatedRemittanceIds)
                    ->update(['status' => 'failed']);
            }

            return redirect()->back()->with('success', "{$count} transactions rejected successfully.");
        } catch (\Exception $e) {
            Log::error('Failed to process bulk rejection: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to process bulk rejection: ' . $e->getMessage());
        }
    }

    public function scheduleTransactions(Request $request)
    {
        try {
            $request->validate([
                'schedule_type' => 'required|in:hourly,daily,weekly',
                'transaction_ids' => 'required|array',
                'transaction_ids.*' => 'exists:transactions,id',
            ]);

            $scheduleType = $request->input('schedule_type');
            $transactionIds = $request->input('transaction_ids');

            // Calculate the next execution time based on schedule type
            $nextExecution = match ($scheduleType) {
                'hourly' => Carbon::now()->addHour(),
                'daily' => Carbon::now()->addDay(),
                'weekly' => Carbon::now()->addWeek(),
                default => Carbon::now()->addDay(),
            };

            // Store the schedule information (you would need to create this table)
            DB::table('scheduled_transactions')->insert([
                'transaction_ids' => json_encode($transactionIds),
                'schedule_type' => $scheduleType,
                'next_execution' => $nextExecution,
                'created_by' => auth()->id(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            return redirect()->back()->with('success', 'Transactions scheduled successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to schedule transactions: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to schedule transactions: ' . $e->getMessage());
        }
    }
}
