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

const Settings = ({ settings }: SettingsProps) => {
    const { data, setData, post, processing } = useForm(settings);
    const [loadingFields, setLoadingFields] = useState<string[]>([]);

    const updateSetting = (name: keyof typeof data, value: any) => {
        setData(name, value);
        setLoadingFields(prev => [...prev, name]);

        post("/admin/settings/update", {
            preserveScroll: true,
            onFinish: () => {
                setLoadingFields(prev => prev.filter(f => f !== name));
            },
        });
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
                                        'default_currency',
                                        'transaction_fee',
                                        'max_transaction_limit',
                                        'min_transaction_limit',
                                        'stellar_network',
                                        'maintenance_mode'
                                    ].map((key) => (
                                        <div key={key}>
                                            <label className="block text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                {key.replace(/_/g, " ")}
                                            </label>

                                            {key === 'maintenance_mode' ? (
                                                <Switch
                                                    checked={data[key]}
                                                    onChange={() => handleToggle(key)}
                                                    className={`${
                                                        data[key] ? 'bg-green-500' : 'bg-gray-400'
                                                    } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
                                                >
                                                    <span
                                                        className={`${
                                                            data[key] ? 'translate-x-6' : 'translate-x-1'
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

                                            {isLoading(key) && (
                                                <p className="text-xs text-blue-500 mt-1">Updating...</p>
                                            )}
                                        </div>
                                    ))}
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
                                                checked={data[key]}
                                                onChange={() => handleToggle(key)}
                                                className={`${
                                                    data[key] ? 'bg-green-500' : 'bg-gray-400'
                                                } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
                                            >
                                                <span
                                                    className={`${
                                                        data[key] ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                                                />
                                            </Switch>

                                            {isLoading(key) && (
                                                <p className="text-xs text-blue-500 mt-1">Updating...</p>
                                            )}
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
                                            {isLoading(key) && (
                                                <p className="text-xs text-blue-500 mt-1">Updating...</p>
                                            )}
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
                                            {isLoading(key) && (
                                                <p className="text-xs text-blue-500 mt-1">Updating...</p>
                                            )}
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
