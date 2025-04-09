<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Transaction;
use App\Services\StellarWalletService;
use App\Models\Remittance;
use App\Models\User;
use App\Notifications\RemittanceStatusUpdate;
use Illuminate\Support\Facades\Log;

class CheckTransactionStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The transaction ID to check.
     *
     * @var int
     */
    protected $transactionId;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(int $transactionId)
    {
        $this->transactionId = $transactionId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(StellarWalletService $stellarWalletService)
    {
        try {
            Log::info("Checking transaction status for transaction ID: {$this->transactionId}");

            $transaction = Transaction::find($this->transactionId);

            if (!$transaction) {
                Log::error("Transaction not found: {$this->transactionId}");
                return;
            }

            // Only check pending transactions
            if ($transaction->status !== 'pending') {
                Log::info("Transaction {$this->transactionId} is already in final state: {$transaction->status}");
                return;
            }

            // If no transaction hash, we can't check status
            if (!$transaction->transaction_hash) {
                Log::error("Transaction {$this->transactionId} has no transaction hash to check");
                $transaction->status = 'failed';
                $transaction->failure_reason = 'No transaction hash available for verification';
                $transaction->save();
                return;
            }

            // Check transaction status on blockchain
            $result = $stellarWalletService->checkTransactionStatus($transaction->transaction_hash);

            if ($result['success']) {
                Log::info("Transaction {$this->transactionId} verified successfully on blockchain");
                $transaction->status = 'completed';
                $transaction->save();

                // If this transaction is linked to a remittance, update its status
                if ($transaction->remittance_id) {
                    $remittance = Remittance::find($transaction->remittance_id);
                    if ($remittance && $remittance->status === 'pending') {
                        $remittance->status = 'processing'; // Admin still needs to process it
                        $remittance->save();

                        // Notify admin - using Spatie's role system
                        $admin = User::role('admin')->first();
                        if ($admin) {
                            $admin->notify(new RemittanceStatusUpdate($remittance));
                        }

                        Log::info("Remittance {$remittance->id} status updated to processing");
                    }
                }
            } else {
                // If transaction failed or not found
                Log::warning("Transaction {$this->transactionId} failed verification: " . ($result['message'] ?? 'Unknown error'));
                $transaction->status = 'failed';
                $transaction->failure_reason = $result['message'] ?? 'Transaction verification failed';
                $transaction->save();

                // If this transaction is linked to a remittance, update its status
                if ($transaction->remittance_id) {
                    $remittance = Remittance::find($transaction->remittance_id);
                    if ($remittance && $remittance->status === 'pending') {
                        $remittance->status = 'failed';
                        $remittance->failure_reason = $result['message'] ?? 'Transaction verification failed';
                        $remittance->save();

                        Log::info("Remittance {$remittance->id} status updated to failed");
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("Error checking transaction {$this->transactionId} status: " . $e->getMessage());

            // If we fail to check, we'll mark the transaction as failed after all retries
            if ($this->attempts() >= $this->tries) {
                $transaction = Transaction::find($this->transactionId);
                if ($transaction && $transaction->status === 'pending') {
                    $transaction->status = 'failed';
                    $transaction->failure_reason = 'Error checking transaction status: ' . $e->getMessage();
                    $transaction->save();

                    // Update remittance if needed
                    if ($transaction->remittance_id) {
                        $remittance = Remittance::find($transaction->remittance_id);
                        if ($remittance && $remittance->status === 'pending') {
                            $remittance->status = 'failed';
                            $remittance->failure_reason = 'Error checking transaction status: ' . $e->getMessage();
                            $remittance->save();
                        }
                    }
                }
            }

            // Rethrow to trigger job failure
            throw $e;
        }
    }
}
