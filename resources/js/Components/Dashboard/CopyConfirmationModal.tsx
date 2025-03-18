import Modal from '@/Components/Modal';
import { CheckCircle } from 'lucide-react';

interface Props {
    show: boolean;
    onClose: () => void;
    address: string;
}

export default function CopyConfirmationModal({ show, onClose, address }: Props) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 text-center mb-4">
                    Wallet Address Copied!
                </h2>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                        {address}
                    </p>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
