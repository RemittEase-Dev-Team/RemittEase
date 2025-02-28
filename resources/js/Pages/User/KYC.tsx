import React from "react";
import { Head, useForm } from "@inertiajs/react";
import UserLayout from "@/Layouts/AuthenticatedLayout";

interface KYCProps {
    kyc_status: string;
    can_skip_kyc: boolean;
}

const KYC = ({ kyc_status, can_skip_kyc }: KYCProps) => {
    const { post, processing } = useForm();

    const handleStartKYC = () => {
        post(route("kyc.start"));
    };

    const handleSkipKYC = () => {
        post(route("kyc.skip"));
    };

    return (
        <UserLayout>
            <Head title="KYC Verification" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">KYC Verification</h2>

                {/* KYC Status Section */}
                {kyc_status === "verified" ? (
                    <p className="text-green-500">✅ Your KYC is verified. You can now send and receive remittances.</p>
                ) : kyc_status === "pending" ? (
                    <p className="text-yellow-500">⏳ Your KYC verification is pending. Please wait while it is processed.</p>
                ) : kyc_status === "rejected" ? (
                    <p className="text-red-500">❌ Your KYC verification was rejected. Please contact support.</p>
                ) : (
                    <div className="bg-yellow-200 p-4 rounded-lg text-yellow-800">
                        <p>⚠️ You have not completed KYC verification.</p>
                        <p>To access full remittance features, please verify your identity.</p>
                        <div className="flex gap-2 mt-4">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleStartKYC}
                                disabled={processing}
                            >
                                {processing ? "Starting..." : "Start KYC Verification"}
                            </button>
                            {can_skip_kyc && (
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    onClick={handleSkipKYC}
                                    disabled={processing}
                                >
                                    {processing ? "Skipping..." : "Skip for Now"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </UserLayout>
    );
};

export default KYC;
