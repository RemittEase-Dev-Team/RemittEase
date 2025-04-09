import AuthenticatedLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle, ExternalLink, Search, Filter, Calendar, MoreHorizontal, ArrowUpDown } from 'lucide-react';

interface Transaction {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    transaction_hash: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    reference: string;
    created_at: string;
    sender_address: string;
    recipient_address: string;
    network?: string;
}

interface Props {
    transactions: Transaction[];
    stats: {
        pending: number;
        completed: number;
        failed: number;
        total: number;
    };
}

export default function Completed({ transactions, stats }: Props) {
    const [filterType, setFilterType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');

    // Filter transactions based on type, search term, and date - we only show completed transactions
    const filteredTransactions = transactions.filter(transaction => {
        // Always filter to only show completed status transactions
        const isCompleted = transaction.status === 'completed';
        const matchesType = filterType === 'all' || transaction.type === filterType;
        const matchesSearch = searchTerm === '' ||
            transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.transaction_hash && transaction.transaction_hash.toLowerCase().includes(searchTerm.toLowerCase()));

        // Simple date filtering
        const matchesDate = dateFilter === '' || transaction.created_at.includes(dateFilter);

        return isCompleted && matchesType && matchesSearch && matchesDate;
    });

    // Get status badge styling
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

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Completed Transactions</h2>}
        >
            <Head title="Completed Transactions" />

            <div className="py-12">
                <div className="max-w-10xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistics */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-green-600 dark:text-green-400">Completed Transactions</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.completed}</p>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {stats.completed} out of {stats.total} total transactions
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Search */}
                            <div className="relative w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search size={18} className="text-gray-500 dark:text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Search completed transactions..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Type Filter */}
                            <div className="flex items-center space-x-2">
                                <Filter size={18} className="text-gray-500 dark:text-gray-400" />
                                <select
                                    className="form-select border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filterType}
                                    onChange={e => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="withdrawal">Withdrawal</option>
                                    <option value="remittance">Remittance</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="test">Test</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div className="flex items-center space-x-2">
                                <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
                                <input
                                    type="date"
                                    className="form-input border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    value={dateFilter}
                                    onChange={e => setDateFilter(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    ID
                                                    <ArrowUpDown size={14} className="ml-1" />
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    User
                                                    <ArrowUpDown size={14} className="ml-1" />
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    Reference
                                                    <ArrowUpDown size={14} className="ml-1" />
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    Amount
                                                    <ArrowUpDown size={14} className="ml-1" />
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    Type
                                                    <ArrowUpDown size={14} className="ml-1" />
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    Date
                                                    <ArrowUpDown size={14} className="ml-1" />
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                                                    No completed transactions found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {transaction.id}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        <div>{transaction.user_name}</div>
                                                        <div className="text-xs text-gray-400 dark:text-gray-500">{transaction.user_email}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="font-medium">{transaction.reference}</div>
                                                        {transaction.transaction_hash && (
                                                            <div className="text-xs truncate max-w-xs">{transaction.transaction_hash}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {transaction.amount} {transaction.currency}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="capitalize">{transaction.type}</span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {transaction.created_at}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('admin.transactions.show', transaction.id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <MoreHorizontal size={18} />
                                                            </Link>
                                                            {transaction.transaction_hash && (
                                                                <a
                                                                    href={`https://stellar.expert/explorer/${transaction.network === 'public' ? 'public' : 'testnet'}/tx/${transaction.transaction_hash}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    <ExternalLink size={18} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
