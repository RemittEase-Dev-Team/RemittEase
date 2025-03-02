import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import UserLayout from "@/Layouts/AuthenticatedLayout";

interface KYCProps {
    kyc_status: string;
    can_skip_kyc: boolean;
}

const KYC = ({ kyc_status, can_skip_kyc }: KYCProps) => {
    const { data, setData, post, processing, errors } = useForm({
        profilePhoto: null as File | null,
        idType: "",
        idDocument: null as File | null,
        proofOfAddress: null as File | null,
        notes: "",
    });

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [idPreview, setIdPreview] = useState<string | null>(null);
    const [addressPreview, setAddressPreview] = useState<string | null>(null);

    const handleFileChange = (file: File, field: string) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (field === "profilePhoto") setProfilePreview(reader.result as string);
            if (field === "idDocument") setIdPreview(reader.result as string);
            if (field === "proofOfAddress") setAddressPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setData(field as any, file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("kyc.submit"));
    };

    const handleSkipKYC = () => {
        post(route("kyc.skip"));
    };

    if (kyc_status === "verified") {
        return (
            <UserLayout>
                <Head title="KYC Verification" />
                <div className="p-6 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg max-w-3xl mx-auto">
                    ✅ Your KYC verification is complete
                </div>
            </UserLayout>
        );
    }

    if (kyc_status === "pending") {
        return (
            <UserLayout>
                <Head title="KYC Verification" />
                <div className="p-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg max-w-3xl mx-auto">
                    ⏳ Your KYC submission is under review
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <Head title="KYC Verification" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Identity Verification</h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Complete your KYC verification to access all features
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                Profile Photo
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center justify-center gap-8">
                                {profilePreview ? (
                                    <img
                                        src={profilePreview}
                                        alt="Profile preview"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 border-4 border-dashed border-gray-300 dark:border-gray-600" />
                                )}
                                <FileUpload
                                    label="Upload Profile Photo"
                                    accept="image/*"
                                    onChange={(file) => handleFileChange(file, "profilePhoto")}
                                    error={errors.profilePhoto}
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        ID Type
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.idType}
                                        onChange={(e) => setData("idType", e.target.value)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    >
                                        <option value="">Select ID Type</option>
                                        <option value="passport">Passport</option>
                                        <option value="driver_license">Driver's License</option>
                                        <option value="national_id">National ID</option>
                                    </select>
                                    {errors.idType && (
                                        <p className="text-red-500 text-sm mt-1">{errors.idType}</p>
                                    )}
                                </div>

                                <div>
                                    <FileUpload
                                        label="Upload ID Document"
                                        accept="image/*,application/pdf"
                                        onChange={(file) => handleFileChange(file, "idDocument")}
                                        error={errors.idDocument}
                                        preview={idPreview}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <FileUpload
                                label="Proof of Address (Utility Bill, Bank Statement)"
                                accept="image/*,application/pdf"
                                onChange={(file) => handleFileChange(file, "proofOfAddress")}
                                error={errors.proofOfAddress}
                                preview={addressPreview}
                            />
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData("notes", e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                rows={4}
                                placeholder="Add any additional information..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                            {can_skip_kyc && (
                                <button
                                    type="button"
                                    onClick={handleSkipKYC}
                                    className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Skip for Now
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? "Submitting..." : "Submit Verification"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
};

const FileUpload = ({ label, accept, onChange, error, preview }: any) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onChange(e.dataTransfer.files[0]);
        }
    };

    return (
        <div>
            <label
                className={`block cursor-pointer ${
                    dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-colors hover:border-blue-500">
                    <div className="mb-2">
                        <svg
                            className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                            Click to upload
                        </span>{" "}
                        or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {accept.includes("pdf") ? "PDF, PNG, JPG (MAX. 10MB)" : "PNG, JPG (MAX. 5MB)"}
                    </p>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
                    />
                </div>
            </label>
            {preview && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Selected file: {preview instanceof File ? preview.name : "Uploaded file"}
                </div>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default KYC;