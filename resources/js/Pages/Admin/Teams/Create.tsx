import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

const CreateTeam: React.FC = () => {
  // 1) Initialize the form with an image = null, not a base64 string
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    role: '',
    image: null as File | null,    // treat image as a File
    short_desc: '',
    full_desc: '',
    socials: {
      twitter: '',
      github: '',
      linkedin: '',
    },
  });

  // For preview only
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 2) When an image is selected, store the File object in `data.image`
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For preview
      setImagePreview(URL.createObjectURL(file));
      // Save the actual file to data
      setData('image', file);
    }
  };

  // 3) Submit using `post` and ensure file is sent as FormData
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // forceFormData: true ensures file is included as multipart/form-data
    post('/admin/teams', { forceFormData: true });
  };

  return (
    <AdminLayout>
      <div className="p-6 flex">
        <div className="w-full pr-4 md:w-7/10 bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add New Team Member</h2>
          <a href="/admin/teams" className="flex items-center text-blue-500 mt-2">
            {/* ...back link... */}
            Back to Teams
          </a>

          {/* 4) Use encType to allow file uploads */}
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

            {/* ...Short desc, Full desc... */}
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

            {/* Social inputs */}
            <div className="mb-4 flex space-x-4">
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
                Create
              </button>
            </div>
          </form>
        </div>
        {/* IMAGE PREVIEW SIDE */}
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

export default CreateTeam;
