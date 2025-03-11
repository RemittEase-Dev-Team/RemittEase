import { FormEventHandler } from 'react';
import { Search } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  flag: string;
  selected: boolean;
}

interface Props {
  search: string;
  setSearch: (val: string) => void;
  selectedCurrency: Currency | null;
  setSelectedCurrency: (val: Currency | null) => void;
  amount: string;
  setAmount: (val: string) => void;
  walletAddress: string;
  setWalletAddress: (val: string) => void;
  currencies: Currency[];
  CloseModal: () => void;
  handleSend: FormEventHandler;
}

export default function SendModal({
  search,
  setSearch,
  selectedCurrency,
  setSelectedCurrency,
  amount,
  setAmount,
  walletAddress,
  setWalletAddress,
  currencies,
  CloseModal,
  handleSend
}: Props) {

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="fixed w-full h-screen inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-md p-6 w-full m-4 lg:w-[25%]">
        <h2 className="uppercase font-bold mb-4 text-center text-2xl dark:text-gray-100">
          Send Crypto
        </h2>

        <div className="mb-4">
          <h3 className="font-semibold mb-2 dark:text-gray-100">Select Currency</h3>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mb-2">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none outline-none w-full bg-transparent dark:text-gray-100 dark:bg-gray-800"
            />
          </div>

          <div className="max-h-40 overflow-y-auto custom-scrollbar">
            {filteredCurrencies.map((currency: any, index: number) => (
              <div
                key={index}
                onClick={() => {
                  setSearch(currency.name);
                  setSelectedCurrency(currency);
                }}
                className={`p-2 hover:bg-gray-100 cursor-pointer dark:text-white ${
                  selectedCurrency?.code === currency.code ? 'bg-gray-500 text-black' : ''
                }`}
              >
                {currency.flag} {currency.name} ({currency.code})
              </div>
            ))}
          </div>
        </div>

        {selectedCurrency && (
          <>
            <div className="mb-4">
              <h3 className="font-semibold mb-2 dark:text-white">Wallet Address</h3>
              <input
                type="text"
                placeholder="0x000x...BhC"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full p-2 border rounded-md bg-transparent dark:text-white"
              />
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2 dark:text-white">Enter Amount</h3>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded-md bg-transparent dark:text-white"
              />
            </div>
          </>
        )}

        <div className="w-full flex items-center justify-between">
          <button
            onClick={CloseModal}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Close
          </button>

          <button
            onClick={handleSend}
            className="bg-blue-950 text-white px-4 py-2 rounded-md hover:bg-blue-900"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
