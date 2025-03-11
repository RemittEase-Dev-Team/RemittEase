import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  isOutgoing: boolean;
}

interface AnalyticsWidgetProps {
  wallet: {
    balance: number;
    publicKey: string;
  } | null;
  transactions: Transaction[];
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ wallet, transactions }) => {
  // Calculate analytics data
  const calculateAnalytics = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const recentTransactions = transactions.filter(t =>
      new Date(t.date) >= thirtyDaysAgo
    );

    const totalVolume = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const incomingVolume = recentTransactions
      .filter(t => !t.isOutgoing)
      .reduce((sum, t) => sum + t.amount, 0);
    const outgoingVolume = recentTransactions
      .filter(t => t.isOutgoing)
      .reduce((sum, t) => sum + t.amount, 0);

    // Group transactions by date for the chart
    const dailyVolumes = recentTransactions.reduce((acc: any, t) => {
      const date = t.date.split(',')[0]; // Get just the date part
      if (!acc[date]) {
        acc[date] = { date, volume: 0, incoming: 0, outgoing: 0 };
      }
      acc[date].volume += t.amount;
      if (t.isOutgoing) {
        acc[date].outgoing += t.amount;
      } else {
        acc[date].incoming += t.amount;
      }
      return acc;
    }, {});

    return {
      totalVolume,
      incomingVolume,
      outgoingVolume,
      dailyVolumes: Object.values(dailyVolumes),
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-6 dark:text-white">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Volume */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="bg-blue-500/10 p-2 rounded">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400">30 days</span>
          </div>
          <h3 className="text-2xl font-bold mt-2 dark:text-white">
            ${analytics.totalVolume.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
        </div>

        {/* Incoming Volume */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="bg-green-500/10 p-2 rounded">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm ml-1">+{((analytics.incomingVolume / analytics.totalVolume) * 100).toFixed(1)}%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-2 dark:text-white">
            ${analytics.incomingVolume.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Incoming</p>
        </div>

        {/* Outgoing Volume */}
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="bg-red-500/10 p-2 rounded">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex items-center text-red-600 dark:text-red-400">
              <ArrowDownRight className="w-4 h-4" />
              <span className="text-sm ml-1">-{((analytics.outgoingVolume / analytics.totalVolume) * 100).toFixed(1)}%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-2 dark:text-white">
            ${analytics.outgoingVolume.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Outgoing</p>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.dailyVolumes}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar
              dataKey="incoming"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              name="Incoming"
            />
            <Bar
              dataKey="outgoing"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="Outgoing"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
          <p className="text-lg font-semibold dark:text-white">
            {((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">Avg. Transaction</p>
          <p className="text-lg font-semibold dark:text-white">
            ${(analytics.totalVolume / transactions.length).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
