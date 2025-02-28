import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

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

    const handleRoleChange = (id: number, role: User['role']) => {
        patch(`/admin/users/${id}/update-role`, { data: { role } } as any);
    };

    return (
        <AdminLayout>
            <Head title="Manage Users" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Manage Users & Roles</h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200 dark:bg-gray-700">
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Email</th>
                                <th className="p-2 text-left">Role</th>
                                <th className="p-2 text-left">KYC Status</th>
                                <th className="p-2 text-left">Wallet Balance</th>
                                <th className="p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t dark:border-gray-600">
                                    <td className="p-2">{user.name}</td>
                                    <td className="p-2">{user.email}</td>
                                    <td className="p-2">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                                            className="p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="staff">Staff</option>
                                            <option value="user">User</option>
                                        </select>
                                    </td>
                                    <td className={`p-2 ${user.kyc_status === "verified" ? "text-green-500" : "text-yellow-500"}`}>
                                        {user.kyc_status}
                                    </td>
                                    <td className="p-2">${user.wallet_balance.toFixed(2)}</td>
                                    <td className="p-2">
                                        <Link href={`/admin/users/${user.id}`} className="text-blue-500 hover:underline">
                                            View
                                        </Link>
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
