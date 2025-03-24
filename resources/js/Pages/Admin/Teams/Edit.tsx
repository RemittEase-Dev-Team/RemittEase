import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { FaTwitter, FaGithub, FaLinkedin, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface Team {
  id: number;
  name: string;
  role: string;
  image: string;
  image_url?: string;
  short_desc: string;
  full_desc: string;
  socials: {
    twitter: string;
    github: string;
    linkedin: string;
  };
}

const EditTeam: React.FC = () => {
  const { team, flash } = usePage<PageProps>().props as unknown as { team: Team; flash: { success?: string; error?: string } };

  const { data, setData, post, processing, errors } = useForm({
    id: team.id,
    name: team.name,
    role: team.role,
    image: null as File | null,
    short_desc: team.short_desc,
    full_desc: team.full_desc,
    socials: {
      twitter: team.socials.twitter || '',
      github: team.socials.github || '',
      linkedin: team.socials.linkedin || '',
    }
  });

  const [imagePreview, setImagePreview] = useState<string>(team.image_url || team.image);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setData('image', file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.teams.update', team.id), {
      preserveScroll: true,
      onSuccess: () => {
        // Handle success
      },
      onError: () => {
        // Handle error
      },
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 flex">
        <div className="w-full pr-4 md:w-7/10 bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Team Member</h2>
          <a href="/admin/teams" className="flex items-center text-blue-500 mt-2">
            Back to Teams
          </a>

          {/* Notification Badge */}
          {(flash?.success || flash?.error) && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center ${
                flash?.success
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              }`}
            >
              {flash?.success ? (
                <FaCheckCircle className="mr-2 text-green-500 dark:text-green-300" />
              ) : (
                <FaExclamationCircle className="mr-2 text-red-500 dark:text-red-300" />
              )}
              <span>{flash?.success || flash?.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4" encType="multipart/form-data">
            <div className="mb-4">
              <label className="block">Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
            </div>

            <div className="mb-4">
              <label className="block">Role</label>
              <input
                type="text"
                value={data.role}
                onChange={(e) => setData('role', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              {errors.role && <div className="text-red-500 text-sm">{errors.role}</div>}
            </div>

            <div className="mb-4">
              <label className="block">Short Description</label>
              <textarea
                value={data.short_desc}
                onChange={(e) => setData('short_desc', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              {errors.short_desc && <div className="text-red-500 text-sm">{errors.short_desc}</div>}
            </div>

            <div className="mb-4">
              <label className="block">Full Description</label>
              <textarea
                value={data.full_desc}
                onChange={(e) => setData('full_desc', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              {errors.full_desc && <div className="text-red-500 text-sm">{errors.full_desc}</div>}
            </div>

            <div className="mb-4">
              <label className="block">Social Media Links</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <FaTwitter className="mr-2" />
                  <input
                    type="text"
                    value={data.socials.twitter}
                    onChange={(e) =>
                      setData('socials', { ...data.socials, twitter: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded"
                    placeholder="Twitter URL"
                  />
                </div>
                <div className="flex items-center">
                  <FaGithub className="mr-2" />
                  <input
                    type="text"
                    value={data.socials.github}
                    onChange={(e) =>
                      setData('socials', { ...data.socials, github: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded"
                    placeholder="GitHub URL"
                  />
                </div>
                <div className="flex items-center">
                  <FaLinkedin className="mr-2" />
                  <input
                    type="text"
                    value={data.socials.linkedin}
                    onChange={(e) =>
                      setData('socials', { ...data.socials, linkedin: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded"
                    placeholder="LinkedIn URL"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block">Profile Image</label>
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border rounded"
                accept="image/*"
              />
              {errors.image && <div className="text-red-500 text-sm">{errors.image}</div>}
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {processing ? 'Updating...' : 'Update Team Member'}
              </button>
            </div>
          </form>
        </div>

        <div className="w-3/10 pl-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Image Preview</h3>
            <div className="aspect-w-1 aspect-h-1">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Team member preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image selected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditTeam;
