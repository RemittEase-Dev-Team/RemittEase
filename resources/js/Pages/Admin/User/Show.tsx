import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

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
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">User Details</h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>KYC Status:</strong> {user.kyc_status}</p>
                    <p><strong>Wallet Balance:</strong> ${user.wallet_balance.toFixed(2)}</p>
                </div>

                <h3 className="text-xl font-bold mt-6 text-gray-800 dark:text-gray-100">Recent Transactions</h3>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <ul>
                        {user.transactions.map((tx) => (
                            <li key={tx.id} className="py-2 border-b">
                                {tx.amount} USD - <span className={tx.status === "completed" ? "text-green-500" : "text-yellow-500"}>{tx.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <Link href="/admin/users" className="text-blue-500 mt-4 inline-block">Back to Users</Link>
            </div>
        </AdminLayout>
    );
};

export default UserDetails;
