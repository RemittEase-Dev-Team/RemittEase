import React from 'react';
import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';

interface Team {
  id: number;
  name: string;
  role: string;
  description: string;
}

const TeamsIndex: React.FC = () => {
  const { teams } = usePage<PageProps>().props;

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-xl font-bold">Manage Teams</h2>
        <div className="mt-4">
          <a href="/admin/teams/create" className="px-4 py-2 bg-green-500 text-white rounded">Add New Team Member</a>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team: Team) => (
            <div key={team.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{team.name}</h3>
              <p className="text-sm text-gray-600">{team.role}</p>
              <p className="text-sm text-gray-600">{team.description}</p>
              <div className="mt-2">
                <a href={`/admin/teams/${team.id}/edit`} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Edit</a>
                <a href={`/admin/teams/${team.id}/delete`} className="px-4 py-2 bg-red-500 text-white rounded">Delete</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeamsIndex;
