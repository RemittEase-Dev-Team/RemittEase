import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Search, Wallet, Building2, X } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  flag: string;
  selected: boolean;
}

interface Bank {
  code: string;
  name: string;
  country: string;
}

interface Recipient {
  id: number;
  name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  country: string;
  currency: string;
}

interface Props {
  search: string;
  setSearch: (val: string) => void;
  selectedCurrency: Currency | null;
  setSelectedCurrency: (val: Currency | null) => void;
  amount: string;
  setAmount: (val: string) => void;
  walletAddress: string;
  setWalletAddress: (val: string) => void;
  currencies?: Currency[];
  CloseModal: () => void;
  handleSend: FormEventHandler;
  onClose?: () => void;
}

type TransferType = 'crypto' | 'cash';

interface FormData extends Record<string, string> {
  amount: string;
  currency: string;
  wallet_address: string;
  transfer_type: 'crypto' | 'cash';
  bank_code: string;
  account_number: string;
  narration: string;
  recipient_id: string;
}

interface TransferResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const SUPPORTED_COUNTRIES = {
  NG: { name: 'Nigeria', currency: 'NGN' },
  GH: { name: 'Ghana', currency: 'GHS' },
  KE: { name: 'Kenya', currency: 'KES' },
  UG: { name: 'Uganda', currency: 'UGX' },
  TZ: { name: 'Tanzania', currency: 'TZS' },
  ZA: { name: 'South Africa', currency: 'ZAR' },
  ZM: { name: 'Zambia', currency: 'ZMW' },
  CM: { name: 'Cameroon', currency: 'XAF' },
  CI: { name: 'Côte d\'Ivoire', currency: 'XOF' },
  EG: { name: 'Egypt', currency: 'EGP' },
  MA: { name: 'Morocco', currency: 'MAD' },
  SN: { name: 'Senegal', currency: 'XOF' },
  BF: { name: 'Burkina Faso', currency: 'XOF' },
  ML: { name: 'Mali', currency: 'XOF' },
  NE: { name: 'Niger', currency: 'XOF' },
  TG: { name: 'Togo', currency: 'XOF' },
  BJ: { name: 'Benin', currency: 'XOF' },
  GA: { name: 'Gabon', currency: 'XAF' },
  CF: { name: 'Central African Republic', currency: 'XAF' },
  GQ: { name: 'Equatorial Guinea', currency: 'XAF' },
  TD: { name: 'Chad', currency: 'XAF' },
  CG: { name: 'Republic of Congo', currency: 'XAF' },
  AO: { name: 'Angola', currency: 'AOA' },
  MZ: { name: 'Mozambique', currency: 'MZN' },
  BW: { name: 'Botswana', currency: 'BWP' },
  NA: { name: 'Namibia', currency: 'NAD' },
  LS: { name: 'Lesotho', currency: 'LSL' },
  SZ: { name: 'Eswatini', currency: 'SZL' },
  MG: { name: 'Madagascar', currency: 'MGA' },
  RW: { name: 'Rwanda', currency: 'RWF' },
  BI: { name: 'Burundi', currency: 'BIF' },
  ET: { name: 'Ethiopia', currency: 'ETB' },
  SD: { name: 'Sudan', currency: 'SDG' },
  SS: { name: 'South Sudan', currency: 'SSP' },
  SO: { name: 'Somalia', currency: 'SOS' },
  DJ: { name: 'Djibouti', currency: 'DJF' },
  ER: { name: 'Eritrea', currency: 'ERN' },
  LY: { name: 'Libya', currency: 'LYD' },
  TN: { name: 'Tunisia', currency: 'TND' },
  DZ: { name: 'Algeria', currency: 'DZD' },
  MR: { name: 'Mauritania', currency: 'MRU' },
  GM: { name: 'Gambia', currency: 'GMD' },
  GN: { name: 'Guinea', currency: 'GNF' },
  GW: { name: 'Guinea-Bissau', currency: 'XOF' },
  SL: { name: 'Sierra Leone', currency: 'SLL' },
  LR: { name: 'Liberia', currency: 'LRD' },
  ST: { name: 'São Tomé and Príncipe', currency: 'STN' },
  CV: { name: 'Cape Verde', currency: 'CVE' },
  KM: { name: 'Comoros', currency: 'KMF' },
  SC: { name: 'Seychelles', currency: 'SCR' },
  MU: { name: 'Mauritius', currency: 'MUR' },
  RE: { name: 'Réunion', currency: 'EUR' },
  YT: { name: 'Mayotte', currency: 'EUR' },
  SH: { name: 'Saint Helena', currency: 'SHP' },
  IO: { name: 'British Indian Ocean Territory', currency: 'USD' },
  TF: { name: 'French Southern Territories', currency: 'EUR' },
  EH: { name: 'Western Sahara', currency: 'MAD' },
  AC: { name: 'Ascension Island', currency: 'SHP' },
  CP: { name: 'Clipperton Island', currency: 'EUR' },
  DG: { name: 'Diego Garcia', currency: 'USD' },
  EA: { name: 'Ceuta', currency: 'EUR' },
  IC: { name: 'Canary Islands', currency: 'EUR' },
  TA: { name: 'Tristan da Cunha', currency: 'SHP' },
  XA: { name: 'Saint-Martin', currency: 'EUR' },
  XB: { name: 'Saint-Barthélemy', currency: 'EUR' },
  XC: { name: 'Curaçao', currency: 'ANG' },
  XE: { name: 'Sint Eustatius', currency: 'ANG' },
  XM: { name: 'Sint Maarten', currency: 'ANG' },
  XN: { name: 'Saint Kitts and Nevis', currency: 'XCD' },
  XS: { name: 'Somaliland', currency: 'SOS' },
  XT: { name: 'Mayotte', currency: 'EUR' },
  XU: { name: 'Saint Helena', currency: 'SHP' },
  XV: { name: 'Saint Vincent and the Grenadines', currency: 'XCD' },
  XW: { name: 'Wallis and Futuna', currency: 'XPF' },
  XY: { name: 'Saint Pierre and Miquelon', currency: 'EUR' },
  XZ: { name: 'Saint Lucia', currency: 'XCD' },
  ZW: { name: 'Zimbabwe', currency: 'ZWL' },
};

