import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  value: number;
}

interface TotalBalanceChartProps {
  chartData: ChartData[];
  totalBalance: {
    amount: number;
    percentage: number;
  };
  activeTimeFilter: string;
  setActiveTimeFilter: (filter: string) => void;
  className?: string;
}

const TotalBalanceChart: React.FC<TotalBalanceChartProps> = ({
  chartData,
  totalBalance,
  activeTimeFilter,
  setActiveTimeFilter,
  className = ''
}) => {
  const timeFilters = [
    { id: 'Today', label: 'Today' },
    { id: '24H', label: '24H' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: 'All', label: 'All' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-semibold dark:text-white">Total Balance</div>
        <select className="px-5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm dark:bg-gray-800">
          <option>USD</option>
          <option>EUR</option>
          <option>GBP</option>
        </select>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl font-bold dark:text-white">
          {formatCurrency(totalBalance.amount)}
        </div>
        <div className={`text-sm ${totalBalance.percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {totalBalance.percentage >= 0 ? '↗' : '↘'} {Math.abs(totalBalance.percentage).toFixed(2)}%
        </div>
      </div>

      <div className="flex justify-end gap-2 mb-3">
        {timeFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveTimeFilter(filter.id)}
            className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
              activeTimeFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Balance']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0066ff"
              strokeWidth={2}
              fill="url(#colorValue)"
              fillOpacity={1}
              activeDot={{ r: 8, fill: "#fff", stroke: "#0066ff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Highlight Point */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-400 text-white px-3 py-1 rounded text-sm z-10">
          {formatCurrency(Math.max(...chartData.map(d => d.value)))}
        </div>
      </div>
    </div>
  );
};

export default TotalBalanceChart;
