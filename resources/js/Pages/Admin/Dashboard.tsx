import React from 'react';
import { Head } from '@inertiajs/react';
import {
  Users, FileText, DollarSign, CheckCircle,
  ArrowUpRight, ArrowDownRight, Clock, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Line
} from 'recharts';
import AdminLayout from '@/Layouts/AdminLayout';

interface Currency {
  code: string;
  name: string;
  rate: number;
  change: number;
}

interface DashboardProps {
  users: Array<{
    id: number;
    name: string;
    email: string;
    createdAt: string;
    status: string;
    kycStatus: string;
    lastLogin: string;
  }>;
  transactions: Array<{
    id: number;
    amount: number;
    sourceCurrency: string;
    targetCurrency: string;
    status: string;
    createdAt: string;
    type: string;
    fees: number;
  }>;
  kycRequests: Array<{
    id: number;
    user_id: number;
    status: string;
    createdAt: string;
    documentType: string;
  }>;
  remittances: Array<{
    id: number;
    user_id: number;
    amount: number;
    sourceCurrency: string;
    targetCurrency: string;
    exchangeRate: number;
    status: string;
    createdAt: string;
    fees: number;
    destinationCountry: string;
  }>;
  blogs: Array<{ id: number; title: string }>;
  stats?: {
    totalVolume: number;
    totalFees: number;
    activeUsers: number;
    conversionRate: number;
    averageTransactionSize: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    stellarNetworkVolume: number;
    fiatNetworkVolume: number;
    totalRemittances: number;
    averageRemittanceSize: number;
  };
  currencies?: Array<Currency>;
  weeklyTransactions: Array<{
    day: string;
    volume: number;
    count: number;
    fees: number;
  }>;
  remittanceDestinations?: Array<{
    country: string;
    volume: number;
    percentage: number;
    count: number;
  }>;
  stellarMetrics?: {
    nodeStatus: string;
    networkLatency: number;
    pendingTransactions: number;
    lastLedger: number;
    networkVersion: string;
    totalSupply: number;
    circulatingSupply: number;
    averageTransactionTime: number;
    activeValidators: number;
  };
  revenueMetrics?: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    byType: Array<{
      type: string;
      amount: number;
      percentage: number;
    }>;
  };
  userMetrics?: {
    total: number;
    active: number;
    new: number;
    kycPending: number;
    kycApproved: number;
    kycRejected: number;
    byCountry: Array<{
      country: string;
      count: number;
      percentage: number;
    }>;
  };
}

