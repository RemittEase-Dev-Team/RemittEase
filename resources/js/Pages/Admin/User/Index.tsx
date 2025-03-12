import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Eye, Ban, Mail } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "staff" | "user";
    kyc_status: string;
    wallet_balance: number;
}

interface UsersProps {
    users: User[];
}

const Users = ({ users }: UsersProps) => {
    const { patch } = useForm();
    const [searchTerm, setSearchTerm] = useState("");

    const handleRoleChange = (id: number, role: User['role']) => {
        patch(`/admin/users/${id}/update-role`, { data: { role } } as any);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <Head title="Manage Users" />
            <div className="p-6 dark:bg-gray-900 min-h-screen">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Manage Users & Roles</h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-3 border rounded w-full dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Role</th>
                                <th className="p-3 text-left">KYC Status</th>
                                <th className="p-3 text-left">Wallet Balance</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-t dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-100">
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                                            className="p-2 border rounded dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="staff">Staff</option>
                                            <option value="user">User</option>
                                        </select>
                                    </td>
                                    <td className={`p-3 ${user.kyc_status === "verified" ? "text-green-500" : "text-yellow-500"}`}>
                                        {user.kyc_status}
                                    </td>
                                    <td className="p-3">{user.wallet_balance ? `$${user.wallet_balance.toFixed(2)}` : 'N/A'}</td>
                                    <td className="p-3 flex space-x-3">
                                        <Link href={`/admin/users/${user.id}`} className="text-blue-500 hover:underline">
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <button className="text-red-500 hover:underline">
                                            <Ban className="w-5 h-5" />
                                        </button>
                                        <button className="text-green-500 hover:underline">
                                            <Mail className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Users;
