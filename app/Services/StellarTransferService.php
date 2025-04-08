<?php

namespace App\Services;

use Soneso\StellarSDK\StellarSDK;
use Soneso\StellarSDK\Crypto\KeyPair;
use Soneso\StellarSDK\Xdr\XdrBuffer;
use Soneso\StellarSDK\Xdr\XdrEncodedOperationResult;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\AdminTransferNotification;
use App\Events\TransferInitiated;
use Illuminate\Support\Facades\DB;

class StellarTransferService
{
    protected $sdk;
    protected $adminKeyPair;
    protected $adminPublicKey;
    protected $adminSecretKey;
    protected $horizonUrl;
    protected $network;
    protected $baseFee;
    protected $minWithdraw;
    protected $maxWithdraw;

    public function __construct()
    {
        $this->horizonUrl = config('services.stellar.horizon_url');
        $this->network = config('services.stellar.network');
        $this->sdk = StellarSDK::getTestNetInstance();

        $this->adminPublicKey = config('services.stellar.admin_public_key');
        $this->adminSecretKey = config('services.stellar.admin_secret_key');
        $this->adminKeyPair = KeyPair::fromSeed($this->adminSecretKey);

        // Configure limits and fees
        $this->baseFee = 0.00001; // Base XLM fee
        $this->minWithdraw = 10; // Minimum XLM withdrawal
        $this->maxWithdraw = 10000; // Maximum XLM withdrawal
    }

    public function calculateTransferFees(float $amount): array
    {
        $serviceFee = $amount * 0.01; // 1% service fee
        $stellarFee = $this->baseFee;
        $totalFee = $serviceFee + $stellarFee;
        $totalAmount = $amount + $totalFee;

        return [
            'amount' => $amount,
            'service_fee' => $serviceFee,
            'stellar_fee' => $stellarFee,
            'total_fee' => $totalFee,
            'total_amount' => $totalAmount,
        ];
    }

    public function validateTransfer(float $amount): array
    {
        if ($amount < $this->minWithdraw) {
            return [
                'valid' => false,
                'message' => "Minimum withdrawal amount is {$this->minWithdraw} XLM"
            ];
        }

        if ($amount > $this->maxWithdraw) {
            return [
                'valid' => false,
                'message' => "Maximum withdrawal amount is {$this->maxWithdraw} XLM"
            ];
        }

        return [
            'valid' => true,
            'message' => 'Transfer amount is valid'
        ];
    }

    public function initiateTransfer(User $user, float $amount, string $destinationAddress): array
    {
        try {
            DB::beginTransaction();

            // Validate transfer amount
            $validation = $this->validateTransfer($amount);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'message' => $validation['message']
                ];
            }

            // Calculate fees
            $fees = $this->calculateTransferFees($amount);

            // Create transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'type' => 'withdrawal',
                'amount' => $amount,
                'fee' => $fees['total_fee'],
                'status' => 'pending',
                'stellar_transaction_id' => null,
                'destination_address' => $destinationAddress,
                'metadata' => [
                    'service_fee' => $fees['service_fee'],
                    'stellar_fee' => $fees['stellar_fee'],
                    'total_amount' => $fees['total_amount']
                ]
            ]);

            // Prepare XLM transfer
            $sourceAccount = $this->sdk->requestAccount($user->stellar_public_key);
            $destinationAccount = $this->sdk->requestAccount($destinationAddress);

            // Create payment operation
            $paymentOperation = (new PaymentOperation(
                $destinationAddress,
                $fees['total_amount'],
                Asset::native()
            ))->setSourceAccount($sourceAccount);

            // Build and sign transaction
            $transaction = (new TransactionBuilder($sourceAccount))
                ->addOperation($paymentOperation)
                ->setFee($fees['stellar_fee'])
                ->build();

            $transaction->sign($user->stellarKeyPair(), $this->network);

            // Submit transaction
            $response = $this->sdk->submitTransaction($transaction);

            // Update transaction record
            $transaction->update([
                'stellar_transaction_id' => $response->getHash(),
                'status' => 'processing'
            ]);

            // Notify admin
            $admin = User::where('role', 'admin')->first();
            if ($admin) {
                $admin->notify(new AdminTransferNotification($transaction));
            }

            // Dispatch event for Flutterwave integration
            event(new TransferInitiated($transaction));

            DB::commit();

            return [
                'success' => true,
                'message' => 'Transfer initiated successfully',
                'transaction_id' => $transaction->id,
                'stellar_hash' => $response->getHash(),
                'fees' => $fees
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stellar transfer failed: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Transfer failed: ' . $e->getMessage()
            ];
        }
    }

    public function checkTransactionStatus(string $transactionHash): array
    {
        try {
            $transaction = $this->sdk->requestTransaction($transactionHash);
            $result = $transaction->getResult();

            return [
                'success' => true,
                'status' => $this->getTransactionStatus($result),
                'message' => $this->getStatusMessage($result)
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to check transaction status: ' . $e->getMessage()
            ];
        }
    }

    protected function getTransactionStatus($result): string
    {
        if ($result->getTrxResult()->getCode() === XdrTransactionResultCode::SUCCESS) {
            return 'completed';
        }
        return 'failed';
    }

    protected function getStatusMessage($result): string
    {
        if ($result->getTrxResult()->getCode() === XdrTransactionResultCode::SUCCESS) {
            return 'Transaction completed successfully';
        }
        return 'Transaction failed';
    }
}
