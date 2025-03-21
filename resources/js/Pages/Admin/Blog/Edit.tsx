import React, { useState } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { FaChevronLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface Blog {
    title: string;
    content: string;
    image: string;
    image_url?: string; // Added to handle the full URL from storage
    tags: string;
    id: number;
}

const EditBlog = ({ blog }: { blog: Blog }) => {
    const { flash } = usePage().props as any;
    // Initialize form with empty image field
    const { data, setData, post, processing, errors } = useForm({
        title: blog.title || "",
        content: blog.content || "",
        image: "",
        tags: blog.tags || "",
        _method: "PUT", // For method spoofing
    });

    // Track if a new image has been selected
    const [newImageSelected, setNewImageSelected] = useState(false);

    // Store the current display image (either the original or the new preview)
    const [displayImage, setDisplayImage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(name as "title" | "content" | "tags", value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setData("image", result);
                setDisplayImage(result);
                setNewImageSelected(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use post with _method: PUT instead of put() directly
        post(route('admin.blogs.update', blog.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit Blog" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col md:flex-row">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Blog</h2>
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
                            <label className="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={data.title}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                            />
                            {errors.title && <div className="text-red-500 mt-1">{errors.title}</div>}
                        </div>

                        <div className="mb-4">
                            <label className="block mt-4 text-gray-700 dark:text-gray-300 mb-2">Content</label>
                            <textarea
                                name="content"
                                rows={5}
                                value={data.content}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                            ></textarea>
                            {errors.content && <div className="text-red-500 mt-1">{errors.content}</div>}
                        </div>

                        <div className="mb-4">
                            <label className="block mt-4 text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                            <input
                                type="text"
                                name="tags"
                                value={data.tags}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                            />
                            {errors.tags && <div className="text-red-500 mt-1">{errors.tags}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            {processing ? "Updating..." : "Update"}
                        </button>
                    </form>
                </div>
                <div className="w-full md:w-1/4 md:ml-6 mt-6 md:mt-10">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Image Upload</label>
                        <input
                            type="file"
                            name="imageFile" // Changed to imageFile to avoid conflict
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                        />
                        {errors.image && <div className="text-red-500 mt-1">{errors.image}</div>}

                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-4">Image Preview</h3>
                        {displayImage && (
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">New Image:</h4>
                                <img
                                    src={displayImage}
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded mt-2"
                                />
                            </div>
                        )}

                        <div className="mt-4">
                            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Current Image:</h4>
                            {blog.image_url ? (
                                <div className="relative">
                                    <img
                                        src={blog.image_url}
                                        alt="Current image"
                                        className="w-full h-40 object-cover rounded mt-2"
                                    />
                                    {newImageSelected && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <span className="text-white font-bold">Will be replaced</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">No current image</p>
                            )}
                        </div>

                        <div className="mt-4">
                            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Tags:</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {data.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded-full text-sm"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditBlog;
