import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
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
import Modal from '@/Components/Modal';
import ProviderCard from '@/Components/Dashboard/ProviderCard';
import WithdrawalCard from '@/Components/Dashboard/WithdrawalCard';
import DepositAmountForm from '@/Components/Dashboard/DepositAmountForm';
import QuickActions from '@/Components/Dashboard/QuickActions';
import AnalyticsWidget from '@/Components/Dashboard/AnalyticsWidget';
import CopyConfirmationModal from '@/Components/Dashboard/CopyConfirmationModal';
import { CurrencyCode } from '@/types/currency';

interface Wallet {
  publicKey: string;
  formattedPublicKey: string;
  balance: number;
  status: string;
  isVerified: boolean;
  created_at: string;
}

interface PaymentProvider {
  id: string;
  name: string;
  logo: string;
  supportedCurrencies: string[];
  minimumAmount: number;
  maximumAmount: number;
  fees: {
    percentage: number;
    fixed: number;
  };
}

interface DepositResponse {
  data: {
    redirectUrl?: string;
    sessionId?: string;
  }
}

interface DepositFormData {
  [key: string]: string | undefined;
  provider: string;
  currency: string;
  amount: string;
  wallet_address: string;
}

interface TransferFormData extends Record<string, string> {
  amount: string;
  currency: string;
  narration: string;
  bank_code: string;
  account_number: string;
}

interface ChartData {
  time: string;
  value: number;
  date: Date;
}

interface Currency {
  code: string;
  name: string;
  flag: string;
  selected: boolean;
}

interface ExchangeRates {
  [key: string]: number;
  XLM: number;
  USD: number;
  EUR: number;
  GBP: number;
  NGN: number;
}

interface ExchangeRateResponse {
  stellar: {
    usd: number;
    eur: number;
    gbp: number;
    ngn: number;
  };
}

interface Props {
  moonpayEnabled: boolean;
  linkioEnabled: boolean;
  yellowCardEnabled: boolean;
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
  balances?: {
    native: string;
    token: string;
    amount: string;
  };
  paymentProviders: PaymentProvider[];
}

