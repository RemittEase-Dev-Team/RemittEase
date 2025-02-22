import React from 'react';
import { Calendar, User } from 'lucide-react';

const blogPosts = [
  {
    title: 'Understanding Web3 Transactions',
    description:
      'A deep dive into how Web3 transactions work and their impact on the future of finance.',
    date: 'March 15, 2023',
    author: 'Michael Thompson',
    image: 'https://imageplaceholder.net/300x200?text=Web3+Transactions',
  },
  {
    title: 'Remittances in the Age of Blockchain',
    description:
      'Exploring how blockchain technology is revolutionizing remittance services globally.',
    date: 'April 10, 2023',
    author: 'Emily Carter',
    image: 'https://imageplaceholder.net/300x200?text=Blockchain+Remittances',
  },
  {
    title: 'The Future of Decentralized Finance',
    description:
      'An overview of decentralized finance (DeFi) and its implications for traditional banking.',
    date: 'May 5, 2023',
    author: 'David Wilson',
    image: 'https://imageplaceholder.net/300x200?text=Decentralized+Finance',
  },
  {
    title: 'How RemittEase is Leading the Charge',
    description:
      'Discover how RemittEase is leveraging Web3 technology to enhance remittance services.',
    date: 'June 20, 2023',
    author: 'Sophia Martinez',
    image: 'https://imageplaceholder.net/300x200?text=RemittEase+Web3',
  },
];

const BlogSection: React.FC = () => {
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
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="bg-dark-gray p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-center"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="text-2xl font-bold text-neon-cyan line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-cool-gray mt-2 line-clamp-3">{post.description}</p>
                <div className="mt-5 bg-slate-500 py-2 px-4 rounded-lg">
                  <p className="text-sm text-cool-gray">
                    <Calendar size={16} className="inline mr-1" /> {post.date}
                    <span className="mx-1">|</span>
                    <User size={16} className="inline mr-1" /> {post.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
