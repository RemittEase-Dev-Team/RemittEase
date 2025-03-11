import { Dispatch, SetStateAction } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area
} from 'recharts';

interface ChartData {
  time: string;
  value: number;
}

interface Props {
  chartData: ChartData[];
  totalBalance: {
    amount: number;
    percentage: number;
  };
  activeTimeFilter: string;
  setActiveTimeFilter: Dispatch<SetStateAction<string>>;
}

export default function TotalBalanceChart({
  chartData,
  totalBalance,
  activeTimeFilter,
  setActiveTimeFilter,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-5 shadow-sm md:col-span-2 lg:col-span-2">
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-semibold">Total Balance</div>
        <select className="px-5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-blue-400 text-sm">
          <option>USD</option>
          <option>NGN</option>
        </select>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl font-bold dark:text-gray-100">
          ${totalBalance.amount.toLocaleString()}
        </div>
        <div className="text-green-600 text-sm">
          ↗ {totalBalance.percentage.toFixed(2)}%
        </div>
      </div>

      <div className="flex justify-end gap-2 mb-3">
        {['Today', '24H', '1W', '1M', 'All'].map((filter) => (
          <button
            key={filter}
            className={`px-3 py-1 rounded-full text-sm ${
              activeTimeFilter === filter
                ? 'bg-gray-800 dark:bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-400'
            }`}
            onClick={() => setActiveTimeFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="h-64 relative">
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-400 text-white px-3 py-1 rounded text-sm z-10">
          $3,000
        </div>
        <ResponsiveContainer width="100%" height="100%" className="md:mt-20">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0066ff"
              strokeWidth={2}
              fill="url(#colorValue)"
              fillOpacity={1}
              activeDot={{ r: 8, fill: '#fff', stroke: '#0066ff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
