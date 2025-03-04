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
                  onClick={() => destroy(route('admin.teams.destroy', selectedItem.id))}
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
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((team: Team) => (
            <div key={team.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <img src={team.image} alt={team.name} className="w-full h-32 object-cover rounded mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{team.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{team.role}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{team.description}</p>
              <div className="mt-2">
                <a
                  href={`/admin/teams/${team.id}/edit`}
                  className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                >
                  Edit
                </a>
                <a
                  onClick={() =>{setConf(true); setSelectedItem({
                    id: team.id,
                    name: team.name,
                
                
                  })}}
                  className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
                >
                  Delete
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeamsIndex;
