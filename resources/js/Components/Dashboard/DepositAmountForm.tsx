import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  flag: string;
  rate?: number;
}

interface DepositAmountFormProps {
  selectedProvider: {
    id: string;
    name: string;
    fees: {
      percentage: number;
      fixed: number;
    };
  };
  currencies: Currency[];
  exchangeRates: { [key: string]: number };
  onSubmit: (data: {
    amount: number;
    currency: string;
    estimatedXLM: number;
  }) => void;
  onBack: () => void;
}

const DepositAmountForm: React.FC<DepositAmountFormProps> = ({
  selectedProvider,
  currencies,
  exchangeRates,
  onSubmit,
  onBack,

}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [estimatedXLM, setEstimatedXLM] = useState<number>(0);
  const [fees, setFees] = useState<{
    provider: number;
    network: number;
    total: number;
  }>({
    provider: 0,
    network: 0,
    total: 0,
  });

  useEffect(() => {
    if (amount && selectedCurrency) {
      calculateFees();
    }
  }, [amount, selectedCurrency]);

  console.log("selected prov: ", selectedProvider)

  const calculateFees = () => {
    const amountNum = parseFloat(amount) || 0;
    const providerFee = (amountNum * selectedProvider?.fees?.percentage) + selectedProvider?.fees?.fixed;
    const networkFee = 0.001; // Example network fee in XLM

    setFees({
      provider: providerFee,
      network: networkFee,
      total: providerFee + networkFee,
    });

    // Calculate estimated XLM based on current exchange rate
    if (selectedCurrency && exchangeRates[selectedCurrency?.code]) {
      const xlmRate = exchangeRates?.XLM;
      const currencyRate = exchangeRates[selectedCurrency?.code];
      const estimatedAmount = (amountNum - providerFee) * (xlmRate / currencyRate);
      setEstimatedXLM(estimatedAmount);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedCurrency) return;

    onSubmit({
      amount: parseFloat(amount),
      currency: selectedCurrency?.code,
      estimatedXLM,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onBack}
          className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold dark:text-white">Enter Deposit Amount</h2>
      </div>

      {/* Currency Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Currency
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {currencies?.map((currency) => (
            <button
              key={currency.code}
              type="button"
              onClick={() => setSelectedCurrency(currency)}
              className={`p-3 rounded-lg border ${
                selectedCurrency?.code === currency?.code
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{currency?.flag}</span>
                <span className="font-medium dark:text-white">{currency?.code}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {selectedCurrency?.code}
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      {amount && selectedCurrency && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="font-medium dark:text-white">Fee Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Provider Fee</span>
              <span className="dark:text-white">
                {fees?.provider?.toFixed(2)} {selectedCurrency?.code}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Network Fee</span>
              <span className="dark:text-white">{fees?.network} XLM</span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between font-medium">
                <span className="dark:text-white">You'll Receive (est.)</span>
                <span className="text-green-600 dark:text-green-400">
                  {estimatedXLM?.toFixed(7)} XLM
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!amount || !selectedCurrency}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200"
      >
        Continue to Payment
        <ArrowRight className="inline-block ml-2 w-5 h-5" />
      </button>
    </form>
  );
};

export default DepositAmountForm;
