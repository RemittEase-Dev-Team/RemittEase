import React, { useState, useEffect } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { FaChevronLeft } from 'react-icons/fa';

interface Blog {
    title: string;
    content: string;
    image: string;
    tags: string;
    id: number;
}

const EditBlog = ({ blog }: { blog: Blog }) => {
    const { data, setData, post, processing } = useForm({
        title: blog.title || "",
        content: blog.content || "",
        image: blog.image || "",
        tags: blog.tags || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(name as "title" | "content" | "image" | "tags", value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData("image", reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/blogs/${blog.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Edit Blog" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen flex">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Blog</h2>
                    <Link href="/admin/blogs" className="text-blue-500 hover:underline mb-4 inline-block flex items-center">
                        <FaChevronLeft className="mr-1" />
                        Back to Blogs
                    </Link>
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <label className="block text-gray-700 dark:text-gray-300">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={data.title}
                            onChange={handleChange}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                        />

                        <label className="block mt-4 text-gray-700 dark:text-gray-300">Content</label>
                        <textarea
                            name="content"
                            rows={5}
                            value={data.content}
                            onChange={handleChange}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                        ></textarea>

                       

                        <label className="block mt-4 text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={data.tags}
                            onChange={handleChange}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                        />

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            {processing ? "Updating..." : "Update"}
                        </button>
                    </form>
                </div>
                <div className="w-1/4 ml-6 mt-10">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <label className="block mt-4 text-gray-700 dark:text-gray-300">Image Upload</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                        />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Preview</h3>
                        {data.image && (
                            <img src={data.image} alt="Preview" className="w-full h-40 object-cover rounded mt-2" />
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

export default EditBlog;
