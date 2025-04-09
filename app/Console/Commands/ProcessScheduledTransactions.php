<?php

namespace App\Console\Commands;

use App\Models\ScheduledTransaction;
use App\Models\Transaction;
use App\Models\Remittance;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessScheduledTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transactions:process-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process scheduled transactions that are due for execution';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Looking for scheduled transactions to process...');

        // Get all active scheduled transactions that are due
        $scheduledTransactions = ScheduledTransaction::where('is_active', true)
            ->where('next_execution', '<=', now())
            ->get();

        $this->info("Found {$scheduledTransactions->count()} scheduled transactions to process.");

        if ($scheduledTransactions->isEmpty()) {
            $this->info('No scheduled transactions to process at this time.');
            return 0;
        }

        foreach ($scheduledTransactions as $scheduled) {
            $this->processScheduledTransaction($scheduled);
        }

        $this->info('Scheduled transaction processing completed.');
        return 0;
    }

    protected function processScheduledTransaction(ScheduledTransaction $scheduled)
    {
        $this->info("Processing scheduled transaction ID: {$scheduled->id}");
        $transactionIds = $scheduled->transaction_ids;

        if (empty($transactionIds)) {
            $this->warn("No transaction IDs found for scheduled transaction {$scheduled->id}");
            $scheduled->updateNextExecution();
            return;
        }

        $this->info("Processing " . count($transactionIds) . " transactions");

        $successCount = 0;
        $failCount = 0;

        foreach ($transactionIds as $id) {
            try {
                $transaction = Transaction::find($id);

                if (!$transaction) {
                    $this->error("Transaction ID {$id} not found");
                    $failCount++;
                    continue;
                }

                if ($transaction->status !== 'pending') {
                    $this->warn("Transaction ID {$id} is not in pending status. Current status: {$transaction->status}");
                    $failCount++;
                    continue;
                }

                // Update transaction status
                $transaction->status = 'completed';
                $transaction->save();

                // If it's a remittance, update the remittance status too
                if ($transaction->type === 'remittance' && $transaction->remittance_id) {
                    $remittance = Remittance::find($transaction->remittance_id);
                    if ($remittance) {
                        $remittance->status = 'completed';
                        $remittance->save();
                        $this->info("Updated remittance ID {$remittance->id} status to completed");
                    }
                }

                $this->info("Transaction ID {$id} processed successfully");
                $successCount++;
            } catch (\Exception $e) {
                $this->error("Failed to process transaction ID {$id}: " . $e->getMessage());
                Log::error("Failed to process scheduled transaction {$id}: " . $e->getMessage());
                $failCount++;
            }
        }

        $this->info("Processed {$successCount} transactions successfully, {$failCount} failed");

        // Update the next execution time for this schedule
        $scheduled->updateNextExecution();
    }
}
