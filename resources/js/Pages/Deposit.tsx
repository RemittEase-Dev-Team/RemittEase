import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';

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

const Deposit: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { formattedPublicKey, wallet } = usePage<PageProps>().props as unknown as { formattedPublicKey: WalletProps, wallet: any };
  const { url } = usePage()

  const id = url.split('/')[2]

  // const {data, setData, post} = useForm<DepositFormData>({
  //   wallet: '',
  //   format: ''

  // })
  const [amount, setAmount] = useState<string>('5000');
  const [currency, setCurrency] = useState<string>('ngn');
  const [network, setNetwork] = useState<string>('Stellar');
  const [type, setType] = useState<string>('buy');
  const [isMoonpay, setIsMoonPay] = useState(false)


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

  // console.log("des: ", url.split('/')[2])

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
          {/* <div className="px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all duration-300">
              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                  Moonpay Account Funding
                </h3>

                <form
                  //  onSubmit={handleSubmit} 
                  className="space-y-6">
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
                        <option value="xml">XML - Steller</option>
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
                    // type="submit"
                    onClick={() => setIsMoonPay(true)}
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
                      Moonpay
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div> */}
          {/* {isMoonpay && ( */}
          <section className='flex w-full justify-center fixed w-full h-full inset-0 items-center mt-20'>
            <div className='bg-white rounded-md'>
              <MoonPayProvider apiKey="pk_test_8v5c0U65vmujfNeSrA1b3hQSgTd9iE2" debug>
                <MoonPayBuyWidget
                  variant="embedded"
                  baseCurrencyCode="usd"
                  baseCurrencyAmount="100"
                  defaultCurrencyCode="xlm"
                  visible={true}
                />
              </MoonPayProvider>
            </div>
          </section>
          {/* )} */}
        </div>
      ) : (
        <div className="px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all duration-300">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                YellowCard Account Funding
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
