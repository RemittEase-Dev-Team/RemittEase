import React, { useState } from "react";
import { Head, useForm, Link, usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { FaChevronLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface RoadMap {
    id: number;
    quarter: string;
    details: string[];
}

const EditRoadmap = ({ roadmap }: { roadmap: RoadMap }) => {
    const { flash } = usePage().props as any;

    // Parse and clean the details array
    const parseDetails = (details: string[]): string[] => {
        if (!Array.isArray(details)) return [];

        return details.map((detail: string, index: number) => {
            // Remove array brackets from first and last items
            let cleanDetail = detail;
            if (index === 0) cleanDetail = cleanDetail.replace(/^\[/, '');
            if (index === details.length - 1) cleanDetail = cleanDetail.replace(/\]$/, '');

            // Parse Unicode escape sequences
            try {
                return JSON.parse(`"${cleanDetail.replace(/"/g, '\\"')}"`);
            } catch {
                return cleanDetail;
            }
        });
    };

    const { data, setData, post, processing, errors } = useForm({
        quarter: roadmap.quarter || "",
        details: parseDetails(roadmap.details),
        _method: "PUT",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(name as keyof typeof data, value);
    };

    const handleDetailChange = (index: number, value: string) => {
        const newDetails = [...data.details];
        newDetails[index] = value;
        setData("details", newDetails);
    };

    const handleAddDetail = () => {
        setData("details", [...data.details, ""]);
    };

    const handleRemoveDetail = (index: number) => {
        const newDetails = [...data.details];
        newDetails.splice(index, 1);
        setData("details", newDetails);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route(`admin.roadmap.update`, roadmap.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit Roadmap" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col md:flex-row">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Roadmap</h2>
                    <Link href="/admin/roadmaps" className="text-blue-500 hover:underline mb-4 inline-block flex items-center">
                        <FaChevronLeft className="mr-1" />
                        Back to RoadMaps
                    </Link>

                    {(flash?.success || flash?.error) && (
                        <div className={`mb-4 p-4 rounded-lg flex items-center ${flash?.success ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                            {flash?.success ? (
                                <FaCheckCircle className="mr-2 text-green-500 dark:text-green-300" />
                            ) : (
                                <FaExclamationCircle className="mr-2 text-red-500 dark:text-red-300" />
                            )}
                            <span>{flash?.success || flash?.error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quarter</label>
                            <input
                                type="text"
                                name="quarter"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                value={data.quarter}
                                onChange={handleChange}
                            />
                            {errors.quarter && <div className="text-red-500 text-sm mt-1">{errors.quarter}</div>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</label>
                            {data.details.map((detail: string, index: number) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
                                        value={detail}
                                        onChange={(e) => handleDetailChange(index, e.target.value)}
                                        placeholder="Enter detail"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveDetail(index)}
                                        className="ml-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddDetail}
                                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                                Add Detail
                            </button>
                            {errors.details && <div className="text-red-500 text-sm mt-1">{errors.details}</div>}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                disabled={processing}
                            >
                                {processing ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditRoadmap;
