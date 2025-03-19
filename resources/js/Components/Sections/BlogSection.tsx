import React, { useState } from 'react';
import { Calendar, User, X } from 'lucide-react'; // Added X icon from lucide-react

export interface BlogPost {
  title: string;
  content: string;
  created_at: string;
  author: string;
  image: string;
}

interface BlogSectionProps {
  blogs: BlogPost[];
}

const BlogSection: React.FC<BlogSectionProps> = ({ blogs }) => {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  const handleBlogClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
  };

  const handleCloseModal = () => {
    setSelectedBlog(null);
  };

  return (
    <section className="py-16 bg-dark-navy text-soft-white">
      {/* Outer container for centering */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading + Subtitle */}
        <h2 className="text-4xl font-bold text-neon-cyan text-center mb-6">
          Latest News & Insights
        </h2>
        <p className="mt-2 text-lg text-cool-gray text-center mb-8">
          Stay up to date with blockchain and remittance trends from our expert blog.
        </p>

        {/* Card container */}
        <div className="bg-black bg-opacity-30 rounded-lg p-6 shadow-lg w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogs.map((post, index) => (
              <div
                key={index}
                className="bg-dark-gray p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-center"
                onClick={() => handleBlogClick(post)}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="text-2xl font-bold text-neon-cyan line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-cool-gray mt-2 line-clamp-3">{post.content}</p>
                <div className="mt-5 bg-slate-500 py-2 px-4 rounded-lg">
                  <p className="text-sm text-cool-gray">
                    <Calendar size={16} className="inline mr-1" /> {new Date(post.created_at).toLocaleDateString()}
                    <span className="mx-1">|</span>
                    <User size={16} className="inline mr-1" /> {post.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for full blog view */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-dark-navy text-soft-white rounded-md p-6 w-full m-4 lg:w-[90%]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">
                {selectedBlog.title}
              </h2>
              <button className="text-red-500" onClick={handleCloseModal}>
                <X size={24} className="text-white" /> {/* Changed to use X icon from lucide-react */}
              </button>
            </div>
            <div>
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full h-60 object-cover rounded-lg mb-4"
              />
              <p className="mb-4">
                <Calendar size={16} className="inline mr-1" /> {new Date(selectedBlog.created_at).toLocaleDateString()}
                <span className="mx-1">|</span>
                <User size={16} className="inline mr-1" /> {selectedBlog.author}
              </p>
              <div className="text-lg">
                {selectedBlog.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogSection;
