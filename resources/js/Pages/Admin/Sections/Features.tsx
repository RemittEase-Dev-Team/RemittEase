import React from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Hero {
  [key: string]: string | number | undefined;
  id?: number;
  title: string;
  subtitle: string;
  cta: string;
}

interface PageProps {
  features: {
    name: string;
    content: Hero[];
  };
}

const FeaturePage: React.FC<PageProps> = ({ features }) => {
  const initialData =
    Array.isArray(features) && features.length > 0
      ? features
      : [{ title: '', subtitle: '', cta: '' }];

  const { data, setData, submit } = useForm({
    name: features.name,
    content: initialData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit('put', '/admin/features/update', {
      preserveScroll: true,
    });
  };

  const updateField = (index: number, field: keyof Hero, value: string) => {
    const newContent = [...data.content];
    if (newContent[index]) {
      newContent[index][field] = value;
      setData('content', newContent);
    }
  };

  // console.log(features)

  return (
    <AdminLayout>
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Edit Features Page</h1>
        <section className='w-full flex justify-center'>
      <form onSubmit={handleSubmit} className='w-[70rem]'>
        {data.content?.map((item, index) => {
          if (!item) return null;
          return (
            <div key={index} className="mb-6 p-4 border rounded shadow-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  className="w-full p-2 rounded"
                  value={item.title || ''}
                  onChange={(e) => updateField(index, 'title', e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium ">Description</label>
                <textarea
                rows={5}
                  className="w-full p-2 rounded"
                  value={item.description || ''}
                  onChange={(e) => updateField(index, 'description', e.target.value)}
                />
              </div>
            </div>
          );
        })}
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

export default FeaturePage;
