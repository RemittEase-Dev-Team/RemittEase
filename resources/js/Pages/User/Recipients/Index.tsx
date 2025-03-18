import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Search, Edit, Trash, Eye } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipientToDelete, setRecipientToDelete] = useState<Recipient | null>(null);
  const { delete: destroy, processing } = useForm();

  const handleDeleteClick = (recipient: Recipient) => {
    setRecipientToDelete(recipient);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (recipientToDelete) {
      try {
        await destroy(route('recipients.destroy', { id: recipientToDelete.id }));
        setRecipients(recipients.filter(r => r.id !== recipientToDelete.id));
        setShowDeleteModal(false);
        setRecipientToDelete(null);
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
                            href={route('recipients.edit', { id: recipient.id })}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit size={18} />
                          </a>
                          <button
                            onClick={() => handleDeleteClick(recipient)}
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

      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Delete Recipient
          </h2>

          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this recipient? This action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 mr-3"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
              onClick={handleDeleteConfirm}
              disabled={processing}
            >
              Delete Recipient
            </button>
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
