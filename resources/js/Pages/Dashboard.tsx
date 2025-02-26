import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ArrowUp, ArrowDown, Plus, Search, User, Copy } from 'lucide-react';
import { SiStellar} from 'react-icons/si';
import { BiDollar } from "react-icons/bi";
import { FaNairaSign } from "react-icons/fa6";
import { FaEuroSign } from "react-icons/fa";
import { FaPoundSign } from "react-icons/fa";

type CurrencyCode = 'XLM' | 'USD' | 'NGN' | 'EUR' | 'GBP';

export default function Dashboard() {
    const [currencyMain, setCurrencyMain] = useState<CurrencyCode>('XLM');
    const [activeTimeFilter, setActiveTimeFilter] = useState('Today');


    const [balance, setBalance] = useState({
        XLM: { amount: 12000, change: 800, percentage: 7.14, icon: <SiStellar /> },
        USD: { amount: 10000, change: 699, percentage: 6.00, icon: <BiDollar /> },
        NGN: { amount: 50000, change: 2500, percentage: 5.25, icon: <FaNairaSign /> },
        EUR: { amount: 8500, change: -340, percentage: -3.85, icon: <FaEuroSign /> },
        GBP: { amount: 7800, change: 156, percentage: 2.04, icon: <FaPoundSign /> },
    });

    const [totalBalance, setTotalBalance] = useState({
        amount: 15000,
        percentage: 1.00
    });

    const [fromAmount, setFromAmount] = useState(10);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('NGN');
    const [toAmount, setToAmount] = useState(1400);

    // Dummy chart data
    const chartData = [
        { time: '09:00', value: 2000 },
        { time: '10:00', value: 2800 },
        { time: '11:00', value: 2600 },
        { time: '12:00', value: 1800 },
        { time: '13:00', value: 2600 },
        { time: '14:00', value: 3300 },
        { time: '15:00', value: 2100 },
        { time: '16:00', value: 2400 },
        { time: '17:00', value: 1800 },
        { time: '18:00', value: 4500 }
    ];

    // Dummy transaction data
    const transactions = [
        { id: 1, name: 'Michael Philips', type: 'Sent', amount: 150, originalAmount: 151, currency: 'USD', date: '1 Oct, 2023', isOutgoing: true },
        { id: 2, name: 'Akin Mary', type: 'Sent', amount: 100, originalAmount: 101, currency: 'USD', date: '1 Oct, 2023', isOutgoing: true },
        { id: 3, name: 'Credit', type: 'Credit', amount: 200, originalAmount: 200, currency: 'USD', date: '24 Sept, 2023', isOutgoing: false }
    ];

    // Currency options
    const currencies = [
        { code: 'XLM', name: 'Stellar Lumens', flag: '🌌', selected: false },
        { code: 'USD', name: 'United States Dollar', flag: '🇺🇸', selected: true },
        { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', selected: true },
        { code: 'GBP', name: 'British Pound Sterling', flag: '🇬🇧', selected: false },
        { code: 'AED', name: 'United Arab Emirates Dirham', flag: '🇦🇪', selected: false },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺', selected: false },
        { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', selected: false },
        { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', selected: false },
        { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', selected: false },
        { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', selected: false },
        { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', selected: false },
        { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', selected: false },
        { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', selected: false },
        { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', selected: false },
        { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', selected: false },
        { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', selected: false },
        { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', selected: false },
        { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', selected: false },
        { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', selected: false },
        { code: 'NGNC', name: 'Nigerian Naira Coin', flag: '🇳🇬', selected: false },
        { code: 'USDC', name: 'USD Coin', flag: '💵', selected: false }
    ];

    // Handle currency conversion
    const handleConvert = () => {
        // Dummy conversion logic
        if (fromCurrency === 'USD' && toCurrency === 'NGN') {
            setToAmount(fromAmount * 1450);
        } else {
            setToAmount(fromAmount * 100); // Default multiplier
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Address copied to clipboard!');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold leading-tight text-blue-800 dark:text-blue-200">Dashboard</h2>
                    <div className="flex items-center bg-gray-800 dark:bg-gray-200 rounded-lg p-2">
                        <span className="text-sm text-gray-100 mr-2">Wallet: GABC1234...XYZ</span>
                        <button onClick={() => copyToClipboard('GABC1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')} className="text-gray-500 hover:text-gray-700">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="RemittEase Dashboard" />

            <div className="py-12 dark:bg-gray-900 bg-gray-100">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">


            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Balance Card */}
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-5 shadow-sm md:col-span-1 lg:col-span-1">
                    <div className="bg-gradient-to-r from-blue-100 to-orange-300 dark:bg-gradient-to-r dark:from-blue-900 dark:to-orange-700 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-lg font-semibold">Balance</div>
                        <select
                            className="px-5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-sm"
                            value={currencyMain}
                            onChange={(e) => setCurrencyMain(e.target.value as CurrencyCode)}
                        >
                            <option value="XLM">XLM</option>
                            <option value="USD">USD</option>
                            <option value="NGN">NGN</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>
                    <div className="text-3xl font-bold mb-1 flex items-center dark:text-gray-100">
                        <span>{balance[currencyMain]?.icon}</span>
                        <span className="ml-1">{balance[currencyMain]?.amount.toLocaleString()}</span>
                    </div>


                    <div className={`text-sm flex items-center gap-1 ${balance[currencyMain]?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {balance[currencyMain]?.change >= 0 ? (
                            <>+ {balance[currencyMain]?.icon} {balance[currencyMain]?.change.toLocaleString()}</>
                        ) : (
                            <>- {balance[currencyMain]?.icon} {Math.abs(balance[currencyMain]?.change).toLocaleString()}</>
                        )}
                        <span className="ml-2">{balance[currencyMain]?.percentage.toFixed(2)}%</span>
                    </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg flex-1 font-medium">
                            Deposit
                        </button>
                        <button className="bg-green-600 text-white py-2 px-4 rounded-lg flex-1 font-medium">
                            Send
                        </button>
                    </div>

                    <div className="mt-5">
                        <div className="font-semibold mb-3">Wallet</div>

                        {Object.entries(balance).map(([currency, data]) => (
                            <div key={currency} className="flex justify-between py-3 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span>{currencies.find(c => c.code === currency)?.flag}</span>
                                    <span>{currency}</span>
                                </div>
                                <div className="font-medium">
                                    {currency === 'USD' ? '$' : currency === 'NGN' ? '₦' : currency === 'GBP' ? '£' : '€'}
                                    {data.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Balance Chart */}
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-5 shadow-sm md:col-span-2 lg:col-span-2 ">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-lg font-semibold">Total Balance</div>
                        <select className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-sm">
                            <option>USD</option>
                            <option>NGN</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl font-bold dark:text-gray-100">${totalBalance.amount.toLocaleString()}</div>
                        <div className="text-green-600 text-sm">↗ {totalBalance.percentage.toFixed(2)}%</div>
                    </div>

                    <div className="flex justify-end gap-2 mb-3">
                        <button
                            className={`px-3 py-1 rounded-full text-sm ${activeTimeFilter === 'Today' ? 'bg-gray-800 dark:bg-gray-200 text-white' : 'bg-gray-100 dark:bg-gray-200'}`}
                            onClick={() => setActiveTimeFilter('Today')}
                        >
                            Today
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-sm ${activeTimeFilter === '24H' ? 'bg-gray-800 dark:bg-gray-200 text-white' : 'bg-gray-100 dark:bg-gray-200'}`}
                            onClick={() => setActiveTimeFilter('24H')}
                        >
                            24H
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-sm ${activeTimeFilter === '1W' ? 'bg-gray-800 dark:bg-gray-200 text-white' : 'bg-gray-100 dark:bg-gray-200'}`}
                            onClick={() => setActiveTimeFilter('1W')}
                        >
                            1W
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-sm ${activeTimeFilter === '1M' ? 'bg-gray-800 dark:bg-gray-200 text-white' : 'bg-gray-100 dark:bg-gray-200'}`}
                            onClick={() => setActiveTimeFilter('1M')}
                        >
                            1M
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-sm ${activeTimeFilter === 'All' ? 'bg-gray-800 dark:bg-gray-200 text-white' : 'bg-gray-100 dark:bg-gray-200'}`}
                            onClick={() => setActiveTimeFilter('All')}
                        >
                            All
                        </button>
                    </div>

                    <div className="h-64 relative">
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-400 text-white px-3 py-1 rounded text-sm z-10">
                            $3,000
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 5000]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                    width={30}
                                />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#0066ff"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 8, fill: "#fff", stroke: "#0066ff", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

        {/* New Price Alert */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-lg font-semibold mb-4">New price alert</div>

          {currencies.slice(0, 5).map((currency) => (
            <div key={currency.code} className="flex items-center justify-between mb-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currency.flag}</span>
                <span>{currency.name} ({currency.code})</span>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 accent-blue-600"
                checked={currency.selected}
                onChange={() => {}}
              />
            </div>
          ))}

          {currencies.length > 5 && (
            <button className="bg-blue-50 text-blue-600 w-full py-3 rounded-lg mt-4 font-medium">
              Show more
            </button>
          )}

          <button className="bg-blue-50 text-blue-600 w-full py-3 rounded-lg mt-4 font-medium">
            Set notification
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-lg font-semibold mb-4">Transaction History</div>

          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 mb-4">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="border-none outline-none w-full bg-transparent"
            />
          </div>

          <div className="text-sm text-gray-500 mb-2">1 Oct, 2023</div>

          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-start">
                {transaction.isOutgoing ? (
                  <div className="bg-red-50 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                    <ArrowUp size={18} />
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-500 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                    <Plus size={18} />
                  </div>
                )}
                <div>
                  <div className="font-medium">{transaction.name}</div>
                  <div className="text-sm text-gray-500">{transaction.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={transaction.isOutgoing ? 'font-medium' : 'font-medium text-green-600'}>
                  {transaction.isOutgoing ? '' : '+ '}
                  {transaction.amount} {transaction.currency}
                </div>
                {transaction.originalAmount !== transaction.amount && (
                  <div className="text-sm text-gray-500">
                    {transaction.originalAmount} {transaction.currency}
                  </div>
                )}
              </div>
            </div>
          ))}

          <button className="bg-blue-50 text-blue-600 w-full py-3 rounded-lg mt-4 font-medium">
            See all
          </button>
        </div>

        {/* Swap Currencies */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-lg font-semibold mb-4">Swap currencies</div>

          <div className="mb-4">
            <div className="text-sm mb-2">You pay</div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                className="text-2xl font-semibold outline-none w-1/2"
                value={fromAmount}
                onChange={(e) => setFromAmount(Number(e.target.value))}
              />
              <button className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2">
                <span className="text-lg">{currencies.find(c => c.code === fromCurrency)?.flag}</span>
                <span className="font-medium">{fromCurrency}</span>
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          <div className="flex justify-center my-4">
            <div className="bg-gray-100 p-2 rounded-full">
              <ArrowDown size={20} className="text-gray-500" />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm mb-2">You get</div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                className="text-2xl font-semibold outline-none w-1/2"
                value={toAmount}
                readOnly
              />
              <button className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2">
                <span className="text-lg">{currencies.find(c => c.code === toCurrency)?.flag}</span>
                <span className="font-medium">{toCurrency}</span>
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          <button
            className="bg-blue-600 text-white w-full py-3 rounded-lg mt-4 font-medium"
            onClick={handleConvert}
          >
            Convert
          </button>
        </div>
      </div>


      </div>
      </div>

        </AuthenticatedLayout>
    );
}
