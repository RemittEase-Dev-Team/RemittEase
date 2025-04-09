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
use App\Models\Wallet;
use App\Models\Currency;
use Illuminate\Support\Str;

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

    /**
     * Display pending transactions
     */
    public function pending()
    {
        $pendingCount = Transaction::where('status', 'pending')->count();
        $completedCount = Transaction::where('status', 'completed')->count();
        $failedCount = Transaction::where('status', 'failed')->count();

        $transactions = Transaction::with('user')
            ->where('status', 'pending')
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
                    'network' => config('stellar.network', 'testnet'),
                ];
            });

        return Inertia::render('Admin/Transactions/Pending', [
            'transactions' => $transactions,
            'stats' => [
                'pending' => $pendingCount,
                'completed' => $completedCount,
                'failed' => $failedCount,
                'total' => $pendingCount + $completedCount + $failedCount,
            ],
        ]);
    }

    /**
     * Display completed transactions
     */
    public function completed()
    {
        $pendingCount = Transaction::where('status', 'pending')->count();
        $completedCount = Transaction::where('status', 'completed')->count();
        $failedCount = Transaction::where('status', 'failed')->count();

        $transactions = Transaction::with('user')
            ->where('status', 'completed')
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
                    'network' => config('stellar.network', 'testnet'),
                ];
            });

        return Inertia::render('Admin/Transactions/Completed', [
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

    /**
     * Display the specified transaction
     */
    public function show($id)
    {
        try {
            $transaction = Transaction::with('user')->findOrFail($id);

            // Determine if the transaction is related to a remittance
            $remittance = null;
            if ($transaction->remittance_id) {
                $remittance = Remittance::find($transaction->remittance_id);
            }

            // Get the wallet details if available
            $senderWallet = null;
            $recipientWallet = null;

            if ($transaction->sender_wallet_id) {
                $senderWallet = Wallet::find($transaction->sender_wallet_id);
            }

            if ($transaction->recipient_wallet_id) {
                $recipientWallet = Wallet::find($transaction->recipient_wallet_id);
            }

            // Load transaction history for this user
            $relatedTransactions = Transaction::where('user_id', $transaction->user_id)
                ->where('id', '!=', $transaction->id)
                ->latest()
                ->take(5)
                ->get();

            return Inertia::render('Admin/Transactions/Show', [
                'transaction' => [
                    'id' => $transaction->id,
                    'user_id' => $transaction->user_id,
                    'user_name' => $transaction->user ? $transaction->user->name : 'Unknown',
                    'user_email' => $transaction->user ? $transaction->user->email : 'Unknown',
                    'transaction_hash' => $transaction->transaction_hash,
                    'amount' => floatval($transaction->amount),
                    'currency' => $transaction->currency ?? $transaction->asset_code ?? 'XLM',
                    'type' => $transaction->type,
                    'status' => $transaction->status,
                    'reference' => $transaction->reference,
                    'memo' => $transaction->memo,
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $transaction->updated_at->format('Y-m-d H:i:s'),
                    'sender_address' => $transaction->sender_address,
                    'recipient_address' => $transaction->recipient_address,
                    'failure_reason' => $transaction->failure_reason,
                    'metadata' => $transaction->metadata,
                ],
                'remittance' => $remittance ? [
                    'id' => $remittance->id,
                    'status' => $remittance->status,
                    'amount' => floatval($remittance->amount),
                    'currency' => $remittance->currency,
                    'recipient_name' => $remittance->recipient_name,
                    'recipient_account' => $remittance->account_number,
                    'recipient_bank' => $remittance->bank_name,
                    'created_at' => $remittance->created_at->format('Y-m-d H:i:s'),
                ] : null,
                'wallets' => [
                    'sender' => $senderWallet ? [
                        'id' => $senderWallet->id,
                        'public_key' => $senderWallet->public_key,
                        'balance' => floatval($senderWallet->balance),
                    ] : null,
                    'recipient' => $recipientWallet ? [
                        'id' => $recipientWallet->id,
                        'public_key' => $recipientWallet->public_key,
                    ] : null,
                ],
                'related_transactions' => $relatedTransactions->map(function ($t) {
                    return [
                        'id' => $t->id,
                        'type' => $t->type,
                        'amount' => floatval($t->amount),
                        'currency' => $t->currency ?? $t->asset_code ?? 'XLM',
                        'status' => $t->status,
                        'created_at' => $t->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to show transaction: ' . $e->getMessage());
            return redirect()->route('admin.transactions')->with('error', 'Failed to load transaction: ' . $e->getMessage());
        }
    }

    /**
     * Display the bulk remittance form
     */
    public function bulkRemittanceForm()
    {
        // Get available currencies
        $currencies = Currency::all();

        // Get recent bulk processes
        $recentBulkProcesses = DB::table('scheduled_transactions')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Transactions/BulkRemittance', [
            'currencies' => $currencies,
            'recent_processes' => $recentBulkProcesses->map(function($process) {
                return [
                    'id' => $process->id,
                    'transaction_count' => count(json_decode($process->transaction_ids)),
                    'schedule_type' => $process->schedule_type,
                    'next_execution' => Carbon::parse($process->next_execution)->format('Y-m-d H:i:s'),
                    'is_active' => $process->is_active,
                    'created_at' => Carbon::parse($process->created_at)->format('Y-m-d H:i:s'),
                ];
            }),
        ]);
    }

    /**
     * Process a bulk remittance request
     */
    public function processBulkRemittance(Request $request)
    {
        try {
            $request->validate([
                'recipients' => 'required|array',
                'recipients.*.name' => 'required|string',
                'recipients.*.email' => 'nullable|email',
                'recipients.*.account_number' => 'required|string',
                'recipients.*.bank_code' => 'required|string',
                'recipients.*.amount' => 'required|numeric|min:0.01',
                'currency' => 'required|string',
                'schedule_type' => 'nullable|in:hourly,daily,weekly',
                'is_recurring' => 'boolean',
                'notes' => 'nullable|string',
            ]);

            $recipients = $request->input('recipients');
            $currency = $request->input('currency');
            $scheduleType = $request->input('schedule_type', 'daily');
            $isRecurring = $request->input('is_recurring', false);
            $notes = $request->input('notes');

            // Create transactions for each recipient
            $transactionIds = [];

            foreach ($recipients as $recipient) {
                // Create a remittance record
                $remittance = new Remittance();
                $remittance->user_id = auth()->id();
                $remittance->recipient_name = $recipient['name'];
                $remittance->account_number = $recipient['account_number'];
                $remittance->bank_code = $recipient['bank_code'];
                $remittance->bank_name = $this->getBankName($recipient['bank_code']);
                $remittance->amount = $recipient['amount'];
                $remittance->currency = $currency;
                $remittance->status = 'pending';
                $remittance->reference = 'BULK_' . strtoupper(Str::random(8));
                $remittance->save();

                // Create a transaction record
                $transaction = new Transaction();
                $transaction->user_id = auth()->id();
                $transaction->remittance_id = $remittance->id;
                $transaction->type = 'remittance';
                $transaction->amount = $recipient['amount'];
                $transaction->currency = $currency;
                $transaction->asset_code = $currency;
                $transaction->recipient_address = $recipient['account_number'];
                $transaction->status = 'pending';
                $transaction->reference = $remittance->reference;
                $transaction->memo = 'Bulk remittance: ' . ($recipient['name'] ?? 'Recipient');
                $transaction->save();

                $transactionIds[] = $transaction->id;
            }

            // Check if we need to schedule these transactions
            if ($request->has('schedule_type')) {
                // Calculate the next execution time based on schedule type
                $nextExecution = match ($scheduleType) {
                    'hourly' => Carbon::now()->addHour(),
                    'daily' => Carbon::now()->addDay(),
                    'weekly' => Carbon::now()->addWeek(),
                    default => Carbon::now()->addDay(),
                };

                // Store the schedule information
                DB::table('scheduled_transactions')->insert([
                    'transaction_ids' => json_encode($transactionIds),
                    'schedule_type' => $scheduleType,
                    'next_execution' => $nextExecution,
                    'is_active' => true,
                    'is_recurring' => $isRecurring,
                    'notes' => $notes,
                    'created_by' => auth()->id(),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);

                return redirect()->route('admin.transactions')->with('success', 'Bulk remittance scheduled successfully. ' . count($transactionIds) . ' transactions will be processed at ' . $nextExecution->format('Y-m-d H:i:s'));
            } else {
                // Process immediately
                $successCount = 0;
                $failCount = 0;

                foreach ($transactionIds as $id) {
                    $transaction = Transaction::find($id);
                    if ($transaction) {
                        try {
                            $transaction->status = 'completed';
                            $transaction->save();

                            if ($transaction->remittance_id) {
                                $remittance = Remittance::find($transaction->remittance_id);
                                if ($remittance) {
                                    $remittance->status = 'completed';
                                    $remittance->save();
                                }
                            }

                            $successCount++;
                        } catch (\Exception $e) {
                            Log::error('Failed to process bulk transaction ID ' . $id . ': ' . $e->getMessage());
                            $failCount++;
                        }
                    }
                }

                return redirect()->route('admin.transactions')->with('success', "Bulk remittance processed. {$successCount} transactions completed, {$failCount} failed.");
            }
        } catch (\Exception $e) {
            Log::error('Failed to process bulk remittance: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to process bulk remittance: ' . $e->getMessage());
        }
    }

    /**
     * Process a CSV file upload for bulk remittance
     */
    public function uploadBulkRemittanceFile(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:csv,txt',
                'currency' => 'required|string',
                'schedule_type' => 'nullable|in:hourly,daily,weekly',
                'is_recurring' => 'boolean',
            ]);

            $file = $request->file('file');
            $currency = $request->input('currency');
            $scheduleType = $request->input('schedule_type', 'daily');
            $isRecurring = $request->input('is_recurring', false);

            // Parse the CSV file
            $recipients = [];
            $handle = fopen($file->getPathname(), 'r');

            // Skip the header row
            $header = fgetcsv($handle);

            while (($data = fgetcsv($handle)) !== false) {
                // Expected format: Name, Account Number, Bank Code, Amount, Email (optional)
                $recipient = [
                    'name' => $data[0] ?? '',
                    'account_number' => $data[1] ?? '',
                    'bank_code' => $data[2] ?? '',
                    'amount' => floatval($data[3] ?? 0),
                    'email' => $data[4] ?? null,
                ];

                if (!empty($recipient['name']) && !empty($recipient['account_number']) && !empty($recipient['bank_code']) && $recipient['amount'] > 0) {
                    $recipients[] = $recipient;
                }
            }

            fclose($handle);

            if (empty($recipients)) {
                return redirect()->back()->with('error', 'No valid recipients found in the CSV file.');
            }

            // Create a request with the parsed data
            $bulkRequest = new Request([
                'recipients' => $recipients,
                'currency' => $currency,
                'schedule_type' => $scheduleType,
                'is_recurring' => $isRecurring,
                'notes' => 'Imported from CSV file: ' . $file->getClientOriginalName(),
            ]);

            // Process the bulk remittance
            return $this->processBulkRemittance($bulkRequest);
        } catch (\Exception $e) {
            Log::error('Failed to process CSV upload: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to process CSV upload: ' . $e->getMessage());
        }
    }

    /**
     * Get bank name from bank code
     */
    protected function getBankName($bankCode)
    {
        // This would come from a database of banks or an API
        // Simplified example
        $banks = [
            '044' => 'Access Bank',
            '023' => 'Citibank',
            '063' => 'Diamond Bank',
            '050' => 'EcoBank',
            '070' => 'Fidelity Bank',
            '011' => 'First Bank of Nigeria',
            '214' => 'First City Monument Bank',
            '058' => 'Guaranty Trust Bank',
            '030' => 'Heritage Bank',
            '301' => 'Jaiz Bank',
            '082' => 'Keystone Bank',
            '101' => 'Providus Bank',
            '076' => 'Polaris Bank',
            '221' => 'Stanbic IBTC Bank',
            '068' => 'Standard Chartered Bank',
            '232' => 'Sterling Bank',
            '100' => 'Suntrust Bank',
            '032' => 'Union Bank',
            '033' => 'United Bank for Africa',
            '215' => 'Unity Bank',
            '035' => 'Wema Bank',
            '057' => 'Zenith Bank',
        ];

        return $banks[$bankCode] ?? 'Unknown Bank';
    }
}
