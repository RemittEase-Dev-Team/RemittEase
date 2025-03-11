import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Switch } from '@headlessui/react';

interface SettingsProps {
    settings: {
        app_name: string;
        app_version: string;
        currency: string;
        default_currency: string;
        transaction_fee: number;
        max_transaction_limit: number;
        min_transaction_limit: number;
        supported_currencies: string[];
        stellar_network: string;
        api_key: string;
        api_secret: string;
        maintenance_mode: boolean;
        contact_email: string;
        support_phone: string;
        terms_of_service_url: string;
        privacy_policy_url: string;
        site_url: string;
        exchange_rate_api: string;
        support_email: string;
        kyc_verification_provider: string;
        moonpay_enabled: boolean;
        yellowcard_enabled: boolean;
        linkio_enabled: boolean;
    };
}

const Settings = ({ settings }: SettingsProps) => {
    const { data, setData, post, processing } = useForm(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name in data) {
            setData(name as keyof typeof data, value);
        }
    };

    const handleToggleChange = (name: keyof typeof data) => {
        setData(name, !data[name]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/admin/settings/update");
    };

    return (
        <AdminLayout>
            <Head title="Settings" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Application Settings</h2>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.keys(settings).map((key) => (
                            <div key={key}>
                                <label className="block text-gray-700 dark:text-gray-300 uppercase">{key.replace(/_/g, " ")}</label>
                                {key === 'maintenance_mode' || key === 'moonpay_enabled' || key === 'yellowcard_enabled' || key === 'linkio_enabled' ? (
                                    <Switch
                                        checked={data[key]}
                                        onChange={() => handleToggleChange(key)}
                                        className="relative inline-flex flex-shrink-0"
                                    >
                                        <span className="sr-only">Enable {key.replace(/_/g, " ")}</span>
                                        <span className="translate-x-0 inline-block bg-gray-600 rounded-full w-14 h-8 transition-transform duration-200 ease-in-out"></span>
                                    </Switch>
                                ) : (
                                    <input
                                        type="text"
                                        name={key}
                                        value={String(data[key as keyof typeof settings])}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {processing ? "Saving..." : "Save Settings"}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default Settings;
