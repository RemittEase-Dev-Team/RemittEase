import AuthenticatedLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

interface Props {
    transaction: any;
}

export default function Show({ transaction }: Props) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Transaction Details</h2>}
        >
            <Head title="Transaction Details" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1>Transaction Details</h1>
                            <p>ID: {transaction.id}</p>
                            <p>User ID: {transaction.user_id}</p>
                            <p>Transaction Hash: {transaction.transaction_hash}</p>
                            <p>Amount: {transaction.amount}</p>
                            <p>Currency: {transaction.currency}</p>
                            <p>Status: {transaction.status}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
