import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Copy, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Wallet {
  publicKey: string;
  formattedPublicKey: string;
  balance: number;
  status: string;
  isVerified: boolean;
  created_at: string;
}

interface Props extends PageProps {
  wallet: Wallet | null;
  success?: boolean;
  message?: string;
}

export default function WalletShow({ wallet, success, message }: Props) {
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setShowCopyModal(true);
    setTimeout(() => setShowCopyModal(false), 2000);
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
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 text-gray-900 dark:text-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Wallet Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Wallet Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Public Key:</span>
                        <div className="flex items-center">
                          <span className="mr-2">{wallet.formattedPublicKey}</span>
                          <button
                            onClick={() => copyToClipboard(wallet.publicKey)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            wallet.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {wallet.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Verification:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            wallet.isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {wallet.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span>{new Date(wallet.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Balance Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">XLM Balance:</span>
                        <span className="font-medium">{wallet.balance.toFixed(7)} XLM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">USD Value:</span>
                        <span className="font-medium">
                          ${(wallet.balance * 0.1).toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href="/deposit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center"
                    >
                      Deposit
                    </Link>
                    <Link
                      href="/send"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center"
                    >
                      Send
                    </Link>
                    <Link
                      href="/transactions"
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-center"
                    >
                      View Transactions
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy Confirmation Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <p className="text-green-600">Address copied to clipboard!</p>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
