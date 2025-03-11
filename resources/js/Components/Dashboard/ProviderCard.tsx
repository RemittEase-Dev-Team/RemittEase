import React from 'react';
import { Check, ExternalLink } from 'lucide-react';

interface ProviderCardProps {
  provider: 'moonpay' | 'linkio' | 'yellowcard';
  title: string;
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
  description,
  supportedCurrencies = [],
  fees = 'Varies by payment method',
  minAmount = 0,
  maxAmount = 0,
  estimatedTime = '10-30 minutes',
  isSelected = false,
  onClick,
}) => {
  const getProviderLogo = () => {
    switch (provider) {
      case 'moonpay':
        return '/images/providers/moonpay-logo.svg';
      case 'linkio':
        return '/images/providers/linkio-logo.svg';
      case 'yellowcard':
        return '/images/providers/yellowcard-logo.svg';
      default:
        return '';
    }
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
          <span className={`px-2 py-1 rounded ${
            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {isSelected ? 'Selected' : 'Select'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
