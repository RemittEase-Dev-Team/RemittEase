import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartData {
  time: string;
  value: number;
  date: Date;
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
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  exchangeRates: {
    [key: string]: number;
  };
}

const TotalBalanceChart: React.FC<TotalBalanceChartProps> = ({
  chartData,
  totalBalance,
  activeTimeFilter,
  setActiveTimeFilter,
  className = '',
  selectedCurrency,
  setSelectedCurrency,
  exchangeRates
}) => {
  const timeFilters = [
    { id: 'Today', label: 'Today' },
    { id: '24H', label: '24H' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: 'All', label: 'All' }
  ];

  const currencies = [
    { code: 'XLM', name: 'Stellar Lumens' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'NGN', name: 'Nigerian Naira' }
  ];

  const formatCurrency = (value: number) => {
    const rate = exchangeRates[selectedCurrency] || 1;
    const convertedValue = value * rate;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedValue);
  };

  const formatDate = (date: Date) => {
    switch (activeTimeFilter) {
      case 'Today':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '24H':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1W':
      case '1M':
      case 'All':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  const getChartColor = (value: number) => {
    if (value > 0) return '#10B981'; // green
    if (value < 0) return '#EF4444'; // red
    return '#6B7280'; // gray
  };

  // Convert chart data based on selected currency
  const getConvertedChartData = () => {
    const rate = exchangeRates[selectedCurrency] || 1;
    return chartData.map(data => ({
      ...data,
      value: data.value * rate
    }));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-semibold dark:text-white">Total Balance</div>
        <div className="flex items-center gap-4">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
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
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl font-bold dark:text-white">
          {formatCurrency(totalBalance.amount)}
        </div>
        <div className={`text-sm ${totalBalance.percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {totalBalance.percentage >= 0 ? '↗' : '↘'} {Math.abs(totalBalance.percentage).toFixed(2)}%
        </div>
      </div>

      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={getConvertedChartData()}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => formatDate(new Date(value))}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                return value.toFixed(2);
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Balance']}
              labelFormatter={(label) => formatDate(new Date(label))}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorValue)"
              fillOpacity={1}
              activeDot={{ r: 8, fill: "#fff", stroke: "#3B82F6", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Highlight Point */}
        {chartData.length > 0 && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-400 text-white px-3 py-1 rounded text-sm z-10">
            {formatCurrency(Math.max(...chartData.map(d => d.value)))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalBalanceChart;
