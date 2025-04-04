import React from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface CoreValue {
  title: string;
  description: string;
}

interface AboutData {
  id?: number;
  core_values: string; 
  mission: string;
  vision: string;
  sub_1_fees: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
}

interface AboutPageProps {
  about: AboutData[];
}

interface FormData {
  id?: number;
  name: string;
  coreValues: CoreValue[];
  mission: string;
  vision: string;
  sub_1_fees: string;
}

const AboutPage: React.FC<AboutPageProps> = ({ about }) => {
  const aboutData = about.length > 0 ? about[0] : {} as AboutData;

  const coreValuesParsed: CoreValue[] = aboutData.core_values
    ? JSON.parse(aboutData.core_values)
    : [];

  const { data, setData, submit, transform } = useForm<FormData|any>({
    id: aboutData.id,
    name: aboutData.name || '',
    coreValues: coreValuesParsed,
    mission: aboutData.mission || '',
    vision: aboutData.vision || '',
    sub_1_fees: aboutData.sub_1_fees || '',
  });

  transform((data) => ({
    content: [
      {
        id: data.id,
        mission: data.mission,
        vision: data.vision,
        core_values: JSON.stringify(data.coreValues),
        sub_1_fees: data.sub_1_fees,
      },
    ],
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit('put', '/admin/abouts/update', {
      preserveScroll: true,
    });
  };

  const updateField = (index: number, field: keyof CoreValue, value: string) => {
    const newCoreValues = [...data.coreValues];
    if (newCoreValues[index]) {
      newCoreValues[index][field] = value;
      setData('coreValues', newCoreValues);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Edit About Page</h1>
        <section className="w-full flex justify-center">
          <form onSubmit={handleSubmit} className="w-[70rem]">
            <div className="mb-6">
              <label className="block text-sm font-medium">Mission</label>
              <textarea
                rows={3}
                className="w-full p-2 rounded"
                value={data.mission}
                onChange={(e) => setData('mission', e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium">Vision</label>
              <textarea
                rows={3}
                className="w-full p-2 rounded"
                value={data.vision}
                onChange={(e) => setData('vision', e.target.value)}
              />
            </div>
            {data.coreValues?.map((item: CoreValue, index: number) => (
              <div key={index} className="mb-6 p-4 border rounded shadow-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium">Core Value Title</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded"
                    value={item.title || ''}
                    onChange={(e) => updateField(index, 'title', e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Core Value Description</label>
                  <textarea
                    rows={5}
                    className="w-full p-2 rounded"
                    value={item.description || ''}
                    onChange={(e) => updateField(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AboutPage;
