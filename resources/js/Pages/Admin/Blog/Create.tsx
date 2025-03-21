import React, { useState } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { FaChevronLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const CreateBlog = () => {
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        content: "",
        tags: "",
        image: null as File | null,
    });

    const [previewImage, setPreviewImage] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(name as any, value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.blogs.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Blog" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen flex">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Create New Blog</h2>
                    <Link href="/admin/blogs" className="text-blue-500 hover:underline mb-4 inline-block flex items-center">
                        <FaChevronLeft className="mr-1" />
                        Back to Blogs
                    </Link>

                    {/* Notification Badge */}
                    {(flash?.success || flash?.error) && (
                        <div
                            className={`mb-4 p-4 rounded-lg flex items-center ${
                                flash?.success
                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}
                        >
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
                            <label className="block text-gray-700 dark:text-gray-300">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={data.title}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                            />
                            {errors.title && (
                                <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block mt-4 text-gray-700 dark:text-gray-300">Content</label>
                            <textarea
                                name="content"
                                rows={5}
                                value={data.content}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                            ></textarea>
                            {errors.content && (
                                <div className="text-red-500 text-sm mt-1">{errors.content}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block mt-4 text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                            <input
                                type="text"
                                name="tags"
                                value={data.tags}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                            />
                            {errors.tags && (
                                <div className="text-red-500 text-sm mt-1">{errors.tags}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? "Publishing..." : "Publish"}
                        </button>
                    </form>
                </div>
                <div className="w-1/4 ml-6 mt-10">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <div className="mb-4">
                            <label className="block mt-4 text-gray-700 dark:text-gray-300">Image Upload</label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                            />
                            {errors.image && (
                                <div className="text-red-500 text-sm mt-1">{errors.image}</div>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Preview</h3>
                        {previewImage && (
                            <img src={previewImage} alt="Preview" className="w-full h-40 object-cover rounded mt-2" />
                        )}
                        <div className="mt-2">
                            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Tags:</h4>
                            <p className="text-gray-600 dark:text-gray-400">{data.tags}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CreateBlog;
