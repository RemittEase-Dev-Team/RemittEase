import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

const CreateTeam: React.FC = () => {
  const { data, setData, post, errors } = useForm({
    name: '',
    role: '',
    image: '',
    short_desc: '',
    full_desc: '',
    socials: {
      twitter: '',
      github: '',
      linkedin: '',
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/teams');
  };

  return (
    <AdminLayout>
      <div className="p-6 flex">
        <div className="w-full pr-4 md:w-7/10 bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add New Team Member</h2>
          <a href="/admin/teams" className="flex items-center text-blue-500 mt-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Teams
          </a>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300">Role</label>
              <input
                type="text"
                value={data.role}
                onChange={(e) => setData('role', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              {errors.role && <div className="text-red-500 text-sm">{errors.role}</div>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300">Short Description</label>
              <textarea
                value={data.short_desc}
                onChange={(e) => setData('short_desc', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              {errors.short_desc && <div className="text-red-500 text-sm">{errors.short_desc}</div>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300">Full Description</label>
              <textarea
                value={data.full_desc}
                onChange={(e) => setData('full_desc', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              {errors.full_desc && <div className="text-red-500 text-sm">{errors.full_desc}</div>}
            </div>
            <div className="mb-4 flex space-x-4">
              <div className="flex items-center">
                <FaTwitter className="text-blue-500 mr-2" />
                <input
                  type="text"
                  value={data.socials.twitter}
                  onChange={(e) => setData('socials', { ...data.socials, twitter: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Twitter"
                />
              </div>
              <div className="flex items-center">
                <FaGithub className="text-gray-800 dark:text-gray-100 mr-2" />
                <input
                  type="text"
                  value={data.socials.github}
                  onChange={(e) => setData('socials', { ...data.socials, github: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="GitHub"
                />
              </div>
              <div className="flex items-center">
                <FaLinkedin className="text-blue-700 mr-2" />
                <input
                  type="text"
                  value={data.socials.linkedin}
                  onChange={(e) => setData('socials', { ...data.socials, linkedin: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="LinkedIn"
                />
              </div>
            </div>
            <div className="mt-4">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Create</button>
            </div>
          </form>
        </div>
        <div className="w-3/10 pl-4 bg-slate-500 dark:bg-gray-700 rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Upload Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div className="mt-4 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
            {imagePreview ? (
              <img src={imagePreview} alt="Image Preview" className="w-full h-32 object-cover rounded" />
            ) : (
              <span className="text-gray-500">Image Preview</span>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateTeam;
