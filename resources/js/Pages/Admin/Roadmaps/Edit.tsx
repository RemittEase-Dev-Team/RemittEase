import React, { useState } from "react";
import { Head, useForm, Link, usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { FaChevronLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface RoadMap {
    id: number;
    quarter: string;
    details: string[];
    // message: string;
}

const EditRoadmap = ({ roadmap }: { roadmap: RoadMap }) => {
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        quarter: roadmap.quarter || "",
        details: roadmap.details || [],
        // message: roadmap.message || "",
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
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                            {data.details.map((detail: string, index: number) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                        value={detail}
                                        onChange={(e) => handleDetailChange(index, e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleRemoveDetail(index)} className="ml-2 px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddDetail} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">Add Detail</button>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded" disabled={processing}>
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
