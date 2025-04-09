import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ChevronLeft, Upload, PlusCircle, X, Save, Clock } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Checkbox from '@/Components/Checkbox';
import Select from '@/Components/Select';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface RecentProcess {
  id: number;
  transaction_count: number;
  schedule_type: string;
  next_execution: string;
  is_active: boolean;
  created_at: string;
}

interface Recipient {
  name: string;
  email: string;
  account_number: string;
  bank_code: string;
  amount: string;
}

interface BulkRemittanceProps {
  currencies: Currency[];
  recent_processes: RecentProcess[];
}

export default function BulkRemittance({ currencies, recent_processes }: BulkRemittanceProps) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
  const [isScheduled, setIsScheduled] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([{
    name: '',
    email: '',
    account_number: '',
    bank_code: '',
    amount: '',
  }]);

  const { data, setData, post, processing, errors, reset } = useForm({
    file: null as File | null,
    currency: currencies.length > 0 ? currencies[0].code : 'XLM',
    schedule_type: 'daily',
    is_recurring: false,
    notes: '',
    recipients: [] as Recipient[],
  });

  const { data: manualData, setData: setManualData, post: postManual, processing: processingManual, errors: manualErrors } = useForm({
    recipients: [] as Recipient[],
    currency: currencies.length > 0 ? currencies[0].code : 'XLM',
    schedule_type: 'daily',
    is_recurring: false,
    notes: '',
  });

  useEffect(() => {
    // When recipients state changes, update form data
    setManualData('recipients', recipients);
  }, [recipients]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('file', e.target.files[0]);
    }
  };

  const submitFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.bulk-remittance.upload'), {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  };

  const submitManualForm = (e: React.FormEvent) => {
    e.preventDefault();
    postManual(route('admin.bulk-remittance.process'), {
      preserveScroll: true,
      onSuccess: () => {
        setRecipients([{
          name: '',
          email: '',
          account_number: '',
          bank_code: '',
          amount: '',
        }]);
      },
    });
  };

  const addRecipient = () => {
    setRecipients([...recipients, {
      name: '',
      email: '',
      account_number: '',
      bank_code: '',
      amount: '',
    }]);
  };

  const removeRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  return (
    <AdminLayout>
      <Head title="Bulk Remittance" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Link
                href={route('admin.transactions')}
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ChevronLeft size={20} />
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">Bulk Remittance</h1>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'upload'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Upload className="inline-block mr-2" size={16} />
                  Upload CSV
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'manual'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <PlusCircle className="inline-block mr-2" size={16} />
                  Add Manually
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'upload' ? (
                <form onSubmit={submitFileUpload}>
                  <div className="mb-6">
                    <InputLabel htmlFor="file" value="CSV File" />
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload
                          className="mx-auto h-12 w-12 text-gray-400"
                          strokeWidth={1}
                        />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".csv,.txt"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          CSV file with columns: Name, Account Number, Bank Code, Amount, Email (optional)
                        </p>
                      </div>
                    </div>
                    {data.file && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected file: {data.file.name}
                      </p>
                    )}
                    <InputError message={errors.file} className="mt-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <InputLabel htmlFor="currency" value="Currency" />
                      <Select
                        id="currency"
                        className="mt-1 block w-full"
                        value={data.currency}
                        onChange={(e) => setData('currency', e.target.value)}
                      >
                        {currencies.map((currency) => (
                          <option key={currency.id} value={currency.code}>
                            {currency.name} ({currency.code})
                          </option>
                        ))}
                      </Select>
                      <InputError message={errors.currency} className="mt-2" />
                    </div>

                    <div>
                      <div className="flex items-center">
                        <Checkbox
                          id="isScheduled"
                          checked={isScheduled}
                          onChange={(e) => setIsScheduled(e.target.checked)}
                        />
                        <InputLabel
                          htmlFor="isScheduled"
                          value="Schedule for later"
                          className="ml-2"
                        />
                      </div>
                    </div>
                  </div>

                  {isScheduled && (
                    <div className="border p-4 rounded-md bg-gray-50 mb-6">
                      <h3 className="text-lg font-medium mb-3">Schedule Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <InputLabel htmlFor="schedule_type" value="Schedule Type" />
                          <Select
                            id="schedule_type"
                            className="mt-1 block w-full"
                            value={data.schedule_type}
                            onChange={(e) => setData('schedule_type', e.target.value)}
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </Select>
                          <InputError message={errors.schedule_type} className="mt-2" />
                        </div>

                        <div>
                          <div className="flex items-center mt-7">
                            <Checkbox
                              id="is_recurring"
                              checked={isRecurring}
                              onChange={(e) => {
                                setIsRecurring(e.target.checked);
                                setData('is_recurring', e.target.checked);
                              }}
                            />
                            <InputLabel
                              htmlFor="is_recurring"
                              value="Recurring schedule"
                              className="ml-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <InputLabel htmlFor="notes" value="Notes (optional)" />
                        <TextInput
                          id="notes"
                          className="mt-1 block w-full"
                          value={data.notes}
                          onChange={(e) => setData('notes', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end mt-6">
                    <SecondaryButton
                      className="mr-3"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton disabled={processing || !data.file}>
                      {processing ? 'Processing...' : 'Process Bulk Remittance'}
                    </PrimaryButton>
                  </div>
                </form>
              ) : (
                <form onSubmit={submitManualForm}>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Recipients</h3>
                      <button
                        type="button"
                        onClick={addRecipient}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <PlusCircle className="mr-2" size={16} />
                        Add Recipient
                      </button>
                    </div>

                    {recipients.map((recipient, index) => (
                      <div key={index} className="border p-4 rounded-md mb-4 relative">
                        <button
                          type="button"
                          onClick={() => removeRecipient(index)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                          disabled={recipients.length === 1}
                        >
                          <X size={20} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <InputLabel htmlFor={`recipient-name-${index}`} value="Recipient Name" />
                            <TextInput
                              id={`recipient-name-${index}`}
                              className="mt-1 block w-full"
                              value={recipient.name}
                              onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                              required
                            />
                            <InputError message={manualErrors[`recipients.${index}.name`]} className="mt-2" />
                          </div>

                          <div>
                            <InputLabel htmlFor={`recipient-email-${index}`} value="Email (Optional)" />
                            <TextInput
                              id={`recipient-email-${index}`}
                              type="email"
                              className="mt-1 block w-full"
                              value={recipient.email}
                              onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <InputLabel htmlFor={`recipient-account-${index}`} value="Account Number" />
                            <TextInput
                              id={`recipient-account-${index}`}
                              className="mt-1 block w-full"
                              value={recipient.account_number}
                              onChange={(e) => updateRecipient(index, 'account_number', e.target.value)}
                              required
                            />
                            <InputError message={manualErrors[`recipients.${index}.account_number`]} className="mt-2" />
                          </div>

                          <div>
                            <InputLabel htmlFor={`recipient-bank-${index}`} value="Bank Code" />
                            <TextInput
                              id={`recipient-bank-${index}`}
                              className="mt-1 block w-full"
                              value={recipient.bank_code}
                              onChange={(e) => updateRecipient(index, 'bank_code', e.target.value)}
                              required
                            />
                            <InputError message={manualErrors[`recipients.${index}.bank_code`]} className="mt-2" />
                          </div>

                          <div>
                            <InputLabel htmlFor={`recipient-amount-${index}`} value="Amount" />
                            <TextInput
                              id={`recipient-amount-${index}`}
                              type="number"
                              step="0.01"
                              min="0.01"
                              className="mt-1 block w-full"
                              value={recipient.amount}
                              onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                              required
                            />
                            <InputError message={manualErrors[`recipients.${index}.amount`]} className="mt-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <InputLabel htmlFor="manual-currency" value="Currency" />
                      <Select
                        id="manual-currency"
                        className="mt-1 block w-full"
                        value={manualData.currency}
                        onChange={(e) => setManualData('currency', e.target.value)}
                      >
                        {currencies.map((currency) => (
                          <option key={currency.id} value={currency.code}>
                            {currency.name} ({currency.code})
                          </option>
                        ))}
                      </Select>
                      <InputError message={manualErrors.currency} className="mt-2" />
                    </div>

                    <div>
                      <div className="flex items-center">
                        <Checkbox
                          id="manual-isScheduled"
                          checked={isScheduled}
                          onChange={(e) => setIsScheduled(e.target.checked)}
                        />
                        <InputLabel
                          htmlFor="manual-isScheduled"
                          value="Schedule for later"
                          className="ml-2"
                        />
                      </div>
                    </div>
                  </div>

                  {isScheduled && (
                    <div className="border p-4 rounded-md bg-gray-50 mb-6">
                      <h3 className="text-lg font-medium mb-3">Schedule Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <InputLabel htmlFor="manual-schedule_type" value="Schedule Type" />
                          <Select
                            id="manual-schedule_type"
                            className="mt-1 block w-full"
                            value={manualData.schedule_type}
                            onChange={(e) => setManualData('schedule_type', e.target.value)}
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </Select>
                          <InputError message={manualErrors.schedule_type} className="mt-2" />
                        </div>

                        <div>
                          <div className="flex items-center mt-7">
                            <Checkbox
                              id="manual-is_recurring"
                              checked={isRecurring}
                              onChange={(e) => {
                                setIsRecurring(e.target.checked);
                                setManualData('is_recurring', e.target.checked);
                              }}
                            />
                            <InputLabel
                              htmlFor="manual-is_recurring"
                              value="Recurring schedule"
                              className="ml-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <InputLabel htmlFor="manual-notes" value="Notes (optional)" />
                        <TextInput
                          id="manual-notes"
                          className="mt-1 block w-full"
                          value={manualData.notes}
                          onChange={(e) => setManualData('notes', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end mt-6">
                    <SecondaryButton
                      className="mr-3"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton
                      disabled={processingManual || recipients.some(r => !r.name || !r.account_number || !r.bank_code || !r.amount)}
                    >
                      {processingManual ? 'Processing...' : 'Process Bulk Remittance'}
                    </PrimaryButton>
                  </div>
                </form>
              )}
            </div>
          </div>

          {recent_processes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Bulk Processes</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {recent_processes.map((process) => (
                    <li key={process.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {process.transaction_count} Transactions
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              process.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {process.is_active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              Schedule: {process.schedule_type}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Next execution: {process.next_execution}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
