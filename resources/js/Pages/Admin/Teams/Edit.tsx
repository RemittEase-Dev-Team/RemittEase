import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

interface Team {
  id: number;
  name: string;
  role: string;
  image: string;
  short_desc: string;
  full_desc: string;
  socials: {
    twitter: string;
    github: string;
    linkedin: string;
  };
}
const EditTeam: React.FC = () => {
  const { team } = usePage<PageProps>().props as unknown as { team: Team };

  // Important: store 'null' for image, but keep existing image path for preview
  const { data, setData, patch: update, processing, errors } = useForm({
    id: team.id,
    name: team.name,
    role: team.role,
    // We'll set the image to null so that we only update it if user chooses a new file
    image: null as File | null,
    short_desc: team.short_desc,
    full_desc: team.full_desc,
    socials: {
      twitter: team.socials.twitter,
      github: team.socials.github,
      linkedin: team.socials.linkedin,
    },
  });

  // For preview only
  const [imagePreview, setImagePreview] = useState<string>(team.image);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setData('image', file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update(route(`admin.teams.update`, team.id));
  };

  return (
    <AdminLayout>
      <div className="p-6 flex">
        <div className="w-full pr-4 md:w-7/10 bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Team Member</h2>
          <a href="/admin/teams" className="flex items-center text-blue-500 mt-2">
            {/* ...back link... */}
            Back to Teams
          </a>

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

            {/* ...Short desc, Full desc, socials... */}
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

            <div className="mb-4 flex space-x-4">
              {/* Twitter */}
              <div className="flex items-center">
                <FaTwitter className="mr-2" />
                <input
                  type="text"
                  value={data.socials.twitter}
                  onChange={(e) =>
                    setData('socials', { ...data.socials, twitter: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Twitter"
                />
              </div>
              {/* GitHub */}
              <div className="flex items-center">
                <FaGithub className="mr-2" />
                <input
                  type="text"
                  value={data.socials.github}
                  onChange={(e) =>
                    setData('socials', { ...data.socials, github: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded"
                  placeholder="GitHub"
                />
              </div>
              {/* LinkedIn */}
              <div className="flex items-center">
                <FaLinkedin className="mr-2" />
                <input
                  type="text"
                  value={data.socials.linkedin}
                  onChange={(e) =>
                    setData('socials', { ...data.socials, linkedin: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded"
                  placeholder="LinkedIn"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Update
              </button>
            </div>
          </form>
        </div>
        {/* PREVIEW */}
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
              <img
                src={imagePreview}
                alt="Image Preview"
                className="w-full h-32 object-cover rounded"
              />
            ) : (
              <span className="text-gray-500">Image Preview</span>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditTeam;