export default function Dashboard({
  moonpayEnabled,
  linkioEnabled,
  yellowCardEnabled,
  user,
  wallet,
  transactions,
  currencies,
  balances,
  paymentProviders
}: Props) {
  // Inertia form (use if you're posting to your backend)
  const { data, setData, post } = useForm<DepositFormData>({
    provider: '',
    currency: '',
    amount: '',
    wallet_address: ''
  });

  // Main local state
  const [currencyMain, setCurrencyMain] = useState<CurrencyCode>('XLM');
  const [activeTimeFilter, setActiveTimeFilter] = useState('Today');
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [sendModal, setSendModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>({
    code: 'XLM',
    name: 'Stellar Lumens',
    flag: 'XLM',
    selected: true
  });
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | any | null>(null);
  const [depositStep, setDepositStep] = useState<'provider' | 'amount' | 'payment'>('provider');
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [modal, setModal] = useState(false)
  const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [xlmPrice, setXlmPrice] = useState(0);
  const [chartCurrency, setChartCurrency] = useState('XLM');

  // Add new state for exchange rates
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    XLM: 1,
    USD: 1,
    EUR: 1,
    GBP: 1,
    NGN: 1
  });

  // Dummy balances, totalBalance, chartData, etc.
  const [balance, setBalance] = useState({
    XLM: { amount: 0, change: 800, percentage: 7.14 },
    USDC: { amount: 0, change: 699, percentage: 6.00 },
    NGNC: { amount: 0, change: 2500, percentage: 5.25 },
    EURC: { amount: 0, change: -340, percentage: -3.85 },
    GBPC: { amount: 0, change: 156, percentage: 2.04 },
  });

  const [totalBalance, setTotalBalance] = useState({
    amount: 15000,
    percentage: 1.0,
  });

  // Fetch XLM price from CoinGecko
  useEffect(() => {
    const fetchXlmPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd');
        const data = await response.json();
        setXlmPrice(data.stellar.usd);
      } catch (error) {
        console.error('Error fetching XLM price:', error);
      }
    };

    fetchXlmPrice();
    // Update price every 5 minutes
    const interval = setInterval(fetchXlmPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total balance in USD and prepare chart data
  useEffect(() => {
    if (wallet && xlmPrice) {
      // Calculate total balance in USD
      const xlmBalance = wallet.balance || 0;
      const totalUSD = xlmBalance * xlmPrice;
      setTotalBalanceUSD(totalUSD);

      // Prepare chart data from transactions
      const now = new Date();
      const chartDataMap = new Map<string, number>();

      // Initialize chart data with current balance
      chartDataMap.set(now.toISOString().split('T')[0], totalUSD);

      // Process transactions
      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const dateStr = date.toISOString().split('T')[0];

        // Convert transaction amount to USD if it's in XLM
        const amountUSD = transaction.currency === 'XLM'
          ? transaction.amount * xlmPrice
          : transaction.amount;

        // Add or update the balance for this date
        const currentBalance = chartDataMap.get(dateStr) || 0;
        chartDataMap.set(dateStr, currentBalance + (transaction.isOutgoing ? -amountUSD : amountUSD));
      });

      // Convert map to array and sort by date
      const sortedData = Array.from(chartDataMap.entries())
        .map(([date, balance]) => ({
          time: new Date(date).toISOString(),
          value: balance,
          date: new Date(date)
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Ensure we have at least one data point for today
      const today = new Date().toISOString().split('T')[0];
      if (!sortedData.some(d => d.time.startsWith(today))) {
        sortedData.push({
          time: new Date().toISOString(),
          value: totalUSD,
          date: new Date()
        });
      }

      setChartData(sortedData);
    }
  }, [wallet, transactions, xlmPrice]);

  // Fetch exchange rates from CoinGecko
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd,eur,gbp,ngn'
        );
        const data: ExchangeRateResponse = await response.json();

        // Update exchange rates
        setExchangeRates({
          XLM: 1,
          USD: data.stellar.usd,
          EUR: data.stellar.eur,
          GBP: data.stellar.gbp,
          NGN: data.stellar.ngn
        });
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };

    // Fetch immediately
    fetchExchangeRates();

    // Update every 5 minutes
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter chart data based on active time filter
  const getFilteredChartData = (filter: string) => {
    if (!chartData.length) return [];

    const now = new Date();
    const filterDate = new Date();

    switch (filter) {
      case 'Today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case '24H':
        filterDate.setHours(now.getHours() - 24);
        break;
      case '1W':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'All':
        return chartData;
      default:
        return chartData;
    }

    return chartData.filter(data => data.date >= filterDate);
  };

  // Calculate percentage change
  const calculatePercentageChange = (filter: string) => {
    const filteredData = getFilteredChartData(filter);
    if (filteredData.length < 2) return 0;

    const oldestValue = filteredData[0].value;
    const newestValue = filteredData[filteredData.length - 1].value;

    if (oldestValue === 0) return 0;
    return ((newestValue - oldestValue) / oldestValue) * 100;
  };

  // Methods

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setShowCopyModal(true);
  };

  const initializeLinkioWidget = (sessionId: string) => {
    console.log('Initializing Linkio widget with session:', sessionId);
  };

  const initializeYellowCardWidget = (sessionId: string) => {
    console.log('Initializing Yellow Card widget with session:', sessionId);
  };

  const handleFiatDeposit = async (formData: {
    amount: number;
    currency: string;
    estimatedXLM: number;
  }) => {
    setProcessingDeposit(true);

    setData({
      provider: selectedProvider?.id || '',
      currency: formData.currency,
      amount: formData.amount.toString(),
      wallet_address: wallet?.publicKey || ''
    });

    try {

      await new Promise(resolve => setTimeout(resolve, 1000));

      // const response = post(route('deposit.fiat')) as unknown as DepositResponse;
      const response = post(route('moonpay.create')) as unknown as DepositResponse;

      if (response?.data) {
        // console.log("se. Pro. :", response)
        if (response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        } else if (response.data.sessionId) {
          const provider = selectedProvider?.id;
          if (provider === 'linkio') {
            initializeLinkioWidget(response.data.sessionId);
          } else if (provider === 'yellowcard') {
            initializeYellowCardWidget(response.data.sessionId);
          }
        }
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Failed to process deposit. Please try again.');
    } finally {
      setProcessingDeposit(false);
    }
  };

  const handleWithdrawal: FormEventHandler = async (e) => {
    e.preventDefault();
    if (selectedCurrency && amount) {
      try {
        const response = post(
          route('withdraw', {
            currency: selectedCurrency,
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
    setSelectedCurrency({
      code: 'XLM',
      name: 'Stellar Lumens',
      flag: 'XLM',
      selected: true
    });
    setAmount('');
    setWalletAddress('');
    setSelectedProvider(null);
    setDepositStep('provider');
  };

  // New deposit modal content
  const DepositModalContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      {depositStep === 'provider' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moonpayEnabled && (
            <ProviderCard
              provider="moonpay"
              title="MoonPay"
              description="Credit/Debit Card, Bank Transfer"
              walletAddress={wallet?.publicKey}
              modal={modal}
              onClick={() => {
                window.location.href = '/deposit/2'
                const provider = paymentProviders.find(p => p.id === 'moonpay');
                // const provider = 'moonpay'
                if (provider) {
                  // setSelectedProvider(provider);
                  // setDepositStep('amount');
                  setModal(false)
                }
              }}
            />
          )}
          {linkioEnabled && (
            <ProviderCard
              provider="linkio"
              title="Linkio"
              description="Local Bank Transfer"
              walletAddress={wallet?.publicKey}
              modal={modal}
              onClick={() => {
                window.location.href = '/deposit/1'
                const provider = paymentProviders.find(p => p.id === 'linkio');
                // const provider = 'linkio'
                if (provider) {
                  // setSelectedProvider(provider);
                  // setModal(!modal)
                  // setDepositStep('amount');
                }
              }}
            />
          )}
          {yellowCardEnabled && (
            <ProviderCard
              provider="yellowcard"
              title="Yellow Card"
              description="Crypto & Local Currency"
              walletAddress={wallet?.publicKey}
              modal={modal}
              onClick={() => {
                window.location.href = '/deposit/3'
                const provider = paymentProviders.find(p => p.id === 'yellowcard');
                // const provider = 'yellowcard'
                if (provider) {
                  // setSelectedProvider(provider);
                  // setDepositStep('amount');
                  setModal(false)
                }
              }}
            />
          )}
        </div>
      )}

      {/* {depositStep === 'amount' && selectedProvider && (
        <DepositAmountForm
          selectedProvider={selectedProvider}
          currencies={currencies}
          exchangeRates={exchangeRates}
          initialAmount={amount}
          initialCurrency={selectedCurrency}
          onAmountChange={setAmount}
          onCurrencyChange={setSelectedCurrency}
          onSubmit={(formData) => {
            handleFiatDeposit(formData);
          }}
          onBack={() => setDepositStep('provider')}
        />
      )} */}
    </div>
  );

  const WithdrawalModalContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moonpayEnabled && (
            <WithdrawalCard
              provider="moonpay"
              title="MoonPay"
              description=""
              walletAddress={wallet?.publicKey}
              modal={modal}
              onClick={() => {
                window.location.href = '/deposit'
                const provider = paymentProviders.find(p => p.id === 'moonpay');
                // const provider = 'moonpay'
                if (provider) {
                  // setSelectedProvider(provider);
                  // setDepositStep('amount');
                  setModal(false)
                }
              }}
            />
          )}
          {linkioEnabled && (
            <WithdrawalCard
              provider="linkio"
              title="Linkio"
              description="Local Bank withdrawal"
              walletAddress={wallet?.publicKey}
              modal={modal}
              onClick={() => {
                const provider = paymentProviders.find(p => p.id === 'linkio');
                // const provider = 'linkio'
                if (provider) {
                  // setSelectedProvider(provider);
                  setModal(!modal)
                  // setDepositStep('amount');
                }
              }}
            />
          )}
          {yellowCardEnabled && (
            <WithdrawalCard
              provider="yellowcard"
              title="Yellow Card"
              description="Crypto & Local Currency"
              walletAddress={wallet?.publicKey}
              modal={modal}
              onClick={() => {
                window.location.href = '/deposit'
                const provider = paymentProviders.find(p => p.id === 'yellowcard');
                // const provider = 'yellowcard'
                if (provider) {
                  // setSelectedProvider(provider);
                  // setDepositStep('amount');
                  setModal(false)
                }
              }}
            />
          )}
        </div>

      {/* {depositStep === 'amount' && selectedProvider && (
        <DepositAmountForm
          selectedProvider={selectedProvider}
          currencies={currencies}
          exchangeRates={exchangeRates}
          initialAmount={amount}
          initialCurrency={selectedCurrency}
          onAmountChange={setAmount}
          onCurrencyChange={setSelectedCurrency}
          onSubmit={(formData) => {
            handleFiatDeposit(formData);
          }}
          onBack={() => setDepositStep('provider')}
        />
      )} */}
    </div>
  );

  // Default balances if not provided
  const defaultBalances = {
    native: '0',
    token: '0',
    amount: '0'
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

      {/* Add the CopyConfirmationModal */}
      <CopyConfirmationModal
        show={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        address={copiedAddress}
      />

      <div className="py-12 dark:bg-gray-900 bg-gray-100">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Quick Actions */}
          <QuickActions
            onDeposit={() => setDepositModal(true)}
            onSendRemittance={() => {
              setSendModal(true);
            }}
            onViewRecipients={() => {
              window.location.href = route('recipients.index');
            }}
            onViewTransactions={() => {
              window.location.href = route('transactions');
            }}
            wallet={wallet}
          />

          {/* Balance and Chart Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            <BalanceWidget
              wallet={wallet}
              balance={balance}
              currencyMain={currencyMain}
              setCurrencyMain={setCurrencyMain}
              onDeposit={() => setDepositModal(true)}
              onWithdraw={() => setWithdrawalModal(true)}
              onSend={() => setSendModal(true)}
              moonpayEnabled={moonpayEnabled}
              balances={balances || defaultBalances}
              isLoading={false}
              exchangeRates={exchangeRates}
            />
            <TotalBalanceChart
              chartData={getFilteredChartData(activeTimeFilter)}
              totalBalance={{
                amount: totalBalanceUSD,
                percentage: calculatePercentageChange(activeTimeFilter)
              }}
              activeTimeFilter={activeTimeFilter}
              setActiveTimeFilter={setActiveTimeFilter}
              selectedCurrency={chartCurrency}
              setSelectedCurrency={setChartCurrency}
              exchangeRates={exchangeRates}
              className="md:col-span-2"
            />
          </div>

          {/* Transaction History and Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <TransactionHistory transactions={transactions} />
            <AnalyticsWidget wallet={wallet} transactions={transactions} />
          </div>
        </div>
      </div>

      {/* Updated modals */}
      {depositModal && (
        <Modal
          show={depositModal}
          onClose={CloseModal}
          maxWidth="2xl"
        >
          <DepositModalContent />
        </Modal>
      )}

      {withdrawalModal && (

        <Modal
          show={withdrawalModal}
          onClose={CloseModal}
          maxWidth="2xl"
        >
          <WithdrawalModalContent />
        </Modal>

        // <WithdrawalModal
        //   search={search}
        //   setSearch={setSearch}
        //   selectedCurrency={selectedCurrency}
        //   setSelectedCurrency={setSelectedCurrency}
        //   amount={amount}
        //   setAmount={setAmount}
        //   walletAddress={walletAddress}
        //   setWalletAddress={setWalletAddress}
        //   currencies={currencies}
        //   CloseModal={CloseModal}
        //   handleWithdrawal={handleWithdrawal}
        // />
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
    </AuthenticatedLayout>
  );
}
