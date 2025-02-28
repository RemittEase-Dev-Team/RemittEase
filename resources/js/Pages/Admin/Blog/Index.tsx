import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

interface BlogProps {
    blogs: Array<{ id: number; title: string; author: string }>;
}

const Blogs = ({ blogs }: BlogProps) => {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this blog?")) {
            destroy(`/admin/blogs/delete/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Blog Management" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Blog Management</h2>
                <Link
                    href="/admin/blogs/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 inline-block"
                >
                    Create New Blog
                </Link>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200 dark:bg-gray-700">
                                <th className="p-2 text-left">Title</th>
                                <th className="p-2 text-left">Author</th>
                                <th className="p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((blog) => (
                                <tr key={blog.id} className="border-t dark:border-gray-600">
                                    <td className="p-2">{blog.title}</td>
                                    <td className="p-2">{blog.author}</td>
                                    <td className="p-2">
                                        <Link href={`/admin/blogs/${blog.id}/edit`} className="text-blue-500 hover:underline mr-4">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(blog.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Blogs;
