import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, FileText, DollarSign, CheckCircle } from 'lucide-react';

interface DashboardProps {
    users: Array<{ id: number; name: string; email: string }>;
    transactions: Array<{ id: number; amount: number; currency: string; status: string }>;
    kycRequests: Array<{ id: number; user_id: number; status: string }>;
    remittances: Array<{ id: number; user_id: number; amount: number; currency: string; status: string }>;
    blogs: Array<{ id: number; title: string }>;
}

const AdminDashboard: React.FC<DashboardProps> = ({ users, transactions, kycRequests, remittances, blogs }) => {
    const [darkMode, setDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setDarkMode(storedTheme === 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !darkMode ? 'dark' : 'light';
        setDarkMode(!darkMode);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', !darkMode);
    };

    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Transactions',
                data: [1000, 2000, 1500, 1800, 2300, 2500, 3000],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: '#4bc0c0',
                borderWidth: 2,
            },
        ],
    };

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen p-6`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
                    <button onClick={toggleTheme} className="px-4 py-2 bg-blue-500 text-white rounded">
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center">
                        <Users className="text-blue-500 w-8 h-8" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Total Users</h3>
                            <p className="text-2xl font-bold">{users.length}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center">
                        <DollarSign className="text-green-500 w-8 h-8" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Total Transactions</h3>
                            <p className="text-2xl font-bold">{transactions.length}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center">
                        <CheckCircle className="text-yellow-500 w-8 h-8" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Pending KYC</h3>
                            <p className="text-2xl font-bold">{kycRequests.length}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center">
                        <FileText className="text-purple-500 w-8 h-8" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Published Blogs</h3>
                            <p className="text-2xl font-bold">{blogs.length}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-64">
                    <h3 className="text-lg font-semibold">Transaction Trends</h3>
                    <Line data={chartData} options={{ maintainAspectRatio: true, responsive: true }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold">Recent Users</h3>
                        <ul>
                            {users.slice(0, 5).map((user) => (
                                <li key={user.id} className="py-2 border-b">
                                    {user.name} - {user.email}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold">Recent Transactions</h3>
                        <ul>
                            {transactions.slice(0, 5).map((tx) => (
                                <li key={tx.id} className="py-2 border-b">
                                    {tx.amount} {tx.currency} - {tx.status}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
