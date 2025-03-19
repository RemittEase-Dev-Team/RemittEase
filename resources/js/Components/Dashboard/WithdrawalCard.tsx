import React, { useState } from 'react';
import { Check, ExternalLink } from 'lucide-react';

interface WithdrawalCardProps {
  provider: 'moonpay' | 'linkio' | 'yellowcard';
  title: string;
  walletAddress: string | any;
  modal: boolean;
  description: string;
  supportedCurrencies?: string[];
  fees?: string;
  minAmount?: number;
  maxAmount?: number;
  estimatedTime?: string;
  isSelected?: boolean;
  onClick: () => void;
}

const WithdrawalCard: React.FC<WithdrawalCardProps> = ({
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
  const [network] = useState<string>('Stellar');
  const [type] = useState<string>('sell');

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
    
    if (!amount || Number(amount) < 5000) {
      alert('Minimum withdrawal amount is 5000');
      return;
    }

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
        wallet_address: walletAddress,
        type,
      },
      onSuccess: (response: any) => console.log(response),
      onError: (error: any) => console.error(error),
      onLoad: () => console.log('Bridge widget loaded successfully'),
    });
    
    widget.setup();
    widget.open();
  };

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
          <span className={`px-2 py-1 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {isSelected ? 'Selected' : 'Select'}
          </span>
        </div>
      </div>

      {modal && provider === 'linkio' && (
        <form 
          onSubmit={handleSubmit}
          className="absolute left-0 right-0 mt-4 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Amount
              </label>
              <input
                id="amount"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                type="number"
                placeholder="50000"
                min="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Currency
              </label>
              <select
                id="currency"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
              >
                <option value="ngn">NGN</option>
                <option value="usd">USD</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Proceed to Withdraw
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WithdrawalCard;