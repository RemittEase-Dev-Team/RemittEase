import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Switch, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

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

// Available currencies including XLM
const AVAILABLE_CURRENCIES = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'NZD',
    'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'XLM', 'BTC', 'ETH', 'USDT', 'USDC'
];

// Available Stellar network versions
const STELLAR_NETWORKS = [
    'Public Network',
    'Test Network',
    'Future Network'
];

const Settings = ({ settings }: SettingsProps) => {
    const { data, setData, post, processing, errors } = useForm<any>(settings);
    const [loadingFields, setLoadingFields] = useState<string[]>([]);
    const [updateStatus, setUpdateStatus] = useState<{[key: string]: string}>({});

    const updateSetting = (name: keyof typeof data, value: any) => {
        // Update the form data
        setData(name, value);

        // Add to loading fields
        setLoadingFields((prev) => [...prev, name as string]);

        // Clear any previous status for this field
        setUpdateStatus((prev) => ({ ...prev, [name as string]: '' }));

        // Determine which section this setting belongs to
        let section = 'general';
        if (['contact_email', 'support_phone', 'support_email', 'terms_of_service_url', 'privacy_policy_url', 'site_url'].includes(name as string)) {
            section = 'contact';
        } else if (['api_key', 'api_secret', 'exchange_rate_api', 'kyc_verification_provider'].includes(name as string)) {
            section = 'api';
        } else if (['moonpay_enabled', 'linkio_enabled', 'yellowcard_enabled'].includes(name as string)) {
            section = 'payment_gateways';
        }

        // Send the update request
        post(route('admin.settings.update', { id: 1 }), {
            preserveScroll: true,
            onSuccess: () => {
                // Remove from loading fields
                setLoadingFields((prev) => prev.filter(field => field !== name));
                // Set success status
                setUpdateStatus((prev) => ({ ...prev, [name as string]: 'success' }));
            },
            onError: (errors) => {
                // Remove from loading fields
                setLoadingFields((prev) => prev.filter(field => field !== name));
                // Set error status
                setUpdateStatus((prev) => ({ ...prev, [name as string]: 'error' }));
            },
            onFinish: () => {
                // Clear status after 3 seconds
                setTimeout(() => {
                    setUpdateStatus((prev) => {
                        const newStatus = { ...prev };
                        delete newStatus[name as string];
                        return newStatus;
                    });
                }, 3000);
            }
        });

        // Update the form data with the section and value
        setData((prev: typeof data) => ({
            ...prev,
            section,
            [name]: value
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateSetting(name as keyof typeof data, value);
    };

    const handleToggle = (name: keyof typeof data) => {
        const newValue = !data[name];
        updateSetting(name, newValue);
    };

    const isLoading = (field: string) => loadingFields.includes(field);

    const getStatusIcon = (field: string) => {
        if (isLoading(field)) {
            return <span className="text-blue-500">Updating...</span>;
        }

        if (updateStatus[field] === 'success') {
            return <span className="text-green-500">Saved</span>;
        }

        if (updateStatus[field] === 'error') {
            return <span className="text-red-500">Failed to save</span>;
        }

        return null;
    };

    return (
        <AdminLayout>
            <Head title="Settings" />

            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Application Settings</h2>

                <TabGroup>
                    <TabList className="flex space-x-4 mb-6">
                        {["General", "Payment Gateways", "Security", "Support"].map((tab, idx) => (
                            <Tab
                                key={idx}
                                className={({ selected }) =>
                                    `px-4 py-2 rounded-lg text-sm font-medium ${
                                        selected
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    }`
                                }
                            >
                                {tab}
                            </Tab>
                        ))}
                    </TabList>

                    <TabPanels>
                        {/* GENERAL */}
                        <TabPanel>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        'app_name',
                                        'app_version',
                                        'currency',
                                        'transaction_fee',
                                        'max_transaction_limit',
                                        'min_transaction_limit',
                                        'maintenance_mode'
                                    ].map((key) => (
                                        <div key={key}>
                                            <label className="block text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                {key.replace(/_/g, " ")}
                                            </label>

                                            {key === 'maintenance_mode' ? (
                                                <Switch
                                                    checked={data[key] === true}
                                                    onChange={() => handleToggle(key)}
                                                    className={`${
                                                        data[key] === true ? 'bg-green-500' : 'bg-gray-400'
                                                    } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
                                                >
                                                    <span
                                                        className={`${
                                                            data[key] === true ? 'translate-x-6' : 'translate-x-1'
                                                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                                                    />
                                                </Switch>
                                            ) : (
                                                <input
                                                    type={typeof data[key] === "number" ? "number" : "text"}
                                                    name={key}
                                                    value={data[key] ?? ""}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                                                    disabled={isLoading(key)}
                                                />
                                            )}

                                            <div className="mt-1 text-xs">
                                                {getStatusIcon(key)}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Default Currency Dropdown */}
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-300 uppercase mb-1">
                                            Default Currency
                                        </label>
                                        <select
                                            name="default_currency"
                                            value={data.default_currency || ''}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                                            disabled={isLoading('default_currency')}
                                        >
                                            <option value="">Select Currency</option>
                                            {AVAILABLE_CURRENCIES.map((currency) => (
                                                <option key={currency} value={currency}>
                                                    {currency}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-1 text-xs">
                                            {getStatusIcon('default_currency')}
                                        </div>
                                    </div>

                                    {/* Stellar Network Dropdown */}
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-300 uppercase mb-1">
                                            Stellar Network
                                        </label>
                                        <select
                                            name="stellar_network"
                                            value={data.stellar_network || ''}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                                            disabled={isLoading('stellar_network')}
                                        >
                                            <option value="">Select Network</option>
                                            {STELLAR_NETWORKS.map((network) => (
                                                <option key={network} value={network}>
                                                    {network}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-1 text-xs">
                                            {getStatusIcon('stellar_network')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        {/* PAYMENT GATEWAYS */}
                        <TabPanel>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['moonpay_enabled', 'yellowcard_enabled', 'linkio_enabled'].map((key) => (
                                        <div key={key}>
                                            <label className="block text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                {key.replace(/_/g, " ")}
                                            </label>
                                            <Switch
                                                checked={data[key] === true}
                                                onChange={() => handleToggle(key)}
                                                className={`${
                                                    data[key] === true ? 'bg-green-500' : 'bg-gray-400'
                                                } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
                                            >
                                                <span
                                                    className={`${
                                                        data[key] === true ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                                                />
                                            </Switch>

                                            <div className="mt-1 text-xs">
                                                {getStatusIcon(key)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabPanel>

                        {/* SECURITY */}
                        <TabPanel>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['api_key', 'api_secret'].map((key) => (
                                        <div key={key}>
                                            <label className="block text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                {key.replace(/_/g, " ")}
                                            </label>
                                            <input
                                                type="password"
                                                name={key}
                                                value={data[key] ?? ""}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                                                disabled={isLoading(key)}
                                            />
                                            <div className="mt-1 text-xs">
                                                {getStatusIcon(key)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabPanel>

                        {/* SUPPORT */}
                        <TabPanel>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['contact_email', 'support_phone', 'support_email'].map((key) => (
                                        <div key={key}>
                                            <label className="block text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                {key.replace(/_/g, " ")}
                                            </label>
                                            <input
                                                type="email"
                                                name={key}
                                                value={data[key as keyof typeof data] ?? ""}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                                                disabled={isLoading(key)}
                                            />
                                            <div className="mt-1 text-xs">
                                                {getStatusIcon(key)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </AdminLayout>
    );
};

export default Settings;