export default function SendModal({
  search,
  setSearch,
  selectedCurrency,
  setSelectedCurrency,
  amount,
  setAmount,
  walletAddress,
  setWalletAddress,
  currencies = [],
  CloseModal,
  handleSend,
  onClose = CloseModal
}: Props) {
  const [transferType, setTransferType] = useState<TransferType>('crypto');
  const [selectedCountry, setSelectedCountry] = useState('NG');
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  const { data, setData, post, processing, errors } = useForm<FormData>({
    amount: '',
    currency: '',
    wallet_address: '',
    transfer_type: 'crypto',
    bank_code: '',
    account_number: '',
    narration: '',
    recipient_id: ''
  });

  useEffect(() => {
    // Fetch banks and recipients when component mounts
    const fetchData = async () => {
      setIsLoadingBanks(true);
      setBankError(null);
      try {
        // Fetch banks for selected country
        const banksResponse = await axios.get(route('remittance.banks'), {
          params: { country: selectedCountry }
        });
        if (banksResponse.data.success) {
          setBanks(banksResponse.data.data || []);
        } else {
          setBankError(banksResponse.data.message || 'Failed to load banks');
        }

        // Fetch recipients using the new endpoint
        const recipientsResponse = await axios.get(route('recipients.transfer'));
        if (recipientsResponse.data.success) {
          setRecipients(recipientsResponse.data.data || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        if (error.response?.data?.message) {
          setBankError(error.response.data.message);
        } else if (error.message?.includes('route')) {
          setBankError('Service temporarily unavailable. Please try again later.');
        } else {
          setBankError('Failed to load data. Please try again later.');
        }
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchData();
  }, [selectedCountry]);

  const verifyAccount = async () => {
    if (!selectedBank || !accountNumber) return;

    setIsVerifying(true);
    setTransferError(null);
    try {
      const response = await axios.post(route('remittance.verify-account'), {
        bank_code: selectedBank,
        account_number: accountNumber
      });

      if (response.data.success) {
        setAccountName(response.data.data.account_name);
        setData({
          ...data,
          bank_code: selectedBank,
          account_number: accountNumber
        });
      } else {
        setTransferError(response.data.message || 'Failed to verify account');
      }
    } catch (error) {
      console.error('Account verification failed:', error);
      setTransferError('Failed to verify account. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setIsTransferring(true);

    try {
      if (transferType === 'crypto') {
        if (!selectedCurrency || !amount || !walletAddress) {
          setTransferError('Please fill in all required fields');
          return;
        }

        const formData: FormData = {
          amount,
          currency: selectedCurrency.code,
          wallet_address: walletAddress,
          transfer_type: 'crypto',
          bank_code: '',
          account_number: '',
          narration: '',
          recipient_id: ''
        };

        post(route('remittance.transfer'), {
          onSuccess: () => {
            CloseModal();
          },
          onError: (errors) => {
            setTransferError(Object.values(errors)[0] || 'Transfer failed');
          }
        });
      } else {
        if (!selectedRecipient || !amount || !selectedBank || !accountNumber) {
          setTransferError('Please fill in all required fields');
          return;
        }

        const formData: FormData = {
          recipient_id: selectedRecipient.id.toString(),
          amount,
          currency: SUPPORTED_COUNTRIES[selectedCountry as keyof typeof SUPPORTED_COUNTRIES].currency,
          bank_code: selectedBank,
          account_number: accountNumber,
          narration: data.narration,
          transfer_type: 'cash',
          wallet_address: ''
        };

        post(route('remittance.transfer'), {
          onSuccess: () => {
            CloseModal();
          },
          onError: (errors) => {
            setTransferError(Object.values(errors)[0] || 'Transfer failed');
          }
        });
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      setTransferError('Failed to process transfer. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  const filteredCurrencies = currencies?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Money</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Transfer Type Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setTransferType('crypto')}
              className={`flex-1 py-2 px-4 rounded ${
                transferType === 'crypto'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Crypto
            </button>
            <button
              onClick={() => setTransferType('cash')}
              className={`flex-1 py-2 px-4 rounded ${
                transferType === 'cash'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Cash
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {transferType === 'crypto' ? (
            // Crypto Transfer Form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                <select
                  value={selectedCurrency?.code || ''}
                  onChange={(e) => {
                    const currency = currencies.find(c => c.code === e.target.value);
                    setSelectedCurrency(currency || null);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Currency</option>
                  {currencies.map((currency) => (
                    <option key={`currency-${currency.code}`} value={currency.code}>
                      {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter wallet address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter amount"
                />
              </div>
            </div>
          ) : (
            // Cash Transfer Form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {Object.entries(SUPPORTED_COUNTRIES).map(([code, { name, currency }]) => (
                    <option key={`country-${code}`} value={code}>
                      {name} ({currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipient</label>
                <select
                  value={selectedRecipient?.id || ''}
                  onChange={(e) => {
                    const recipient = recipients.find(r => r.id === parseInt(e.target.value));
                    setSelectedRecipient(recipient || null);
                    if (recipient) {
                      setSelectedBank(recipient.bank_code);
                      setAccountNumber(recipient.account_number);
                      setAccountName(recipient.account_name);
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Recipient</option>
                  {recipients.map((recipient) => (
                    <option key={`recipient-${recipient.id}`} value={recipient.id}>
                      {recipient.name} - {recipient.account_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  disabled={isLoadingBanks}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Bank</option>
                  {banks.map((bank) => (
                    <option key={`bank-${bank.code}-${bank.country}`} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                {isLoadingBanks && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading banks...</p>}
                {bankError && <p className="mt-1 text-sm text-red-500">{bankError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="flex-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Enter account number"
                  />
                  <button
                    type="button"
                    onClick={verifyAccount}
                    disabled={isVerifying || !selectedBank || !accountNumber}
                    className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                {accountName && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Account Name: {accountName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ({SUPPORTED_COUNTRIES[selectedCountry as keyof typeof SUPPORTED_COUNTRIES].currency})</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Narration (Optional)</label>
                <input
                  type="text"
                  value={data.narration}
                  onChange={(e) => setData('narration', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter narration"
                />
              </div>
            </div>
          )}

          {transferError && (
            <div className="mt-4 text-sm text-red-500">{transferError}</div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTransferring || processing}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isTransferring ? 'Processing...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
