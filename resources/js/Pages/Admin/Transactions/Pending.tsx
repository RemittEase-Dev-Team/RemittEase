import AuthenticatedLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Filter, Calendar, Search, Trash, MoreHorizontal, ArrowUpDown } from 'lucide-react';

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

export default function Pending({ transactions, stats }: Props) {
    const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

    const bulkApproveForm = useForm<{
        transaction_ids: number[];
    }>({
        transaction_ids: [],
    });

    const bulkRejectForm = useForm<{
        transaction_ids: number[];
    }>({
        transaction_ids: [],
    });

    const scheduleForm = useForm<{
        transaction_ids: number[];
        schedule_type: string;
    }>({
        transaction_ids: [],
        schedule_type: 'daily',
    });

    // Filter transactions based on type and search term - we only show pending transactions
    const filteredTransactions = transactions.filter(transaction => {
        // Always filter to only show pending status transactions
        const isPending = transaction.status === 'pending';
        const matchesType = filterType === 'all' || transaction.type === filterType;
        const matchesSearch = searchTerm === '' ||
            transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.transaction_hash && transaction.transaction_hash.toLowerCase().includes(searchTerm.toLowerCase()));

        return isPending && matchesType && matchesSearch;
    });

    // Toggle selecting a transaction
    const toggleSelectTransaction = (id: number) => {
        if (selectedTransactions.includes(id)) {
            setSelectedTransactions(selectedTransactions.filter(transactionId => transactionId !== id));
        } else {
            setSelectedTransactions([...selectedTransactions, id]);
        }
    };

    // Toggle selecting all transactions
    const toggleSelectAll = () => {
        if (selectedTransactions.length === filteredTransactions.length) {
            setSelectedTransactions([]);
        } else {
            setSelectedTransactions(filteredTransactions.map(t => t.id));
        }
    };

    // Process bulk approval
    const handleBulkApprove = () => {
        if (selectedTransactions.length === 0) {
            alert('Please select at least one transaction to approve.');
            return;
        }

        if (confirm(`Are you sure you want to approve ${selectedTransactions.length} transactions?`)) {
            bulkApproveForm.setData('transaction_ids', selectedTransactions);
            bulkApproveForm.post(route('admin.transactions.bulk-approve'), {
                onSuccess: () => setSelectedTransactions([]),
            });
        }
    };

    // Process bulk rejection
    const handleBulkReject = () => {
        if (selectedTransactions.length === 0) {
            alert('Please select at least one transaction to reject.');
            return;
        }

        if (confirm(`Are you sure you want to reject ${selectedTransactions.length} transactions?`)) {
            bulkRejectForm.setData('transaction_ids', selectedTransactions);
            bulkRejectForm.post(route('admin.transactions.bulk-reject'), {
                onSuccess: () => setSelectedTransactions([]),
            });
        }
    };

    // Open schedule modal
    const openScheduleModal = () => {
        if (selectedTransactions.length === 0) {
            alert('Please select at least one transaction to schedule.');
            return;
        }

        scheduleForm.setData('transaction_ids', selectedTransactions);
        setShowScheduleModal(true);
    };

    // Process scheduling
    const handleSchedule = () => {
        scheduleForm.post(route('admin.transactions.schedule'), {
            onSuccess: () => {
                setShowScheduleModal(false);
                setSelectedTransactions([]);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pending Transactions</h2>}
        >
            <Head title="Pending Transactions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistics */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-yellow-600 dark:text-yellow-400">Pending Transactions</h3>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.pending}</p>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {stats.pending} out of {stats.total} total transactions
                            </div>
                        </div>
                    </div>

                    {/* Filters and Bulk Actions */}
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
                                    placeholder="Search pending transactions..."
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

                            {/* Bulk Action Buttons */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleBulkApprove}
                                    disabled={selectedTransactions.length === 0}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-700 focus:outline-none focus:border-green-700 focus:ring ring-green-300 disabled:opacity-25 transition"
                                >
                                    <CheckCircle size={16} className="mr-2" /> Approve Selected
                                </button>
                                <button
                                    onClick={handleBulkReject}
                                    disabled={selectedTransactions.length === 0}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring ring-red-300 disabled:opacity-25 transition"
                                >
                                    <XCircle size={16} className="mr-2" /> Reject Selected
                                </button>
                                <button
                                    onClick={openScheduleModal}
                                    disabled={selectedTransactions.length === 0}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring ring-blue-300 disabled:opacity-25 transition"
                                >
                                    <Clock size={16} className="mr-2" /> Schedule
                                </button>
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
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                        checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                                                        onChange={toggleSelectAll}
                                                    />
                                                </div>
                                            </th>
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
                                                <td colSpan={8} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                                                    No pending transactions found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                            checked={selectedTransactions.includes(transaction.id)}
                                                            onChange={() => toggleSelectTransaction(transaction.id)}
                                                        />
                                                    </td>
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
                                                                href={route('admin.transactions.approve', transaction.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                                as="button"
                                                                method="get"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </Link>
                                                            <Link
                                                                href={route('admin.transactions.reject', transaction.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                as="button"
                                                                method="get"
                                                            >
                                                                <XCircle size={18} />
                                                            </Link>
                                                            <Link
                                                                href={route('admin.transactions.show', transaction.id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <MoreHorizontal size={18} />
                                                            </Link>
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

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Schedule Transactions</h2>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            You're about to schedule {selectedTransactions.length} transactions.
                            Choose a schedule type below.
                        </p>

                        <div className="mb-4">
                            <label htmlFor="schedule_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Schedule Type
                            </label>
                            <select
                                id="schedule_type"
                                name="schedule_type"
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2"
                                value={scheduleForm.data.schedule_type}
                                onChange={e => scheduleForm.setData('schedule_type', e.target.value)}
                            >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>

                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowScheduleModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSchedule}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={scheduleForm.processing}
                            >
                                {scheduleForm.processing ? 'Processing...' : 'Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
