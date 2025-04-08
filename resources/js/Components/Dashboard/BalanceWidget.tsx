import { Dispatch, SetStateAction } from 'react';
import { CurrencyCode } from '@/types/currency';

interface Wallet {
  publicKey: string;
  formattedPublicKey: string;
  balance: number;
  status: string;
  isVerified: boolean;
  created_at: string;
}

interface BalanceData {
  amount: number | string;
  native: string;  // XLM balance
  token: string;   // Your token balance
}

interface ExchangeRates {
  [key: string]: number;
  XLM: number;
  USD: number;
  EUR: number;
  GBP: number;
  NGN: number;
}

interface BalanceWidgetProps {
  wallet: Wallet | null;
  balance: {
    [key: string]: {
      amount: number;
      change: number;
      percentage: number;
    };
  };
  currencyMain: CurrencyCode;
  setCurrencyMain: (currency: CurrencyCode) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onSend: () => void;
  moonpayEnabled: boolean;
  balances?: BalanceData;
  isLoading?: boolean;
  exchangeRates?: ExchangeRates;
}

const defaultBalances: BalanceData = {
  amount: '0',
  native: '0',
  token: '0'
};

const defaultExchangeRates: ExchangeRates = {
  XLM: 1,
  USD: 1,
  EUR: 1,
  GBP: 1,
  NGN: 1
};

const BalanceWidget: React.FC<BalanceWidgetProps> = ({
  wallet,
  balance,
  currencyMain,
  setCurrencyMain,
  onDeposit,
  onWithdraw,
  onSend,
  moonpayEnabled,
  balances = defaultBalances,
  isLoading = false,
  exchangeRates = defaultExchangeRates
}) => {
  // Use the provided balances or default to 0s if undefined
  const currentBalances = balances || defaultBalances;

  // Convert balance based on selected currency
  const convertBalance = (amount: number, fromCurrency: string, toCurrency: string) => {
    try {
      const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      return amount * rate;
    } catch (error) {
      console.error('Error converting balance:', error);
      return amount;
    }
  };

  // Format currency value
  const formatCurrencyValue = (value: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return value.toString();
    }
  };

  // Get converted balance
  const convertedBalance = wallet ? convertBalance(wallet.balance, 'XLM', currencyMain) : 0;

  // Get current balance data safely
  const currentBalanceData = balance[currencyMain] || { amount: 0, change: 0, percentage: 0 };

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-5 shadow-sm md:col-span-1 lg:col-span-1">
      <div className="bg-gradient-to-r from-blue-100 to-orange-300 dark:bg-gradient-to-r dark:from-blue-900 dark:to-orange-700 rounded-lg p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="text-lg font-semibold">Balance</div>
          <select
            className="px-5 py-1 rounded-full border dark:text-bright-blue border-gray-200 dark:border-gray-700 text-sm"
            value={currencyMain}
            onChange={(e) => setCurrencyMain(e.target.value as CurrencyCode)}
          >
            <option value="XLM">XLM</option>
            <option value="USD">USD</option>
            <option value="NGN">NGN</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div className="text-3xl font-bold mb-1 flex items-center dark:text-gray-100">
          {formatCurrencyValue(convertedBalance, currencyMain)}
        </div>
        <div
          className={`text-sm flex items-center gap-1 ${
            currentBalanceData.change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {currentBalanceData.change >= 0
            ? `+${formatCurrencyValue(currentBalanceData.change, currencyMain)}`
            : `-${formatCurrencyValue(Math.abs(currentBalanceData.change), currencyMain)}`}
          <span className="ml-2">{currentBalanceData.percentage.toFixed(2)}%</span>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        {moonpayEnabled && (
          <button
            onClick={onDeposit}
            className="bg-yellow-700 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex-1 font-medium"
          >
            Deposit
          </button>
        )}
        <button
          onClick={onSend}
          className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex-1 font-medium"
        >
          Send
        </button>
      </div>

      {/* Demo of listing wallet balances */}
      <div className="mt-5">
        <div className="font-semibold mb-3">Wallet</div>
        {Object.entries(balance).map(([cur, data]) => (
          <div key={cur} className="flex justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span>{cur}</span>
            </div>
            <div className="font-medium">
              {formatCurrencyValue(
                typeof data === 'object' && data !== null && 'amount' in data
                  ? Number(data.amount)
                  : 0,
                cur
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Wallet Balance</h2>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">XLM Balance</span>
              <span className="text-lg font-medium dark:text-white">
                {Number(currentBalances.native).toFixed(7)} XLM
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Token Balance</span>
              <span className="text-lg font-medium dark:text-white">
                {Number(currentBalances.token).toFixed(2)} RMT
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceWidget;
