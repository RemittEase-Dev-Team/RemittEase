import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';
import axios from 'axios';

interface DepositFormData {
  [key: string]: string | undefined;
  provider: string;
  currency: string;
  amount: string;
  wallet_address: string;
}

interface WalletProps {
  formattedPublicKey: string;
  wallet: {
    public_key: string
  }
}

interface YellowCardConfig {
  widget_key: string;
  sandbox: boolean;
}

interface TransactionStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: string;
  currency: string;
  timestamp: string;
  error?: string;
}

const Deposit: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { formattedPublicKey, wallet, yellowcard_config } = usePage<PageProps>().props as unknown as {
    formattedPublicKey: WalletProps,
    wallet: any,
    yellowcard_config: YellowCardConfig
  };
  const { url } = usePage();
  const id = url.split('/')[2];

  const [amount, setAmount] = useState<string>('5000');
  const [currency, setCurrency] = useState<string>('ngn');
  const [network, setNetwork] = useState<string>('Stellar');
  const [type, setType] = useState<string>('buy');
  const [isMoonpay, setIsMoonPay] = useState(false);
  const [isYellowCardLoading, setIsYellowCardLoading] = useState(false);
  const [moonpayTransactionId, setMoonpayTransactionId] = useState<string | null>(null);
  const [moonpayError, setMoonpayError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Handle YellowCard widget messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === (yellowcard_config.sandbox ? 'https://sandbox--payments-widget.netlify.app' : 'https://payments-widget.yellowcard.io')) {
        const data = event.data;
        if (data.type === 'transaction_completed') {
          setIsYellowCardLoading(false);
          // Handle successful transaction
          console.log('YellowCard transaction completed:', data);
        } else if (data.type === 'transaction_failed') {
          setIsYellowCardLoading(false);
          // Handle failed transaction
          console.error('YellowCard transaction failed:', data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [yellowcard_config.sandbox]);

  // Handle MoonPay widget messages
  useEffect(() => {
    const handleMoonPayMessage = (event: MessageEvent) => {
      if (event.origin === 'https://buy.moonpay.com') {
        const data = event.data;
        if (data.type === 'transaction_completed') {
          // Handle successful transaction
          setMoonpayTransactionId(data.id);
          handleMoonPayTransaction(data);
        } else if (data.type === 'transaction_failed') {
          setMoonpayError(data.error || 'Transaction failed');
        }
      }
    };

    window.addEventListener('message', handleMoonPayMessage);
    return () => window.removeEventListener('message', handleMoonPayMessage);
  }, []);

  // Function to check transaction status
  const checkTransactionStatus = async (transactionId: string) => {
    setIsCheckingStatus(true);
    try {
      const response = await axios.get(route('deposit.check-status', { id: transactionId }));
      if (response.data.success) {
        setTransactionStatus(response.data.transaction);
        if (response.data.transaction.status === 'completed') {
          // Transaction completed successfully
          setMoonpayError(null);
        } else if (response.data.transaction.status === 'failed') {
          setMoonpayError(response.data.transaction.error || 'Transaction failed');
        }
      }
    } catch (error: any) {
      console.error('Failed to check transaction status:', error);
      setMoonpayError('Failed to check transaction status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Poll transaction status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (moonpayTransactionId && transactionStatus?.status === 'pending') {
      interval = setInterval(() => {
        checkTransactionStatus(moonpayTransactionId);
      }, 5000); // Check every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [moonpayTransactionId, transactionStatus?.status]);

  const handleMoonPayTransaction = async (data: any) => {
    try {
      // Set initial transaction status
      setTransactionStatus({
        id: data.id,
        status: 'pending',
        amount: data.baseCurrencyAmount,
        currency: data.baseCurrencyCode,
        timestamp: new Date().toISOString()
      });

      // Record the transaction
      const response = await axios.post(route('deposit.initiate-fiat-deposit'), {
        provider: 'moonpay',
        currency: data.baseCurrencyCode,
        amount: data.baseCurrencyAmount,
        wallet_address: wallet.public_key,
        transaction_id: data.id,
        metadata: {
          moonpay_data: data,
          network: 'stellar',
          base_currency: data.baseCurrencyCode,
          base_amount: data.baseCurrencyAmount,
          payment_method: data.paymentMethod,
          payment_method_id: data.paymentMethodId,
          status: data.status,
          created_at: data.createdAt
        }
      });

      if (response.data.success) {
        // Update transaction status with the recorded transaction
        setTransactionStatus({
          id: response.data.transaction.id,
          status: response.data.transaction.status,
          amount: response.data.transaction.amount,
          currency: response.data.transaction.currency,
          timestamp: response.data.transaction.timestamp
        });

        // Start checking status
        checkTransactionStatus(response.data.transaction.id);
      } else {
        const errorMessage = response.data.message || 'Failed to record transaction';
        setMoonpayError(errorMessage);
        setTransactionStatus(prev => prev ? {
          ...prev,
          status: 'failed',
          error: errorMessage
        } : null);
      }
    } catch (error: any) {
      console.error('Failed to record MoonPay transaction:', error);
      const errorMessage = error.response?.data?.message || 'Failed to record transaction';
      setMoonpayError(errorMessage);
      setTransactionStatus(prev => prev ? {
        ...prev,
        status: 'failed',
        error: errorMessage
      } : null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const Bridge = (window as any).Bridge;
    if (!Bridge) {
      console.error('Bridge library is not loaded.');
      return;
    }

    const widget = new Bridge({
      key: 'ngnc_p_tk_c05eaad4f8745512660b44d296e2f28916dd26095aec8fabbca0fc65254f2489',
      type: type,
      currency: currency,
      data: {
        amount: amount,
        network: network,
        wallet_address: wallet,
        type: type,
      },
      onSuccess: (response: any) => console.log(response),
      onLoad: () => console.log('Bridge widget loaded successfully'),
    });
    widget.setup();
    widget.open();
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Payment Gateway
          </h2>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 transition-all bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      }
    >
      <Head title="RemittEase Dashboard" />
      {Number(id) === 1 ? (
        <div className="px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all duration-300">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                Linkio Account Funding
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </label>
                    <input
                      id="amount"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      type="number"
                      placeholder="Enter amount"
                      min="5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Currency
                    </label>
                    <select
                      id="currency"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="ngn">NGN - Nigerian Naira</option>
                      <option value="usd">USD - US Dollar</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Network
                    </label>
                    <select
                      id="network"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                    >
                      <option value="Stellar">Stellar Network</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Wallet Address
                    </label>
                    <input
                      id="wallet_address"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                      placeholder="Wallet Address"
                      value={wallet?.public_key}
                      disabled
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-3"
                >
                  Initiate Funding
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Secure transaction powered by{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    'Linkio
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : Number(id) === 2 ? (
        <div>
          <section className='flex justify-center fixed w-full h-full inset-0 items-center mt-20'>
            <div className='bg-white rounded-md p-6'>
              {/* Transaction Status Display */}
              {transactionStatus && (
                <div className="mb-6 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Transaction Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        transactionStatus.status === 'completed' ? 'text-green-600' :
                        transactionStatus.status === 'failed' ? 'text-red-600' :
                        transactionStatus.status === 'processing' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {transactionStatus.status.charAt(0).toUpperCase() + transactionStatus.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{transactionStatus.amount} {transactionStatus.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">{transactionStatus.id}</span>
                    </div>
                    {transactionStatus.error && (
                      <div className="mt-2 p-2 bg-red-50 text-red-700 rounded">
                        {transactionStatus.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {isCheckingStatus && (
                <div className="flex items-center justify-center mb-4 text-blue-600">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Checking transaction status...
                </div>
              )}

              {/* Error Display */}
              {moonpayError && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                  {moonpayError}
                </div>
              )}

              {/* Success Message */}
              {transactionStatus?.status === 'completed' && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                  Transaction completed successfully! Your XLM will be credited to your wallet shortly.
                </div>
              )}

              <MoonPayProvider apiKey="pk_test_8v5c0U65vmujfNeSrA1b3hQSgTd9iE2" debug>
                <MoonPayBuyWidget
                  variant="embedded"
                  baseCurrencyCode="usd"
                  baseCurrencyAmount="100"
                  defaultCurrencyCode="xlm"
                  visible={true}
                  walletAddress={wallet.public_key}
                  onTransactionCreated={async (data) => {
                    setMoonpayTransactionId(data.id);
                    await handleMoonPayTransaction(data);
                  }}
                />
              </MoonPayProvider>
            </div>
          </section>
        </div>
      ) : (
        <div className="px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all duration-300">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                YellowCard Account Funding
              </h3>

              {isYellowCardLoading && (
                <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
                  Processing your transaction...
                </div>
              )}

              <iframe
                id="ycWidgetIframe"
                src={`${yellowcard_config.sandbox ? 'https://sandbox--payments-widget.netlify.app' : 'https://payments-widget.yellowcard.io'}/landing/${yellowcard_config.widget_key}`}
                title="Buy crypto with Yellow Card"
                allow={`camera ${yellowcard_config.sandbox ? 'https://sandbox--payments-widget.netlify.app' : 'https://payments-widget.yellowcard.io'};`}
                style={{ width: '100%', height: '600px', border: 'none' }}
                onLoad={() => setIsYellowCardLoading(true)}
              ></iframe>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Secure transaction powered by{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    YellowCard
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
};

export default Deposit;
