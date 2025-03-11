import { Dispatch, SetStateAction } from 'react';

type CurrencyCode = 'XLM' | 'USD' | 'NGN' | 'EUR' | 'GBP';

interface Wallet {
  publicKey: string;
  formattedPublicKey: string;
  balance: number;
  status: string;
  isVerified: boolean;
  created_at: string;
}

interface Props {
  wallet: Wallet | null;
  balance: {
    [key in CurrencyCode]: {
      amount: number;
      change: number;
      percentage: number;
    };
  };
  currencyMain: CurrencyCode;
  setCurrencyMain: Dispatch<SetStateAction<CurrencyCode>>;
  moonpayEnabled: boolean;
  setDepositModal: Dispatch<SetStateAction<boolean>>;
  setWithdrawalModal: Dispatch<SetStateAction<boolean>>;
  setSendModal: Dispatch<SetStateAction<boolean>>;
}

export default function BalanceWidget({
  wallet,
  balance,
  currencyMain,
  setCurrencyMain,
  moonpayEnabled,
  setDepositModal,
  setWithdrawalModal,
  setSendModal
}: Props) {

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
          {wallet ? Number(wallet.balance).toLocaleString() : '0'}
        </div>
        <div
          className={`text-sm flex items-center gap-1 ${
            balance[currencyMain].change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {balance[currencyMain].change >= 0
            ? `+${balance[currencyMain].change.toLocaleString()}`
            : `-${Math.abs(balance[currencyMain].change).toLocaleString()}`}
          <span className="ml-2">{balance[currencyMain].percentage.toFixed(2)}%</span>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        {moonpayEnabled && (
          <button
            onClick={() => setDepositModal(true)}
            className="bg-yellow-700 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex-1 font-medium"
          >
            Deposit
          </button>
        )}
        <button
          onClick={() => setWithdrawalModal(true)}
          className="bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex-1 font-medium"
        >
          Withdraw
        </button>
        <button
          onClick={() => setSendModal(true)}
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
              {data.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
