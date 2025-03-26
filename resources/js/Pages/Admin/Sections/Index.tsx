import { useState } from "react";
import { useForm } from '@inertiajs/react';
import AdminLayout from "@/Layouts/AdminLayout";
import EditSectionModal from '@/Components/EditSectionModal';
import { Pencil } from "lucide-react";

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

    const SectionCard = ({ children, title, onEdit, onEdit2 }: { children: React.ReactNode; title: string; onEdit: () => void; onEdit2: string }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 group">
            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                    <a href={onEdit2} >
                    <button
                        onClick={onEdit}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-green-600 flex items-center gap-1"
                    >
                        <Pencil className="w-5 h-5" />
                        <span className="text-sm">Edit</span>
                    </button>
                    </a>
                </div>
                <div className="space-y-4 flex-1">
                    {children}
                </div>
            </div>
        </div>
    );

    const FieldRow = ({ label, value }: { label: string; value: string }) => (
        <div className="grid gap-4 py-2">
            <dt className="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="col-span-2 text-sm text-gray-900 dark:text-gray-200 break-words">{value || '-'}</dd>
        </div>
    );

    return (
        <AdminLayout>
            <div className="p-6 space-y-8">
                <header>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Website Sections Manager</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Manage content for different sections of your website</p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <SectionCard title="Hero Section" onEdit={()=>{}} onEdit2={'/admin/section/edit_home'}>
                        {heroes.map((hero, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <FieldRow label="Title" value={hero.title} />
                                <FieldRow label="Subtitle" value={hero.subtitle} />
                                <FieldRow label="CTA" value={hero.cta} />
                            </div>
                        ))}
                    </SectionCard>

                    <SectionCard title="Features" onEdit={() => {}} onEdit2={'/admin/section/edit_features'}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <FieldRow label="Title" value={feature.title} />
                                    <FieldRow label="Description" value={feature.description} />
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="About Section" onEdit={() => handleEdit('Abouts', abouts)} onEdit2={''}>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Abouts</h3>
                            {abouts.map((about, index) => {
                                const coreValues = typeof about.core_values === 'string'
                                    ? JSON.parse(about.core_values)
                                    : about.core_values;

                                return (
                                    <div key={index} className="mt-4 space-y-3">
                                        <FieldRow label="Mission" value={about.mission} />
                                        <FieldRow label="Vision" value={about.vision} />
                                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                Core Values
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {coreValues?.map((value: any, cvIndex: number) => (
                                                    <div
                                                        key={cvIndex}
                                                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                                                    >
                                                        <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                            {value.title}
                                                        </h5>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {value.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <button
                                onClick={() => handleEdit('Abouts', abouts)}
                                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Edit
                            </button>
                        </div>
                    </SectionCard>

                    <SectionCard title="Quest Rewards" onEdit={() => handleEdit('Quest Rewards', questRewards)} onEdit2={''}>
                        <div className="grid grid-cols-1 gap-4">
                            {questRewards.map((questReward, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FieldRow label="Title" value={questReward.title} />
                                        <FieldRow label="Progress" value={questReward.progress} />
                                        <FieldRow label="Description" value={questReward.description} />
                                        <FieldRow label="Reward Points" value={questReward.reward_points} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                {editingSection && <EditSectionModal section={editingSection} onClose={() => setEditingSection(null)} />}
            </div>
        </AdminLayout>
    );
};

export default Sections;