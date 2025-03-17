import React from 'react';
import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function MoonPay() {
    return (
        <AuthenticatedLayout>
            <Head title="Buy Crypto with MoonPay" />
            <div className="container mx-auto text-center bg-gray-800 bg-opacity-50">
                <MoonPayProvider apiKey="pk_test_8v5c0U65vmujfNeSrA1b3hQSgTd9iE2" debug>
                    <MoonPayBuyWidget
                        variant="embedded"
                        baseCurrencyCode="usd"
                        baseCurrencyAmount="100"
                        defaultCurrencyCode="xlm"
                        visible={true}
                    />
                </MoonPayProvider>
            </div>
        </AuthenticatedLayout>
    );
}
