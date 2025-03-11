import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Copy } from 'lucide-react';
import LiveCoinWatchTicker from '@/Components/LiveCoinWatchTicker';
import BalanceWidget from '@/Components/Dashboard/BalanceWidget';
import TotalBalanceChart from '@/Components/Dashboard/TotalBalanceChart';
import PriceAlertWidget from '@/Components/Dashboard/PriceAlertWidget';
import TransactionHistory from '@/Components/Dashboard/TransactionHistory';
import SwapWidget from '@/Components/Dashboard/SwapWidget';
import DepositModal from '@/Components/Dashboard//DepositModal';
import WithdrawalModal from '@/Components/Dashboard//WithdrawalModal';
import SendModal from '@/Components/Dashboard/SendModal';

type CurrencyCode = 'XLM' | 'USD' | 'NGN' | 'EUR' | 'GBP';

interface Wallet {
  publicKey: string;
  formattedPublicKey: string;
  balance: number;
  status: string;
  isVerified: boolean;
  created_at: string;
}

interface Props {
  moonpayEnabled: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    kyc_status: string;
    can_skip_kyc: boolean;
  };
  wallet: Wallet | null;
  transactions: Array<{
    id: number;
    type: string;
    amount: number;
    currency: string;
    date: string;
    status: string;
    isOutgoing: boolean;
    recipientAddress: string;
    transactionHash: string;
  }>;
  currencies: Array<{
    code: string;
    name: string;
    flag: string;
    selected: boolean;
  }>;
}

export default function Dashboard({ moonpayEnabled, user, wallet, transactions, currencies }: Props) {
  // Inertia form (use if you’re posting to your backend)
  const { data, setData, post } = useForm({
    type: '',
    currency: '',
    amount: '',
  });

  // Main local state
  const [currencyMain, setCurrencyMain] = useState<CurrencyCode>('XLM');
  const [activeTimeFilter, setActiveTimeFilter] = useState('Today');
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [sendModal, setSendModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<any | null>(null);
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Dummy balances, totalBalance, chartData, etc.
  const [balance, setBalance] = useState({
    XLM: { amount: 12000, change: 800, percentage: 7.14 },
    USD: { amount: 10000, change: 699, percentage: 6.00 },
    NGN: { amount: 50000, change: 2500, percentage: 5.25 },
    EUR: { amount: 8500, change: -340, percentage: -3.85 },
    GBP: { amount: 7800, change: 156, percentage: 2.04 },
  });

  const [totalBalance, setTotalBalance] = useState({
    amount: 15000,
    percentage: 1.0,
  });

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
    { time: '18:00', value: 4500 },
  ];

  // Methods

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied to clipboard!');
  };

  const handleDeposit: FormEventHandler = async (e) => {
    e.preventDefault();
    if (selectedCurrency && amount) {
      try {
        const response = post(
          route('deposit', {
            currency: selectedCurrency.code,
            amount,
          })
        );
        console.log('response: ', response);
      } catch (err) {
        console.log(err);
      }
      CloseModal();
    } else {
      alert('Please select a currency and enter an amount.');
    }
  };

  const handleWithdrawal: FormEventHandler = async (e) => {
    e.preventDefault();
    if (selectedCurrency && amount) {
      try {
        const response = post(
          route('withdraw', {
            currency: selectedCurrency.code,
            amount,
          })
        );
        console.log('response: ', response);
      } catch (err) {
        console.log(err);
      }
      CloseModal();
    } else {
      alert('Please select a currency and enter an amount.');
    }
  };

  // For "Send" we can do the same or adapt as needed.
  const handleSend: FormEventHandler = async (e) => {
    e.preventDefault();
    // your sending logic
    CloseModal();
  };

  const CloseModal = () => {
    setDepositModal(false);
    setWithdrawalModal(false);
    setSendModal(false);
    setSearch('');
    setSelectedCurrency(null);
    setAmount('');
    setWalletAddress('');
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col justify-between items-center md:flex-row">
          <h2 className="text-2xl font-bold leading-tight text-blue-800 dark:text-blue-200">
            Dashboard
          </h2>

          {/* KYC Alert */}
          {user.kyc_status !== 'approved' && (
            <p className="bg-yellow-200 p-4 rounded-lg text-yellow-800 mt-4 md:mt-0">
              ⚠️ You have not completed KYC verification. To access full remittance features,{' '}
              <a href="/kyc" className="text-blue-600 underline italic">
                click here
              </a>{' '}
              to verify your identity.
            </p>
          )}

          {/* Wallet Info */}
          <div className="flex items-center bg-gray-800 dark:bg-blue-200 rounded-lg p-2 mt-4 md:mt-0">
            <span className="text-sm text-gray-100 dark:text-gray-900 mr-2">
              Wallet: {wallet?.formattedPublicKey || 'No wallet found'}
            </span>
            {wallet?.publicKey && (
              <button
                onClick={() => copyToClipboard(wallet.publicKey)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Copy size={16} />
              </button>
            )}
          </div>
        </div>
      }
    >
      <Head title="RemittEase Dashboard" />

      <LiveCoinWatchTicker />

      {/* Modals */}
      {depositModal && (
        <DepositModal
          search={search}
          setSearch={setSearch}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          amount={amount}
          setAmount={setAmount}
          currencies={currencies}
          CloseModal={CloseModal}
          handleDeposit={handleDeposit}
        />
      )}

      {withdrawalModal && (
        <WithdrawalModal
          search={search}
          setSearch={setSearch}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          amount={amount}
          setAmount={setAmount}
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          currencies={currencies}
          CloseModal={CloseModal}
          handleWithdrawal={handleWithdrawal}
        />
      )}

      {sendModal && (
        <SendModal
          search={search}
          setSearch={setSearch}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          amount={amount}
          setAmount={setAmount}
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          currencies={currencies}
          CloseModal={CloseModal}
          handleSend={handleSend}
        />
      )}

      <div className="py-12 dark:bg-gray-900 bg-gray-100">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

          {/* Top grid: Balances + Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left: BalanceWidget */}
            <BalanceWidget
              wallet={wallet}
              balance={balance}
              currencyMain={currencyMain}
              setCurrencyMain={setCurrencyMain}
              moonpayEnabled={moonpayEnabled}
              setDepositModal={setDepositModal}
              setWithdrawalModal={setWithdrawalModal}
              setSendModal={setSendModal}
            />

            {/* Right: TotalBalanceChart */}
            <TotalBalanceChart
              chartData={chartData}
              totalBalance={totalBalance}
              activeTimeFilter={activeTimeFilter}
              setActiveTimeFilter={setActiveTimeFilter}
            />
          </div>

          {/* Bottom grid: Price Alert + TransactionHistory + Swap Widget */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            <PriceAlertWidget currencies={currencies} />
            <TransactionHistory transactions={transactions} />
            <SwapWidget />
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}
