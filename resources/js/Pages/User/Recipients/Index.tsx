import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Search, Edit, Trash, Eye } from 'lucide-react';
import { useState } from 'react';

interface Recipient {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  bank_name: string;
  account_number: string;
  swift_code: string;
}

interface Props {
  recipients: Recipient[];
}

export default function Recipients({ recipients: initialRecipients }: Props) {
  const [recipients, setRecipients] = useState(initialRecipients);
  const [search, setSearch] = useState('');
  const { data, setData, post: post } = useForm();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this recipient?')) {
      try {
        await post(route('recipients.destroy', id));
        setRecipients(recipients.filter(r => r.id !== id));
      } catch (error) {
        console.error('Failed to delete recipient:', error);
      }
    }
  };

  const handleShow = (id: number) => {
    window.location.href = route('recipients.show', { id });
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          Recipients
        </h2>
      }
    >
      <Head title="Recipients" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search recipients..."
                  className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <a
                href={route('recipients.create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus size={20} />
                Add Recipient
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {recipients.map((recipient) => (
                    <tr key={recipient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{recipient.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{recipient.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{recipient.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{recipient.bank_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">****{recipient.account_number.slice(-4)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <a
                            href={route('recipients.edit', recipient.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit size={18} />
                          </a>
                          <button
                            onClick={() => handleDelete(recipient.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash size={18} />
                          </button>
                          <button
                            onClick={() => handleShow(recipient.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
