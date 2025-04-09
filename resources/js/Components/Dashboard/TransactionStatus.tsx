import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

interface TransactionStatusProps {
  transactionId?: string | null;
  reference?: string | null;
  initialStatus?: 'pending' | 'completed' | 'failed';
  onStatusChange?: (status: string) => void;
}

interface TransactionDetails {
  id: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  message?: string;
  transaction_hash?: string;
  created_at?: string;
  updated_at?: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  transactionId,
  reference,
  initialStatus = 'pending',
  onStatusChange
}) => {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>(initialStatus);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<TransactionDetails | null>(null);
  const [checkCount, setCheckCount] = useState<number>(0);

  // Get transaction details from localStorage if not provided
  useEffect(() => {
    if (!transactionId) {
      const storedTransaction = localStorage.getItem('last_transaction');
      if (storedTransaction) {
        try {
          const transaction = JSON.parse(storedTransaction);
          if (transaction.id) {
            checkTransactionStatus(transaction.id);
          }
        } catch (e) {
          console.error('Failed to parse stored transaction', e);
        }
      }
    } else {
      checkTransactionStatus(transactionId);
    }
  }, [transactionId]);

  // Set up polling for pending transactions
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (status === 'pending' && transactionId && checkCount < 10) {
      intervalId = setInterval(() => {
        checkTransactionStatus(transactionId);
        setCheckCount((prev) => prev + 1);
      }, 10000); // Check every 10 seconds, up to 10 times
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, transactionId, checkCount]);

  const checkTransactionStatus = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(route('remittance.transaction.status', { transactionId: id }));

      if (response.data) {
        const newStatus = response.data.status || status;
        setStatus(newStatus);
        setMessage(response.data.message || '');
        setDetails(response.data);

        if (onStatusChange && newStatus !== status) {
          onStatusChange(newStatus);
        }
      }
    } catch (err: any) {
      console.error('Failed to check transaction status', err);
      setError(err.response?.data?.message || 'Failed to check transaction status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Transaction Completed';
      case 'failed':
        return 'Transaction Failed';
      case 'pending':
      default:
        return 'Transaction Pending';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Status</h3>
        {isLoading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
      </div>

      <div className="flex items-center mb-4">
        {getStatusIcon()}
        <div className="ml-4">
          <p className="text-lg font-semibold">{getStatusText()}</p>
          {reference && <p className="text-sm text-gray-600 dark:text-gray-400">Reference: {reference}</p>}
        </div>
      </div>

      {message && (
        <div className="mb-4 text-sm">
          <p className={`${status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded">
          {error}
        </div>
      )}

      {status === 'pending' && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Your transaction is being processed. This may take a few moments.</p>
        </div>
      )}

      <button
        onClick={() => transactionId && checkTransactionStatus(transactionId)}
        disabled={isLoading}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Checking...
          </>
        ) : (
          'Refresh Status'
        )}
      </button>
    </div>
  );
};

export default TransactionStatus;
