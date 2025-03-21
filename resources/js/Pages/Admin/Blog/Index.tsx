import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import React, { useState } from "react";

interface BlogProps {
    blogs: Array<{
        id: number;
        title: string;
        author: string;
        image?: string;
        image_url?: string; // Added image_url property
        content: string; // Added content property
    }>;
}

const Blogs = ({ blogs }: BlogProps) => {
    const { delete: destroy } = useForm();
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setBlogToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (blogToDelete) {
            destroy(`/admin/blogs/${blogToDelete}`);
        }
        setShowDeleteModal(false);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBlogToDelete(null);
    };

    // Improved search functionality to include content and author
    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <Head title="Blog Management" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Blog Management</h2>
                <div className="flex justify-between items-center mb-4">
                    <Link
                        href="/admin/blogs/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
                    >
                        Create New Blog
                    </Link>
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {filteredBlogs.map((blog) => (
                            <div key={blog.id} className="border p-4 rounded-lg shadow-md dark:bg-gray-700">
                                <div className="mb-4">
                                    {blog.image_url && (
                                        <img
                                            src={blog.image_url}
                                            alt={blog.title}
                                            className="w-full h-48 object-cover rounded"
                                        />
                                    )}
                                </div>
                                <h3 className="text-lg dark:text-blue-700 font-bold mb-2">{blog.title}</h3>
                                <p className="mb-4 text-gray-600 dark:text-gray-300">
                                    {blog.content.substring(0, 100)}...
                                </p>
                                <div className="flex justify-end">
                                    <Link href={`/admin/blogs/${blog.id}/edit`} className="text-blue-500 hover:underline mr-4">
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteClick(blog.id)}
                                        className="text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">Are you sure you want to delete this blog? This action cannot be undone.</p>
                        <div className="flex justify-end">
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Blogs;