import AuthenticatedLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

interface Props {
    transactions: any[];
}

export default function Index({ transactions }: Props) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Transactions</h2>}
        >
            <Head title="Transactions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User ID</th>
                                        <th>Transaction Hash</th>
                                        <th>Amount</th>
                                        <th>Currency</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{transaction.id}</td>
                                            <td>{transaction.user_id}</td>
                                            <td>{transaction.transaction_hash}</td>
                                            <td>{transaction.amount}</td>
                                            <td>{transaction.currency}</td>
                                            <td>{transaction.status}</td>
                                            <td>
                                                <a href={`/admin/transactions/${transaction.id}`}>View</a>
                                                {/* TODO: Add delete functionality */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
