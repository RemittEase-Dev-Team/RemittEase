<?php

namespace App\Services;

use Soneso\StellarSDK\KeyPair;
use Soneso\StellarSDK\Network;
use Soneso\StellarSDK\StellarSDK;
use Soneso\StellarSDK\TransactionBuilder;
use Soneso\StellarSDK\Xdr\XdrMemo;
use Soneso\StellarSDK\Xdr\XdrMemoType;

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
        $keypair = KeyPair::random();
        $publicKey = $keypair->getAccountId();
        $secretSeed = $keypair->getSecretSeed();

        // Fund the account using Friendbot for testnet
        if (config('services.stellar.network') === 'testnet') {
            $friendbotUrl = "https://friendbot.stellar.org/?addr={$publicKey}";
            file_get_contents($friendbotUrl);
        }

        return [
            'public_key' => $publicKey,
            'secret_seed' => $secretSeed,
        ];
    }

    /**
     * Retrieve account details.
     *
     * @param string $publicKey
     * @return \Soneso\StellarSDK\Responses\AccountResponse
     */
    public function getAccount(string $publicKey)
    {
        return $this->sdk->requestAccount($publicKey);
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
        $sourceKeypair = KeyPair::fromSecretSeed($sourceSecret);
        $sourceAccount = $this->sdk->requestAccount($sourceKeypair->getAccountId());

        $asset = $assetCode === 'XLM' ? Asset::native() : new AssetTypeCreditAlphaNum4($assetCode, $assetIssuer);

        $paymentOperation = (new PaymentOperationBuilder($destinationPublicKey, $asset, $amount))->build();

        $transaction = (new TransactionBuilder($sourceAccount))
            ->addOperation($paymentOperation)
            ->addMemo(new XdrMemo(XdrMemoType::MEMO_TEXT, 'Payment'))
            ->build();

        $transaction->sign($sourceKeypair, Network::testnet());

        return $this->sdk->submitTransaction($transaction);
    }
}
