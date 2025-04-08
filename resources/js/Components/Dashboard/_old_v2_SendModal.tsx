import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Search, Wallet, Building2, X } from 'lucide-react';
import Modal from '@/Components/Modal';
import { ErrorBoundary } from '@/Components/ErrorBoundary';

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

interface SendFormData {
  [key: string]: string | TransferType;
  bank_code: string;
  account_number: string;
  amount: string;
  currency: string;
  narration: string;
  recipient_id: string;
  transfer_type: TransferType;
  wallet_address: string;
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

function SendModalContent({
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
  const [banks, setBanks] = useState<Bank[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [bankError, setBankError] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('NG');
  const [transferStatus, setTransferStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const { data, setData, post, processing, errors } = useForm<SendFormData>({
    bank_code: '',
    account_number: '',
    amount: '',
    currency: 'NGN',
    narration: '',
    recipient_id: '',
    transfer_type: 'crypto',
    wallet_address: ''
  });

  // Fetch banks when country changes
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setIsLoadingBanks(true);
        setBankError(null);
        const response = await axios.get(route('remittance.banks'), {
          params: { country: selectedCountry }
        });

        if (response.data.success) {
          setBanks(response.data.data || []);
        } else {
          setBankError(response.data.message || 'Failed to load banks');
        }
      } catch (error: any) {
        console.error('Failed to fetch banks:', error);
        if (error.response?.data?.message) {
          setBankError(error.response.data.message);
        } else if (error.message?.includes('route')) {
          setBankError('Service temporarily unavailable. Please try again later.');
        } else {
          setBankError('Failed to load banks. Please try again later.');
        }
      } finally {
        setIsLoadingBanks(false);
      }
    };

    if (transferType === 'cash') {
      fetchBanks();
    }
  }, [selectedCountry, transferType]);

  // Handle bank account verification
  const handleVerifyAccount = async () => {
    if (!selectedBank || !accountNumber) {
      setTransferError('Please select a bank and enter account number');
      return;
    }

    try {
      setIsVerifying(true);
      setTransferError(null);
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
        // Clear any previous errors
        setTransferError(null);
      } else {
        setTransferError(response.data.message || 'Failed to verify account');
        setAccountName('');
      }
    } catch (error: any) {
      console.error('Account verification failed:', error);
      setTransferError(error.response?.data?.message || 'Failed to verify account. Please try again.');
      setAccountName('');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setIsTransferring(true);
    setTransferStatus('processing');

    try {
      if (transferType === 'crypto') {
        // Handle crypto transfer
        if (!amount || !walletAddress) {
          setTransferError('Please fill in all required fields');
          setTransferStatus('failed');
          return;
        }

        const formData = {
          amount,
          currency: selectedCurrency?.code || 'NGN',
          transfer_type: 'crypto',
          wallet_address: walletAddress,
          narration: 'Transfer from RemittEase'
        };

        const response = await axios.post('/api/wallet/send-transaction', formData);

        if (response.data.success) {
          setTransferStatus('completed');
          setTransactionId(response.data.transaction_id);
          onClose();
        } else {
          setTransferStatus('failed');
          setTransferError(response.data.message);
        }
      } else {
        // Handle bank transfer
        if (!amount || !selectedBank || !accountNumber || !accountName) {
          setTransferError('Please fill in all required fields and verify account');
          setTransferStatus('failed');
          return;
        }

        const formData = {
          amount,
          currency: SUPPORTED_COUNTRIES[selectedCountry as keyof typeof SUPPORTED_COUNTRIES]?.currency || 'NGN',
          transfer_type: 'cash',
          bank_code: selectedBank,
          account_number: accountNumber,
          narration: 'Transfer from RemittEase',
          recipient_id: selectedRecipient?.id
        };

        const response = await axios.post('/api/wallet/send-transaction', formData);

        if (response.data.success) {
          setTransferStatus('completed');
          setTransactionId(response.data.transaction_id);
          onClose();
        } else {
          setTransferStatus('failed');
          setTransferError(response.data.message);
        }
      }
    } catch (error) {
      setTransferStatus('failed');
      setTransferError('Failed to process transaction');
      console.error('Error sending transaction:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <ErrorBoundary>
      <Modal show={true} onClose={onClose} maxWidth="2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Send Money</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transfer Type Selection */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setTransferType('crypto')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  transferType === 'crypto'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Wallet className="inline-block mr-2" size={20} />
                Crypto
              </button>
              <button
                type="button"
                onClick={() => setTransferType('cash')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  transferType === 'cash'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Building2 className="inline-block mr-2" size={20} />
                Bank Transfer
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                required
                min="0"
                step="0.0000001"
              />
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={selectedCurrency?.code || ''}
                onChange={(e) => {
                  const currency = currencies.find(c => c.code === e.target.value);
                  setSelectedCurrency(currency || null);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select currency</option>
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Details */}
            {transferType === 'cash' ? (
              <>
                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Object.entries(SUPPORTED_COUNTRIES).map(([code, country]) => (
                      <option key={code} value={code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bank Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoadingBanks}
                  >
                    <option value="">Select bank</option>
                    {banks.map((bank) => (
                      <option key={`bank-${bank.code}-${bank.country}`} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingBanks && <p className="text-sm text-gray-500 mt-1">Loading banks...</p>}
                  {bankError && <p className="text-sm text-red-500 mt-1">{bankError}</p>}
                </div>

                {/* Account Number with Verify Button */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account number"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAccount}
                      disabled={isVerifying || !selectedBank || !accountNumber}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  {accountName && (
                    <div className="p-3 bg-gray-50 rounded-lg mt-2">
                      <p className="text-sm text-gray-600">
                        Account Name: <span className="font-medium">{accountName}</span>
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Crypto Transfer */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter wallet address"
                  required
                />
              </div>
            )}

            {/* Error Message */}
            {transferError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                {transferError}
              </div>
            )}

            {/* Status Message */}
            {transferStatus !== 'idle' && (
              <div className={`p-3 rounded-lg ${
                transferStatus === 'completed'
                  ? 'bg-green-50 text-green-600'
                  : transferStatus === 'failed'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-blue-50 text-blue-600'
              }`}>
                {transferStatus === 'completed' && 'Transfer completed successfully!'}
                {transferStatus === 'failed' && transferError}
                {transferStatus === 'processing' && 'Processing your transfer...'}
              </div>
            )}

            {/* Transaction ID Display */}
            {transactionId && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Transaction ID: <span className="font-medium">{transactionId}</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isTransferring || processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isTransferring ? 'Processing...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </ErrorBoundary>
  );
}

export default SendModalContent;
