import { useState } from 'react';
import { ArrowDown, ChevronDown } from 'lucide-react';

export default function SwapWidget() {
  const [fromAmount, setFromAmount] = useState(10);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [toAmount, setToAmount] = useState(1400);

  const handleConvert = () => {
    if (fromCurrency === 'USD' && toCurrency === 'NGN') {
      setToAmount(fromAmount * 1450);
    } else {
      setToAmount(fromAmount * 100);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <div className="text-lg font-semibold mb-4 dark:text-gray-100">Swap currencies</div>

      <div className="mb-4">
        <div className="text-sm mb-2 dark:text-gray-100">You pay</div>
        <div className="flex items-center justify-between dark:bg-gray-800">
          <input
            type="number"
            className="text-2xl font-semibold outline-none w-1/2 dark:text-gray-100 dark:bg-gray-800"
            value={fromAmount}
            onChange={(e) => setFromAmount(Number(e.target.value))}
          />
          <button className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2 dark:bg-gray-800">
            <span className="font-medium dark:text-gray-100">{fromCurrency}</span>
            <ChevronDown size={18} className="dark:text-white" />
          </button>
        </div>
      </div>

      <div className="flex justify-center my-4 dark:bg-gray-800">
        <div className="bg-gray-100 dark:bg-blue-400 p-2 rounded-full">
          <ArrowDown size={20} className="text-gray-500" />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm mb-2 dark:text-gray-100">You get</div>
        <div className="flex items-center justify-between dark:bg-gray-800">
          <input
            type="number"
            className="text-2xl font-semibold outline-none w-1/2 dark:text-gray-100 dark:bg-gray-800"
            value={toAmount}
            readOnly
          />
          <button className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2 dark:bg-gray-800">
            <span className="font-medium dark:text-gray-100">{toCurrency}</span>
            <ChevronDown size={18} className="dark:text-white" />
          </button>
        </div>
      </div>

      <button
        className="bg-green-600 dark:bg-green-600 text-white w-full py-3 rounded-lg mt-4 font-medium"
        onClick={handleConvert}
      >
        Convert
      </button>
    </div>
  );
}
