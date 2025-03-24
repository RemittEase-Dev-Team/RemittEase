import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';

interface Team {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
  image_url?: string;
}

const TeamsIndex: React.FC = () => {
  // Alias 'delete' to 'destroy'
  const { data, post, delete: destroy } = useForm({});
  const { teams } = usePage<PageProps>().props;
  const [conf, setConf] = useState(false)
  const [selectedItem, setSelectedItem] = useState({
    id: 0,
    name: '',
  })

  return (
    <AdminLayout>
      <div className="p-6">
        {conf && (
          <section className='absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center '>
            <div className='w-[25rem] bg-white rounded-md p-4 text-center space-y-2'>
              <p>Are you sure you want to delete <span className='italic text-red-500 font-bold'>{selectedItem.name}?</span></p>
              <div className='flex items-center justify-between'>
                <a
                  onClick={() => setConf(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
                >
                  cancel
                </a>
                <a
                  onClick={() =>{destroy(route('admin.teams.destroy', selectedItem.id)), setConf(false)}}
                  className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
                >
                  Delete
                </a>
              </div>
            </div>
          </section>
        )}
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Manage Teams</h2>
        <div className="mt-4">
          <a href="/admin/teams/create" className="px-4 py-2 bg-green-500 text-white rounded">
            Add New Team Member
          </a>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: Team) => (
            <div key={team.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <img
                src={team.image_url || team.image}
                alt={team.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{team.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{team.role}</p>
                <div className="mt-4 flex space-x-2">
                  <a
                    href={`/admin/teams/${team.id}/edit`}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => {
                      setSelectedItem({ id: team.id, name: team.name });
                      setConf(true);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeamsIndex;
