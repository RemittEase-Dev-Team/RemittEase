import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const CreateRoadmap: React.FC = () => {
  const [quarter, setQuarter] = useState('');
  const [details, setDetails] = useState<string[]>(['']);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddDetail = () => {
    setDetails([...details, '']);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index] = value;
    setDetails(newDetails);
  };

  const handleSubmit = () => {
    const formData = {
      quarter,
      details: JSON.stringify(details)
    };

    router.post('/admin/roadmaps', formData, {
      onSuccess: () => {
        setMessage('Roadmap entry created successfully.');
        router.visit('/admin/roadmaps');
      },
      onError: () => {
        setMessage('Failed to create roadmap entry.');
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-start items-start p-6 dark:bg-gray-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Create Roadmap</h2>
          {message && <div className="mb-4 text-green-500 dark:text-green-400">{message}</div>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quarter</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
            {details.map((detail, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  value={detail}
                  onChange={(e) => handleDetailChange(index, e.target.value)}
                />
                <button onClick={() => handleRemoveDetail(index)} className="ml-2 px-2 py-1 bg-red-500 text-white rounded dark:bg-red-600">Remove</button>
              </div>
            ))}
            <button onClick={handleAddDetail} className="mt-2 px-4 py-2 bg-green-500 text-white rounded dark:bg-green-600">Add Detail</button>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded dark:bg-blue-600">Save</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateRoadmap;
