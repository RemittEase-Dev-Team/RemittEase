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
  paymentProviders: PaymentProvider[];
  exchangeRates: {
    [key: string]: number;
  };
}

export default function Dashboard({
  moonpayEnabled,
  linkioEnabled,
  yellowCardEnabled,
  user,
  wallet,
  transactions,
  currencies,
  exchangeRates = {
    XLM: 1,
    USD: 1,
    EUR: 1,
    GBP: 1,
    // Add other default rates as needed
  }
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
  const [selectedCurrency, setSelectedCurrency] = useState<any | null>(null);
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | any | null>(null);
  const [depositStep, setDepositStep] = useState<'provider' | 'amount' | 'payment'>('provider');
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [modal, setModal] = useState(false)


  const paymentProviders = [
    {
      id: 'moonpay',
      fees: {
        percentage: 0.00000020,
        fixed: 0.000000001
      },
    },
    {
      id: 'linkio',
      fees: {
        percentage: 0.00000005,
        fixed: 0.00000034
      },
    },
    {
      id: 'yellowcard',
      fees: {
        percentage: 0.00000010,
        fixed: 1
      },
    },
  ]

  // console.log("p: ", wallet_address)

  // Dummy balances, totalBalance, chartData, etc.
  const [balance, setBalance] = useState({
    XLM: { amount: 12000, change: 800, percentage: 7.14 },
    USDC: { amount: 10000, change: 699, percentage: 6.00 },
    NGNC: { amount: 50000, change: 2500, percentage: 5.25 },
    EURC: { amount: 8500, change: -340, percentage: -3.85 },
    GBPC: { amount: 7800, change: 156, percentage: 2.04 },
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

      <div className="py-12 dark:bg-gray-900 bg-gray-100">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Quick Actions */}
          <QuickActions
            onDeposit={() => setDepositModal(true)}
            onSendRemittance={() => {
              // This should open your remittance flow modal
              setSendModal(true);
            }}
            onViewRecipients={() => {
              // Navigate to recipients management
              window.location.href = route('recipients.index');
            }}
            wallet={wallet}
          />

          {/* Balance and Chart Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            <BalanceWidget
              wallet={wallet}
              balance={balance}
              currencyMain={currencyMain}
              setCurrencyMain={(currency: CurrencyCode) => setCurrencyMain(currency)}
              onDeposit={() => setDepositModal(true)}
              onWithdraw={() => setWithdrawalModal(true)}
              onSend={() => setSendModal(true)}
              moonpayEnabled={moonpayEnabled}
            />
            <TotalBalanceChart
              chartData={chartData}
              totalBalance={{
                amount: totalBalance.amount,
                percentage: totalBalance.percentage
              }}
              activeTimeFilter={activeTimeFilter}
              setActiveTimeFilter={setActiveTimeFilter}
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
    </AuthenticatedLayout>
  );
}
