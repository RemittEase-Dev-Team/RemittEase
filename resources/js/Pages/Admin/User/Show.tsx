import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { ChevronLeft } from 'lucide-react';

interface UserDetailsProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        kyc_status: string;
        wallet_balance: number;
        transactions: Array<{ id: number; amount: number; status: string }>;
    };
}

const UserDetails = ({ user }: UserDetailsProps) => {

    return (
        <AdminLayout>
            <Head title="User Details" />
            <Link href="/admin/users" className="flex items-center text-blue-500 hover:underline mt-4 ml-4">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Users
                </Link>
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">User Details</h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                    <div className="flex items-center">
                        <div className="w-24 h-24 bg-blue-500 dark:bg-blue-700 rounded-full flex items-center justify-center text-white">
                            {/* Placeholder for User Avatar */}
                            <span className="text-2xl">{user.name.charAt(0)}</span>
                        </div>
                        <div className="ml-6">
                            <p className="text-lg text-gray-800 dark:text-gray-100"><strong>Name:</strong> {user.name}</p>
                            <p className="text-lg text-gray-800 dark:text-gray-100"><strong>Email:</strong> {user.email}</p>
                            <p className="text-lg text-gray-800 dark:text-gray-100"><strong>Role:</strong> {user.role}</p>
                            <p className="text-lg text-gray-800 dark:text-gray-100"><strong>KYC Status:</strong> <span className={user.kyc_status === "verified" ? "text-green-500" : "text-yellow-500"}>{user.kyc_status}</span></p>
                            <p className="text-lg text-gray-800 dark:text-gray-100"><strong>Wallet Balance:</strong> <span className="text-blue-500">${user.wallet_balance.toFixed(2)}</span></p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">KYC Documents</h3>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                        {/* Placeholder for KYC Documents */}
                        <span>No Documents Uploaded</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Recent Transactions</h3>
                    {user.transactions.length > 0 ? (
                        <ul>
                            {user.transactions.map((tx) => (
                                <li key={tx.id} className="py-2 border-b border-gray-300 dark:border-gray-600">
                                    {tx.amount} USD - <span className={tx.status === "completed" ? "text-green-500" : "text-yellow-500"}>{tx.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-center bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">No Recent Transactions</div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default UserDetails;
