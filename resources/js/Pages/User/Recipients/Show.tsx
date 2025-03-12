import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash, Copy, CheckCircle, XCircle } from 'lucide-react';

interface Recipient {
    id: number;
    name: string;
    email: string;
    phone: string;
    country: string;
    bank_name: string;
    account_number: string;
    routing_number?: string | null;
    swift_code?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    is_verified: boolean;
    created_at: string;
}

interface Props {
    recipient: Recipient;
}

export default function Show({ recipient }: Props) {
    const InfoRow = ({ label, value, isSensitive = false }: {
        label: string;
        value?: string | null;
        isSensitive?: boolean;
    }) => (
        value ? (
            <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="mt-1 flex justify-between items-center">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                        {isSensitive ? '••••' + value.slice(-4) : value}
                    </span>
                    {isSensitive && (
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(value);
                                alert('Copied to clipboard!');
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                            <Copy size={16} />
                        </button>
                    )}
                </dd>
            </div>
        ) : null
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Recipient Details
                    </h2>
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('recipients.edit', { id: recipient.id })}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <Edit size={16} className="mr-2" />
                            Edit
                        </Link>
                        <Link
                            href={route('recipients.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Recipient - ${recipient.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Verification Status Banner */}
                        <div className={`px-4 py-3 border-l-4 ${
                            recipient.is_verified
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        }`}>
                            <div className="flex items-center">
                                {recipient.is_verified ? (
                                    <CheckCircle className="text-green-500" size={20} />
                                ) : (
                                    <XCircle className="text-yellow-500" size={20} />
                                )}
                                <p className={`ml-3 text-sm ${
                                    recipient.is_verified
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-yellow-700 dark:text-yellow-300'
                                }`}>
                                    {recipient.is_verified
                                        ? 'This recipient has been verified'
                                        : 'This recipient is pending verification'}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Personal Information */}
                            <section>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    Personal Information
                                </h3>
                                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <InfoRow label="Full Name" value={recipient.name} />
                                    <InfoRow label="Email" value={recipient.email} />
                                    <InfoRow label="Phone" value={recipient.phone} />
                                    <InfoRow label="Country" value={recipient.country} />
                                </dl>
                            </section>

                            {/* Bank Information */}
                            <section>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    Bank Information
                                </h3>
                                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <InfoRow label="Bank Name" value={recipient.bank_name} />
                                    <InfoRow label="Account Number" value={recipient.account_number} isSensitive={true} />
                                    <InfoRow label="Routing Number" value={recipient.routing_number} isSensitive={true} />
                                    <InfoRow label="SWIFT Code" value={recipient.swift_code} isSensitive={true} />
                                </dl>
                            </section>

                            {/* Address Information */}
                            <section>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    Address Information
                                </h3>
                                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <InfoRow label="Address" value={recipient.address} />
                                    <InfoRow label="City" value={recipient.city} />
                                    <InfoRow label="State" value={recipient.state} />
                                    <InfoRow label="Postal Code" value={recipient.postal_code} />
                                </dl>
                            </section>

                            {/* Additional Information */}
                            <section>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    Additional Information
                                </h3>
                                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <InfoRow label="Created At" value={new Date(recipient.created_at).toLocaleDateString()} />
                                </dl>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
