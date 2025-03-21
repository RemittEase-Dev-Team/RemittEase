import React, { useState } from 'react';
import { Check, ChevronDown, CurrencyIcon, ExternalLink, LockIcon } from 'lucide-react';

interface ProviderCardProps {
  provider: 'moonpay' | 'linkio' | 'yellowcard';
  title: string;
  walletAddress: string | any;
  modal: boolean,
  description: string;
  supportedCurrencies?: string[];
  fees?: string;
  minAmount?: number;
  maxAmount?: number;
  estimatedTime?: string;
  isSelected?: boolean;
  onClick: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  title,
  walletAddress,
  modal,
  description,
  supportedCurrencies = [],
  fees = 'Varies by payment method',
  minAmount = 0,
  maxAmount = 0,
  estimatedTime = '10-30 minutes',
  isSelected = false,
  onClick,
}) => {
  const [currency, setCurrency] = useState<string>('ngn');
  const [amount, setAmount] = useState<string>('');
  const [network, setNetwork] = useState<string>('Stellar');
  const [type, setType] = useState<string>('buy');
  // const walletAddress = 'GDKDSKAR6HEBOOEGWQSAX6GTQDOUAMM7Y7ZINM242ES63Y42SMCUKDMH';

  const getProviderLogo = () => {
    switch (provider) {
      case 'moonpay':
        return '/images/providers/moonpay.svg';
      case 'linkio':
        return '/images/providers/linkio.svg';
      case 'yellowcard':
        return '/images/providers/yellowcard.svg';
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Bridging here...")

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
        amount,
        network,
        wallet_address: walletAddress,
        type,
      },
      onSuccess: (response: any) => console.log(response),
      onLoad: () => console.log('Bridge widget loaded successfully'),
    });
    widget.setup();
    widget.open();
  };

  // console.log("wallet: ", walletAddress)


  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <Check className="w-6 h-6 text-blue-500" />
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="w-12 h-12">
          <img
            src={getProviderLogo()}
            alt={`${title} logo`}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Supported Currencies</span>
          <span className="font-medium dark:text-gray-200">
            {supportedCurrencies.length > 0
              ? supportedCurrencies.join(', ')
              : 'Multiple currencies'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Fees</span>
          <span className="font-medium dark:text-gray-200">{fees}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Limits</span>
          <span className="font-medium dark:text-gray-200">
            {minAmount > 0 && maxAmount > 0
              ? `$${minAmount.toLocaleString()} - $${maxAmount.toLocaleString()}`
              : 'Varies by region'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Estimated Time</span>
          <span className="font-medium dark:text-gray-200">{estimatedTime}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            View details
            <ExternalLink className="w-4 h-4" />
          </span>
          <span className={`px-2 py-1 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
            {isSelected ? 'Selected' : 'Select'}
          </span>
        </div>
      </div>
      {modal && provider === 'linkio' && (
        <form
          onSubmit={handleSubmit}
          className="absolute left-0 right-0 -mt-4 p-6 bg-white dark:bg-gray-800 border-2 border-blue-500/20 rounded-2xl shadow-2xl z-10 animate-slide-down"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-6">
            <div className="relative">
              <label htmlFor="amount" className="block text-sm font-medium mb-2 dark:text-gray-200 opacity-80">
                <span className="flex items-center gap-2">
                  <CurrencyIcon className="w-5 h-5" />
                  Withdrawal Amount
                </span>
              </label>
              <div className="relative group">
                <input
                  id="amount"
                  className="w-full px-4 py-3 border-2 border-transparent rounded-xl bg-gray-50 dark:bg-gray-900/50 text-xl font-semibold transition-all
                     focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/20
                     hover:bg-gray-100 dark:hover:bg-gray-900/75 placeholder-gray-400/80"
                  type="number"
                  placeholder="50,000"
                  min="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="my-2 flex items-center gap-2 justify-end">
                  <span className="text-sm font-medium">
                    ~${Number(amount) / 1200} USD
                  </span>
                </div>

              <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Min: ₦5,000</span>
                <span>1 NGN = $0.00083</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="currency" className="block text-sm font-medium mb-2 dark:text-gray-200 opacity-80">
                    Currency
                  </label>
                  <div className="relative group">
                    <select
                      id="currency"
                      className="w-full px-4 py-3 border-2 border-transparent rounded-xl bg-gray-50 dark:bg-gray-900/50 appearance-none
                         transition-all hover:bg-gray-100 dark:hover:bg-gray-900/75 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      required
                    >
                      <option value="ngn">🇳🇬 Nigerian Naira (NGN)</option>
                      <option value="usd">🇺🇸 US Dollar (USD)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="">
                <button
                  type="submit"
                  className="w-full group relative bg-blue-500  hover:bg-blue-600  
                     text-white font-semibold py-2 px-6 rounded-xl transition-all transform hover:scale-[1.01]
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                >
                  <span className="relative z-10">Deposit</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 
                          transition-opacity group-hover:opacity-20" />
                </button>
              </div>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-2">
                  <LockIcon className="w-4 h-4" />
                  Secured by Link.io • Fees: 1.5% + ₦100
                </span>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 -z-10 opacity-10">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-float" />
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-float delay-200" />
          </div>
        </form>
      )}
    </div>
  );
};

export default ProviderCard;
