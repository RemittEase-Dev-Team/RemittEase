import { useState } from "react";
import { useForm } from '@inertiajs/react';
import AdminLayout from "@/Layouts/AdminLayout";
import EditSectionModal from '@/Components/EditSectionModal';

interface SectionsProps {
    heroes: any[];
    features: any[];
    abouts: any[];
    questRewards: any[];
}

const Sections: React.FC<SectionsProps> = ({ heroes, features, abouts, questRewards }) => {
    const [editingSection, setEditingSection] = useState<{ name: string; content: any } | null>(null);

    const handleEdit = (name: string, content: any) => {
        setEditingSection({ name, content });
    };

    // console.log('about', abouts);
    // console.log('features', features);
    // console.log('questRewards', questRewards);
    // console.log('heroes', heroes);

    return (
        <AdminLayout>
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Manage Website Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Heroes</h3>
                    <button onClick={() => handleEdit('Heroes', heroes)} className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Edit
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Features</h3>
                    <button onClick={() => handleEdit('Features', features)} className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Edit
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Abouts</h3>
                    <button onClick={() => handleEdit('Abouts', abouts)} className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Edit
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Quest Rewards</h3>
                    <button onClick={() => handleEdit('Quest Rewards', questRewards)} className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Edit
                    </button>
                </div>
            </div>
            {editingSection && <EditSectionModal section={editingSection} onClose={() => setEditingSection(null)} />}
        </div>
        </AdminLayout>
    );
};

export default Sections;
