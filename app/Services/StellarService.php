<?php

namespace App\Services;

use Soneso\StellarSDK\KeyPair;
use Soneso\StellarSDK\Network;
use Soneso\StellarSDK\StellarSDK;
use Soneso\StellarSDK\TransactionBuilder;
use Soneso\StellarSDK\Xdr\XdrMemo;
use Soneso\StellarSDK\Xdr\XdrMemoType;
use Soneso\StellarSDK\Asset;
use Soneso\StellarSDK\AssetTypeCreditAlphaNum4;
use Soneso\StellarSDK\PaymentOperationBuilder;
use Illuminate\Support\Facades\Log;
use Exception;

class StellarService
{
    protected $sdk;

    public function __construct()
    {
        $horizonUrl = config('services.stellar.horizon_url');
        $this->sdk = StellarSDK::getInstance($horizonUrl);
    }

    /**
     * Create a new Stellar account.
     *
     * @return array
     */
    public function createAccount()
    {
        try {
            $keypair = KeyPair::random();
            $publicKey = $keypair->getAccountId();
            $secretSeed = $keypair->getSecretSeed();

            // Fund the account using Friendbot for testnet
            if (config('services.stellar.network') === 'testnet') {
                $friendbotUrl = "https://friendbot.stellar.org/?addr={$publicKey}";
                file_get_contents($friendbotUrl);
            }

            Log::info("Account created: {$publicKey}");

            return [
                'public_key' => $publicKey,
                'secret_seed' => $secretSeed,
            ];
        } catch (Exception $e) {
            Log::error("Account creation failed: " . $e->getMessage());
            throw new Exception("Failed to create account");
        }
    }

    /**
     * Retrieve account details.
     *
     * @param string $publicKey
     * @return \Soneso\StellarSDK\Responses\AccountResponse
     */
    public function getAccount(string $publicKey)
    {
        try {
            return $this->sdk->requestAccount($publicKey);
        } catch (Exception $e) {
            Log::error("Failed to retrieve account: " . $e->getMessage());
            throw new Exception("Failed to retrieve account details");
        }
    }

    /**
     * Send a payment.
     *
     * @param string $sourceSecret
     * @param string $destinationPublicKey
     * @param string $amount
     * @param string $assetCode
     * @param string $assetIssuer
     * @return \Soneso\StellarSDK\Responses\SubmitTransactionResponse
     */
    public function sendPayment(string $sourceSecret, string $destinationPublicKey, string $amount, string $assetCode = 'XLM', string $assetIssuer = null)
    {
        try {
            $sourceKeypair = KeyPair::fromSecretSeed($sourceSecret);
            $sourceAccount = $this->sdk->requestAccount($sourceKeypair->getAccountId());

            $asset = $assetCode === 'XLM' ? Asset::native() : new AssetTypeCreditAlphaNum4($assetCode, $assetIssuer);

            $paymentOperation = (new PaymentOperationBuilder($destinationPublicKey, $asset, $amount))->build();

            $transaction = (new TransactionBuilder($sourceAccount))
                ->addOperation($paymentOperation)
                ->addMemo(new XdrMemo(XdrMemoType::MEMO_TEXT, 'Payment'))
                ->build();

            $transaction->sign($sourceKeypair, Network::testnet());

            $response = $this->sdk->submitTransaction($transaction);

            Log::info("Payment sent: {$amount} {$assetCode} to {$destinationPublicKey}");

            return $response;
        } catch (Exception $e) {
            Log::error("Payment failed: " . $e->getMessage());
            throw new Exception("Failed to send payment");
        }
    }
}
