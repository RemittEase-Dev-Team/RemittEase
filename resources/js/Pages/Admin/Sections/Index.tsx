import { useState } from "react";
import { useForm } from '@inertiajs/react';
import AdminLayout from "@/Layouts/AdminLayout";

interface Section {
    id: number;
    name: string;
    content: any;
}

interface SectionsProps {
    sections: Section[];
}

const Sections: React.FC<SectionsProps> = ({ sections }) => {
    const [editingSection, setEditingSection] = useState<number | null>(null);
    const { data, setData, post } = useForm({
        content: ""
    });

    const handleEdit = (section: Section) => {
        setEditingSection(section.id);
        setData('content', JSON.stringify(section.content, null, 2));
    };

    const handleSubmit = (id: number) => {
        post(`/admin/sections/${id}/update`, {
            onSuccess: () => setEditingSection(null)
        });
    };

    return (
        <AdminLayout>
        <div className="p-6">
            <h2 className="text-xl font-bold">Manage Website Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section) => (
                    <div key={section.id} className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-semibold">{section.name}</h3>
                        {editingSection === section.id ? (
                            <>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    rows={5}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                />
                                <button onClick={() => handleSubmit(section.id)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                                    Save
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-600">{JSON.stringify(section.content)}</p>
                                <button onClick={() => handleEdit(section)} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">
                                    Edit
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
        </AdminLayout>
    );
};

export default Sections;
