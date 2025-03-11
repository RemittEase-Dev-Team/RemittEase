import { Search, ArrowUp, Plus } from 'lucide-react';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  isOutgoing: boolean;
  recipientAddress: string;
  transactionHash: string;
}

interface Props {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <div className="text-lg font-semibold mb-4 dark:text-gray-100">Transaction History</div>

      <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 mb-4">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="border-none outline-none w-full bg-transparent"
        />
      </div>

      {/* Example of grouping transactions by date, if you wish */}
      <div className="text-sm text-gray-500 mb-2">1 Oct, 2023</div>

      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between py-3 border-b border-gray-100 dark:text-gray-100"
        >
          <div className="flex items-start">
            {transaction.isOutgoing ? (
              <div className="bg-red-50 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <ArrowUp size={18} />
              </div>
            ) : (
              <div className="bg-green-50 text-green-500 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <Plus size={18} />
              </div>
            )}
            <div>
              <div className="font-medium">{transaction.type}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={transaction.isOutgoing ? 'font-medium' : 'font-medium text-green-600'}>
              {transaction.isOutgoing ? '' : '+ '}
              {transaction.amount} {transaction.currency}
            </div>
          </div>
        </div>
      ))}

      <button className="bg-blue-50 dark:bg-blue-600 text-blue-600 dark:text-gray-100 w-full py-3 rounded-lg mt-4 font-medium">
        See all
      </button>
    </div>
  );
}