const AdminDashboard: React.FC<DashboardProps> = ({
  users,
  transactions,
  kycRequests,
  remittances,
  blogs,
  stats,
  currencies = [],
  weeklyTransactions,
  remittanceDestinations = [],
  stellarMetrics = {
    nodeStatus: 'unknown',
    networkLatency: 0,
    pendingTransactions: 0,
    lastLedger: 0
  },
  revenueMetrics = {
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    byType: []
  },
  userMetrics = {
    total: 0,
    active: 0,
    new: 0,
    kycPending: 0,
    kycApproved: 0,
    kycRejected: 0,
    byCountry: []
  }
}) => {
  // Format number function to handle number formatting throughout the component
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formattedVolume = stats ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(stats.totalVolume) : 'N/A';

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;
  const recentGrowth = 14.3;
  const kycApprovalRate = 78;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const statusData = [
    { name: 'Completed', value: 65 },
    { name: 'Processing', value: 15 },
    { name: 'Pending', value: 10 },
    { name: 'Failed', value: 5 },
    { name: 'Cancelled', value: 5 }
  ];

  console.log("currencies: ", currencies)

  return (
    <AdminLayout>
      <Head title="Admin Dashboard" />
      <div className="text-gray-900 dark:text-white">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-400">Remittance Dashboard</h2>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors">
              Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-blue-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{formattedVolume}</h3>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+{recentGrowth}% this week</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-green-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats ? stats.activeUsers : 'N/A'}</h3>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+8.2% this week</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-yellow-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Transactions</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{pendingTransactions}</h3>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-500">Needs attention</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <RefreshCw className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-purple-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">KYC Approval Rate</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{kycApprovalRate}%</h3>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">-2.4% this week</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Transaction Volume (7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyTransactions}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-md">
                        <p className="font-bold">{`${label}`}</p>
                        <p className="text-blue-600">{`Volume: $${payload[0]?.value?.toLocaleString() || 'N/A'}`}</p>
                        <p className="text-green-600">{`Transactions: ${payload[1]?.value || 'N/A'}`}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area type="monotone" dataKey="volume" stroke="#3B82F6" fillOpacity={1} fill="url(#colorVolume)" />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Remittance Destinations</h3>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={remittanceDestinations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="volume"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {remittanceDestinations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <div className="h-full flex flex-col justify-center">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Top Destinations</h4>
                  <ul className="space-y-3">
                    {remittanceDestinations.slice(0, 5).map((destination, index) => (
                      <li key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          {destination.country}
                        </span>
                        <span className="text-sm font-medium">
                          ${destination.volume.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Exchange Rates</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate (USD)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">24h Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currencies.map((currency, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800 dark:text-white">{currency.code}</span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{currency.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {currency.rate.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`flex items-center ${currency.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {currency.change >= 0 ?
                            <ArrowUpRight className="w-4 h-4 mr-1" /> :
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                          }
                          <span>{Math.abs(currency.change).toFixed(2)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Transaction Status Distribution</h3>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <div className="h-full flex flex-col justify-center">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Status Breakdown</h4>
                  <ul className="space-y-3">
                    {statusData.map((status, index) => (
                      <li key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          {status.name}
                        </span>
                        <span className="text-sm font-medium">
                          {status.value}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Stellar Network Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${
                  stellarMetrics.nodeStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Node Status</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white capitalize">
                {stellarMetrics.nodeStatus}
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Network Latency</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                {stellarMetrics.networkLatency} ms
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Pending Transactions</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                {stellarMetrics.pendingTransactions}
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Last Ledger</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                {stellarMetrics.lastLedger}
              </p>
            </div>
          </div>
        </div>

        {/* Stellar Network Metrics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Stellar Network Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Node Status</div>
              <div className="text-xl font-semibold">{stellarMetrics?.nodeStatus || 'Unknown'}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Network Latency</div>
              <div className="text-xl font-semibold">{stellarMetrics?.networkLatency || 0}ms</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Pending Transactions</div>
              <div className="text-xl font-semibold">{stellarMetrics?.pendingTransactions || 0}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Last Ledger</div>
              <div className="text-xl font-semibold">{stellarMetrics?.lastLedger || 0}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Network Version</div>
              <div className="text-xl font-semibold">{stellarMetrics?.networkVersion || 'Unknown'}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Supply</div>
              <div className="text-xl font-semibold">{formatNumber(stellarMetrics?.totalSupply || 0)} XLM</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Avg Transaction Time</div>
              <div className="text-xl font-semibold">{stellarMetrics?.averageTransactionTime || 0}s</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Active Validators</div>
              <div className="text-xl font-semibold">{stellarMetrics?.activeValidators || 0}</div>
            </div>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Daily Revenue</div>
              <div className="text-xl font-semibold">${formatNumber(revenueMetrics?.daily || 0)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Weekly Revenue</div>
              <div className="text-xl font-semibold">${formatNumber(revenueMetrics?.weekly || 0)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-xl font-semibold">${formatNumber(revenueMetrics?.monthly || 0)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Yearly Revenue</div>
              <div className="text-xl font-semibold">${formatNumber(revenueMetrics?.yearly || 0)}</div>
            </div>
          </div>
          {revenueMetrics?.byType && (
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2">Revenue by Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {revenueMetrics.byType.map((type, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">{type.type}</div>
                    <div className="text-xl font-semibold">${formatNumber(type.amount)}</div>
                    <div className="text-sm text-gray-500">{type.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Metrics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-xl font-semibold">{formatNumber(userMetrics?.total || 0)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Active Users</div>
              <div className="text-xl font-semibold">{formatNumber(userMetrics?.active || 0)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">New Users</div>
              <div className="text-xl font-semibold">{formatNumber(userMetrics?.new || 0)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">KYC Status</div>
              <div className="text-xl font-semibold">
                {formatNumber(userMetrics?.kycApproved || 0)} Approved
              </div>
              <div className="text-sm text-gray-500">
                {formatNumber(userMetrics?.kycPending || 0)} Pending
              </div>
            </div>
          </div>
          {userMetrics?.byCountry && (
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2">Users by Country</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMetrics.byCountry.map((country, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">{country.country}</div>
                    <div className="text-xl font-semibold">{formatNumber(country.count)}</div>
                    <div className="text-sm text-gray-500">{country.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
