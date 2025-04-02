import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Search, Download, ArrowUpRight, ArrowDownLeft, Filter, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  isOutgoing: boolean;
  recipientAddress?: string;
  transactionHash?: string;
  transactionType: 'crypto' | 'fiat';
  reference: string;
  memo?: string;
  recipient?: {
    name: string;
    country: string;
  };
  bankCode?: string;
  accountNumber?: string;
  narration?: string;
}

interface Props {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'crypto' | 'fiat'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch =
        transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction.recipientAddress?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        filterType === 'all' ||
        (filterType === 'crypto' && transaction.transactionType === 'crypto') ||
        (filterType === 'fiat' && transaction.transactionType === 'fiat');

      const matchesStatus =
        filterStatus === 'all' ||
        transaction.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Transaction History</h2>}
    >
      <Head title="Transaction History" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              {/* Filters and Search */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by reference, recipient, or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'crypto' | 'fiat')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="crypto">Crypto</option>
                    <option value="fiat">Fiat</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'pending' | 'failed')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white flex items-center gap-2"
                  >
                    <span>Sort by {sortBy === 'date' ? 'Date' : 'Amount'}</span>
                    <ChevronDown className={`transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} size={16} />
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredTransactions.map((transaction) => (
                      <tr key={`${transaction.transactionType}-${transaction.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {transaction.isOutgoing ? (
                              <ArrowUpRight className="text-red-500 mr-2" size={20} />
                            ) : (
                              <ArrowDownLeft className="text-green-500 mr-2" size={20} />
                            )}
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.type}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            transaction.isOutgoing ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {transaction.isOutgoing ? '-' : '+'}{transaction.amount} {transaction.currency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {transaction.recipient?.name || transaction.recipientAddress || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.recipient?.country || transaction.transactionType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
