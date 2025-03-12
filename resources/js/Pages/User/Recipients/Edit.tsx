import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

interface Props {
    recipient: {
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
    };
}

export default function Edit({ recipient }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: recipient.name,
        email: recipient.email,
        phone: recipient.phone,
        country: recipient.country,
        bank_name: recipient.bank_name,
        account_number: recipient.account_number,
        routing_number: recipient.routing_number || '',
        swift_code: recipient.swift_code || '',
        address: recipient.address || '',
        city: recipient.city || '',
        state: recipient.state || '',
        postal_code: recipient.postal_code || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('recipients.update', recipient.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold">Edit Recipient</h2>}
        >
            <Head title="Edit Recipient" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Personal Information</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="name" value="Full Name" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="email" value="Email" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="phone" value="Phone Number" />
                                        <TextInput
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('phone', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Information */}
                            <div className="space-y-4 pt-6">
                                <h3 className="text-lg font-medium">Bank Information</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="bank_name" value="Bank Name" />
                                        <TextInput
                                            id="bank_name"
                                            type="text"
                                            value={data.bank_name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('bank_name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.bank_name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="account_number" value="Account Number" />
                                        <TextInput
                                            id="account_number"
                                            type="text"
                                            value={data.account_number}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.account_number} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="routing_number" value="Routing Number (Optional)" />
                                        <TextInput
                                            id="routing_number"
                                            type="text"
                                            value={data.routing_number || ''}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('routing_number', e.target.value)}
                                        />
                                        <InputError message={errors.routing_number} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="swift_code" value="SWIFT Code (Optional)" />
                                        <TextInput
                                            id="swift_code"
                                            type="text"
                                            value={data.swift_code || ''}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('swift_code', e.target.value)}
                                        />
                                        <InputError message={errors.swift_code} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="space-y-4 pt-6">
                                <h3 className="text-lg font-medium">Address Information</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="address" value="Address (Optional)" />
                                        <TextInput
                                            id="address"
                                            type="text"
                                            value={data.address || ''}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="city" value="City (Optional)" />
                                        <TextInput
                                            id="city"
                                            type="text"
                                            value={data.city || ''}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('city', e.target.value)}
                                        />
                                        <InputError message={errors.city} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="state" value="State (Optional)" />
                                        <TextInput
                                            id="state"
                                            type="text"
                                            value={data.state || ''}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('state', e.target.value)}
                                        />
                                        <InputError message={errors.state} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="postal_code" value="Postal Code (Optional)" />
                                        <TextInput
                                            id="postal_code"
                                            type="text"
                                            value={data.postal_code || ''}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                        />
                                        <InputError message={errors.postal_code} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end mt-6">
                                <PrimaryButton disabled={processing}>
                                    Update Recipient
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
