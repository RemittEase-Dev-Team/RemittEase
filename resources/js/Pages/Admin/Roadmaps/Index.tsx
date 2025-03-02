import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';

interface Roadmap {
  id: number;
  quarter: string;
  details: string | string[];
}

const RoadmapsIndex: React.FC = () => {
  const { roadmaps } = usePage<PageProps>().props;
  console.log('Roadmaps', roadmaps);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [deletingRoadmap, setDeletingRoadmap] = useState<Roadmap | null>(null);

  const handleEdit = (roadmap: Roadmap) => {
    setEditingRoadmap({
      ...roadmap,
      details: parseDetails(roadmap.details)
    });
  };

  const handleAddDetail = () => {
    if (editingRoadmap) {
      setEditingRoadmap({
        ...editingRoadmap,
        details: [...parseDetails(editingRoadmap.details), '']
      });
    }
  };

  const handleRemoveDetail = (index: number) => {
    if (editingRoadmap) {
      const newDetails = parseDetails(editingRoadmap.details).filter((_, i) => i !== index);
      setEditingRoadmap({
        ...editingRoadmap,
        details: newDetails
      });
    }
  };

  const handleDetailChange = (index: number, value: string) => {
    if (editingRoadmap) {
      const newDetails = [...parseDetails(editingRoadmap.details)];
      newDetails[index] = value;
      setEditingRoadmap({
        ...editingRoadmap,
        details: newDetails
      });
    }
  };

  const parseDetails = (details: string | string[]): string[] => {
    if (Array.isArray(details)) {
      return details;
    }
    try {
      return JSON.parse(details);
    } catch {
      return [];
    }
  };

  const handleSave = () => {
    if (editingRoadmap) {
      const formData = {
        id: editingRoadmap.id,
        quarter: editingRoadmap.quarter,
        details: Array.isArray(editingRoadmap.details)
          ? JSON.stringify(editingRoadmap.details)
          : editingRoadmap.details
      };

      router.post(`/admin/roadmaps/${editingRoadmap.id}`, {
        _method: 'PUT',
        ...formData
      });

      setEditingRoadmap(null);
    }
  };

  const handleDelete = (roadmapId: number) => {
    router.delete(`/admin/roadmaps/${roadmapId}`, {
      onSuccess: () => {
        // Optionally, you can add logic here to update the UI after deletion
      }
    });
    setDeletingRoadmap(null);
  };

  return (
    <AdminLayout>
      <div className="p-6 dark:bg-gray-900">
        <h2 className="text-xl font-bold dark:text-white">Manage Roadmaps</h2>
        <div className="mt-4">
          <a href="/admin/roadmaps/create" className="px-4 py-2 bg-green-500 text-white rounded">Add New Roadmap</a>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmaps.map((roadmap: Roadmap) => (
            <div key={roadmap.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">{roadmap.quarter}</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 bg-slate-100 dark:bg-gray-700 p-4 rounded-md">
                {parseDetails(roadmap.details).map((detail: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-300">{detail}</li>
                ))}
              </ul>
              <div className="mt-4">
                <button onClick={() => handleEdit(roadmap)} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Edit</button>
                <button onClick={() => setDeletingRoadmap(roadmap)} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {editingRoadmap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Roadmap</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quarter</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
                  value={editingRoadmap.quarter}
                  onChange={(e) => setEditingRoadmap({ ...editingRoadmap, quarter: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                {Array.isArray(editingRoadmap.details) ?
                  editingRoadmap.details.map((detail: string, index: number) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={detail}
                        onChange={(e) => handleDetailChange(index, e.target.value)}
                      />
                      <button onClick={() => handleRemoveDetail(index)} className="ml-2 px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                    </div>
                  )) :
                  parseDetails(editingRoadmap.details).map((detail: string, index: number) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={detail}
                        onChange={(e) => handleDetailChange(index, e.target.value)}
                      />
                      <button onClick={() => handleRemoveDetail(index)} className="ml-2 px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                    </div>
                  ))
                }
                <button onClick={handleAddDetail} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">Add Detail</button>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setEditingRoadmap(null)} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        )}

        {deletingRoadmap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Delete Roadmap</h2>
              <p className="dark:text-gray-300">Are you sure you want to delete the roadmap for {deletingRoadmap.quarter}?</p>
              <div className="flex justify-end mt-4">
                <button onClick={() => setDeletingRoadmap(null)} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">Cancel</button>
                <button onClick={() => handleDelete(deletingRoadmap.id)} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RoadmapsIndex;
