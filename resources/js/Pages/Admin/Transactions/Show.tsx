import AuthenticatedLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clipboard, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';

interface TransactionData {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    transaction_hash: string | null;
    amount: number;
    currency: string;
    type: string;
    status: string;
    reference: string;
    memo: string | null;
    created_at: string;
    updated_at: string;
    sender_address: string | null;
    recipient_address: string | null;
    failure_reason: string | null;
    metadata: any;
}

interface RemittanceData {
    id: number;
    status: string;
    amount: number;
    currency: string;
    recipient_name: string;
    recipient_account: string;
    recipient_bank: string;
    created_at: string;
}

interface WalletData {
    id: number;
    public_key: string;
    balance?: number;
}

interface RelatedTransaction {
    id: number;
    type: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
}

interface Props {
    transaction: TransactionData;
    remittance: RemittanceData | null;
    wallets: {
        sender: WalletData | null;
        recipient: WalletData | null;
    };
    related_transactions: RelatedTransaction[];
}

export default function Show({ transaction, remittance, wallets, related_transactions }: Props) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Transaction Details</h2>}
        >
            <Head title={`Transaction #${transaction.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/admin/transactions"
                            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Transactions
                        </Link>
                    </div>

                    {/* Transaction Status Banner */}
                    <div className={`mb-6 p-4 rounded-lg ${
                        transaction.status === 'completed' ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                        'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    }`}>
                        <div className="flex items-center">
                            {getStatusIcon(transaction.status)}
                            <div className="ml-3">
                                <h3 className={`text-sm font-medium ${
                                    transaction.status === 'completed' ? 'text-green-800 dark:text-green-300' :
                                    transaction.status === 'pending' ? 'text-yellow-800 dark:text-yellow-300' :
                                    'text-red-800 dark:text-red-300'
                                }`}>
                                    Transaction Status: <span className="capitalize">{transaction.status}</span>
                                </h3>
                                <div className={`mt-1 text-sm ${
                                    transaction.status === 'completed' ? 'text-green-700 dark:text-green-400' :
                                    transaction.status === 'pending' ? 'text-yellow-700 dark:text-yellow-400' :
                                    'text-red-700 dark:text-red-400'
                                }`}>
                                    {transaction.status === 'completed'
                                        ? 'This transaction has been successfully processed.'
                                        : transaction.status === 'pending'
                                        ? 'This transaction is awaiting processing or confirmation.'
                                        : `This transaction has failed. Reason: ${transaction.failure_reason || 'Unknown'}`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Transaction Details */}
                        <div className="md:col-span-2 bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4 dark:text-white">Transaction Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                                            <p className="font-medium dark:text-white">{transaction.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Reference</p>
                                            <p className="font-medium dark:text-white">{transaction.reference}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                                            <p className="font-medium capitalize dark:text-white">{transaction.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                                            <p className="font-medium dark:text-white">
                                                {transaction.amount} {transaction.currency}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                            <p className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                                                {transaction.status}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                                            <p className="font-medium dark:text-white">{transaction.created_at}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                                            <p className="font-medium dark:text-white">{transaction.updated_at}</p>
                                        </div>
                                        {transaction.memo && (
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Memo</p>
                                                <p className="font-medium dark:text-white">{transaction.memo}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {transaction.transaction_hash && (
                                    <div className="mt-6">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Hash</p>
                                        <div className="flex items-center mt-1">
                                            <p className="font-mono text-xs break-all dark:text-white">{transaction.transaction_hash}</p>
                                            <button
                                                onClick={() => copyToClipboard(transaction.transaction_hash || '')}
                                                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                                title="Copy to clipboard"
                                            >
                                                <Clipboard className="w-4 h-4" />
                                            </button>
                                            <a
                                                href={`https://stellar.expert/explorer/${process.env.NODE_ENV === 'production' ? 'public' : 'testnet'}/tx/${transaction.transaction_hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                                title="View on Stellar Explorer"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Blockchain Details */}
                                {(transaction.sender_address || transaction.recipient_address) && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-md font-semibold mb-4 dark:text-white">Blockchain Details</h4>

                                        <div className="space-y-4">
                                            {transaction.sender_address && (
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Sender Address</p>
                                                    <div className="flex items-center mt-1">
                                                        <p className="font-mono text-xs break-all dark:text-white">{transaction.sender_address}</p>
                                                        <button
                                                            onClick={() => copyToClipboard(transaction.sender_address || '')}
                                                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                                            title="Copy to clipboard"
                                                        >
                                                            <Clipboard className="w-4 h-4" />
                                                        </button>
                                                        <a
                                                            href={`https://stellar.expert/explorer/${process.env.NODE_ENV === 'production' ? 'public' : 'testnet'}/account/${transaction.sender_address}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                                            title="View on Stellar Explorer"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {transaction.recipient_address && (
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Recipient Address</p>
                                                    <div className="flex items-center mt-1">
                                                        <p className="font-mono text-xs break-all dark:text-white">{transaction.recipient_address}</p>
                                                        <button
                                                            onClick={() => copyToClipboard(transaction.recipient_address || '')}
                                                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                                            title="Copy to clipboard"
                                                        >
                                                            <Clipboard className="w-4 h-4" />
                                                        </button>
                                                        <a
                                                            href={`https://stellar.expert/explorer/${process.env.NODE_ENV === 'production' ? 'public' : 'testnet'}/account/${transaction.recipient_address}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                                            title="View on Stellar Explorer"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Remittance Details */}
                                {remittance && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-md font-semibold mb-4 dark:text-white">Remittance Details</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Recipient Name</p>
                                                <p className="font-medium dark:text-white">{remittance.recipient_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Recipient Bank</p>
                                                <p className="font-medium dark:text-white">{remittance.recipient_bank}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Account Number</p>
                                                <p className="font-medium dark:text-white">{remittance.recipient_account}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Remittance Status</p>
                                                <p className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(remittance.status)}`}>
                                                    {remittance.status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* User Details */}
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center dark:text-white">
                                        <User className="w-5 h-5 mr-2" />
                                        User Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                                            <p className="font-medium dark:text-white">{transaction.user_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                            <p className="font-medium dark:text-white">{transaction.user_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="font-medium dark:text-white">{transaction.user_email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Related Transactions */}
                            {related_transactions.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Related Transactions</h3>

                                        <div className="space-y-3">
                                            {related_transactions.map(t => (
                                                <div key={t.id} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <Link
                                                                href={route('admin.transactions.show', t.id)}
                                                                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                                            >
                                                                #{t.id}
                                                            </Link>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{t.type}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium dark:text-white">{t.amount} {t.currency}</p>
                                                            <p className={`text-xs ${
                                                                t.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                                                                t.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                                                                'text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {t.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {transaction.status === 'pending' && (
                                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Actions</h3>

                                        <div className="space-y-3">
                                            <Link
                                                href={route('admin.transactions.approve', transaction.id)}
                                                className="w-full flex justify-center items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-700 focus:outline-none focus:border-green-700 focus:ring ring-green-300 disabled:opacity-25 transition"
                                                as="button"
                                                method="get"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve Transaction
                                            </Link>

                                            <Link
                                                href={route('admin.transactions.reject', transaction.id)}
                                                className="w-full flex justify-center items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring ring-red-300 disabled:opacity-25 transition"
                                                as="button"
                                                method="get"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject Transaction
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
