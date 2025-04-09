import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Copy, ArrowLeft, ArrowDownToLine, ArrowUpToLine, ReceiptText, AlertCircle, Check, ExternalLink } from 'lucide-react';
import axios from 'axios';

interface Wallet {
  publicKey: string;
  formattedPublicKey: string;
  balance: number;
  status: string;
  isVerified: boolean;
  created_at: string;
}

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
  transactionType: string;
}

interface ExchangeRates {
  XLM: number;
  USD: number;
  EUR: number;
  GBP: number;
  NGN: number;
}

interface Props extends PageProps {
  wallet: Wallet | null;
  success?: boolean;
  message?: string;
  transactions?: Transaction[];
}

export default function WalletShow({ wallet, success, message, transactions = [] }: Props) {
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    XLM: 1,
    USD: 0.1, // Default value, will be updated
    EUR: 0.09,
    GBP: 0.08,
    NGN: 150
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(transactions.slice(0, 5));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch exchange rates when component mounts
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get('/api/exchange-rates');
        if (response.data.success) {
          setExchangeRates({
            XLM: 1,
            USD: response.data.stellar.usd || 0.1,
            EUR: response.data.stellar.eur || 0.09,
            GBP: response.data.stellar.gbp || 0.08,
            NGN: response.data.stellar.ngn || 150
          });
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      }
    };

    // Fetch transaction history
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/transactions/recent');
        if (response.data.success) {
          setRecentTransactions(response.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
    if (transactions.length === 0) {
      fetchTransactions();
    }
  }, [transactions.length]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setShowCopyModal(true);
    setTimeout(() => setShowCopyModal(false), 2000);
  };

  // Format currency with appropriate symbol
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'XLM' ? 'USD' : currency,
      minimumFractionDigits: currency === 'XLM' ? 7 : 2,
      maximumFractionDigits: currency === 'XLM' ? 7 : 2,
    });

    if (currency === 'XLM') {
      return `${amount.toFixed(7)} XLM`;
    }

    return formatter.format(amount);
  };

  // Calculate equivalent values in other currencies
  const getEquivalentValue = (xlmAmount: number, targetCurrency: keyof ExchangeRates) => {
    return xlmAmount * exchangeRates[targetCurrency];
  };

  // Get transaction icon based on type
  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'deposit') {
      return <ArrowDownToLine className="h-4 w-4" />;
    } else if (transaction.type === 'withdrawal' || transaction.type === 'transfer') {
      return <ArrowUpToLine className="h-4 w-4" />;
    } else if (transaction.type === 'remittance') {
      return <ReceiptText className="h-4 w-4" />;
    }
    return <ReceiptText className="h-4 w-4" />;
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-500 hover:text-gray-700" />
            </Link>
            <h2 className="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-200">
              Wallet Details
            </h2>
          </div>
        </div>
      }
    >
      <Head title="Wallet Details" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          {!wallet ? (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 text-gray-900 dark:text-gray-100">
                <p className="text-lg">No wallet found. Please contact support.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Wallet Card */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Wallet Information</h3>
                      <div className={`px-2 py-1 rounded-full text-sm ${
                        wallet.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1)}
                      </div>
                    </div>

                    {/* Public Key with Copy Button */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Public Key (Address)</span>
                        {wallet.isVerified ? (
                          <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <Check className="h-3 w-3 mr-1" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="h-3 w-3 mr-1" /> Pending Verification
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm truncate max-w-[80%]">
                          {wallet.formattedPublicKey}
                        </div>
                        <button
                          onClick={() => copyToClipboard(wallet.publicKey)}
                          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                          title="Copy address"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Balance Information */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-4">Balance Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="text-sm text-blue-600 dark:text-blue-300 mb-1">XLM Balance</div>
                          <div className="text-2xl font-bold">{wallet.balance.toFixed(7)} XLM</div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <div className="text-sm text-green-600 dark:text-green-300 mb-1">USD Equivalent</div>
                          <div className="text-2xl font-bold">${getEquivalentValue(wallet.balance, 'USD').toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">EUR</div>
                          <div className="text-sm font-medium">€{getEquivalentValue(wallet.balance, 'EUR').toFixed(2)}</div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">GBP</div>
                          <div className="text-sm font-medium">£{getEquivalentValue(wallet.balance, 'GBP').toFixed(2)}</div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">NGN</div>
                          <div className="text-sm font-medium">₦{getEquivalentValue(wallet.balance, 'NGN').toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Details */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-3">Wallet Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Status</span>
                          <span className={`${
                            wallet.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Verification</span>
                          <span className={`${
                            wallet.isVerified ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {wallet.isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Created</span>
                          <span>{new Date(wallet.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h4 className="text-lg font-medium mb-4">Quick Actions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                          href="/deposit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center flex items-center justify-center"
                        >
                          <ArrowDownToLine className="h-4 w-4 mr-2" /> Deposit
                        </Link>
                        <Link
                          href="/send"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center flex items-center justify-center"
                        >
                          <ArrowUpToLine className="h-4 w-4 mr-2" /> Send
                        </Link>
                        <Link
                          href="/transactions"
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-center flex items-center justify-center"
                        >
                          <ReceiptText className="h-4 w-4 mr-2" /> View Transactions
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>

                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : recentTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <ReceiptText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No transactions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start">
                              <div className={`
                                rounded-full p-2 mr-3
                                ${transaction.isOutgoing
                                  ? 'bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400'
                                  : 'bg-green-100 text-green-500 dark:bg-green-900/20 dark:text-green-400'}
                              `}>
                                {getTransactionIcon(transaction)}
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(transaction.date).toLocaleDateString()} • {transaction.status}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-medium text-sm ${
                                transaction.isOutgoing
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                {transaction.isOutgoing ? '-' : '+'}{transaction.amount} {transaction.currency}
                              </div>
                              {transaction.transactionHash && (
                                <a
                                  href={`https://stellar.expert/explorer/public/tx/${transaction.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 flex items-center justify-end mt-1 hover:underline"
                                >
                                  View <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}

                        <Link
                          href="/transactions"
                          className="block text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm py-2 mt-2"
                        >
                          View all transactions
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy Confirmation Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-600 dark:text-green-400">Address copied to clipboard!</p>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
