import React, { useState } from 'react';
import { Twitter, Github, Linkedin, X } from 'lucide-react';

// Dummy team data
const teamMembers = [
  {
    name: 'Jane Doe',
    role: 'CEO & Co-Founder',
    image: 'https://imageplaceholder.net/600x400',
    shortDesc: 'Visionary leader with a passion for fintech innovation.',
    fullDesc:
      'Jane is a seasoned entrepreneur with over 10 years of experience in the finance and tech industries. She spearheads the strategic direction of RemittEase, ensuring the company stays at the forefront of blockchain remittance solutions.',
    socials: {
      twitter: 'https://twitter.com/',
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/',
    },
  },
  {
    name: 'John Smith',
    role: 'CTO & Co-Founder',
    image: 'https://imageplaceholder.net/600x400',
    shortDesc: 'Full-stack blockchain engineer and product architect.',
    fullDesc:
      'John is a tech guru with deep expertise in smart contracts, distributed systems, and scalable infrastructure. He leads our development team to build reliable, cutting-edge solutions.',
    socials: {
      twitter: 'https://twitter.com/',
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/',
    },
  },
  {
    name: 'Sophia Martinez',
    role: 'Blockchain Engineer',
    image: 'https://imageplaceholder.net/600x400',
    shortDesc: 'Smart contract wizard with a knack for security.',
    fullDesc:
      'Sophia specializes in blockchain security, ensuring RemittEase’s contracts and protocols are robust and resilient against malicious attacks.',
    socials: {
      twitter: 'https://twitter.com/',
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/',
    },
  },
  {
    name: 'Michael Thompson',
    role: 'Smart Contract Developer',
    image: 'https://imageplaceholder.net/600x400',
    shortDesc: 'Passionate about decentralized finance solutions.',
    fullDesc:
      'Michael develops and audits the core smart contracts. He’s a big proponent of open-source collaboration and frequently shares insights with the community.',
    socials: {
      twitter: '',
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/',
    },
  },
  {
    name: 'Emily Carter',
    role: 'UI/UX Designer',
    image: 'https://imageplaceholder.net/600x400',
    shortDesc: 'Crafts intuitive and engaging user experiences.',
    fullDesc:
      'Emily blends functionality with stunning design, ensuring RemittEase’s interface is both visually appealing and easy to use for users across the globe.',
    socials: {
      twitter: 'https://twitter.com/',
      github: '',
      linkedin: 'https://linkedin.com/',
    },
  },
  {
    name: 'David Wilson',
    role: 'Marketing Lead',
    image: 'https://imageplaceholder.net/600x400',
    shortDesc: 'Driving growth and adoption through storytelling.',
    fullDesc:
      'David manages marketing campaigns, brand positioning, and community engagement—making sure the world knows about RemittEase.',
    socials: {
      twitter: 'https://twitter.com/',
      github: '',
      linkedin: 'https://linkedin.com/',
    },
  },
  {
    name: 'Anna Lee',
    role: 'Head of Partnerships',
    image: 'https://imageplaceholder.net/600x400',
    shortDesc: 'Building strategic alliances across the Web3 ecosystem.',
    fullDesc:
      'Anna forges partnerships with other blockchain companies, payment gateways, and institutions to expand RemittEase’s reach and liquidity options.',
    socials: {
      twitter: '',
      github: '',
      linkedin: 'https://linkedin.com/',
    },
  },
  {
    name: 'Chris Evans',
    role: 'Community Manager',
    image: 'https://imageplaceholder.net/600x400',
    shortDesc: 'Energizing and supporting our global user base.',
    fullDesc:
      'Chris oversees user feedback, Discord moderation, and event organization, ensuring our community remains active and informed.',
    socials: {
      twitter: 'https://twitter.com/',
      github: '',
      linkedin: 'https://linkedin.com/',
    },
  },
];

const TeamSection: React.FC = () => {
  // Track which member is selected for the modal, if any
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(null);

  const closeModal = () => {
    setSelectedMemberIndex(null);
  };

  return (
    <section
      className="py-16 bg-dark-navy text-soft-white"
      style={{
        background: 'radial-gradient(circle, rgba(0,115,255,0.2), rgba(0,0,22,1))',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-neon-cyan">Meet the Team</h2>
        <p className="mt-4 text-lg text-cool-gray">
          A dedicated team of fintech and blockchain experts driving RemittEase
          forward.
        </p>

        {/* Team Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-black bg-opacity-30 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
              onClick={() => setSelectedMemberIndex(index)}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold text-neon-cyan">{member.name}</h3>
                <p className="text-cool-gray text-sm mt-1">{member.role}</p>
                <p className="text-sm mt-2 text-gray-200 line-clamp-2">
                  {member.shortDesc}
                </p>
                {/* Social Icons Row */}
                <div className="mt-3 flex justify-center space-x-4 text-neon-cyan">
                  {member.socials.twitter && (
                    <a
                      href={member.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-5 h-5 hover:text-white" />
                    </a>
                  )}
                  {member.socials.github && (
                    <a
                      href={member.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-5 h-5 hover:text-white" />
                    </a>
                  )}
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-5 h-5 hover:text-white" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedMemberIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-dark-navy relative p-6 max-w-lg w-full rounded-lg shadow-lg">
            <button
              className="absolute top-4 right-4 text-soft-white hover:text-cool-gray"
              onClick={closeModal}
            >
              <X className="w-6 h-6" />
            </button>
            {/* Member Content */}
            {(() => {
              const member = teamMembers[selectedMemberIndex];
              return (
                <>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-2xl font-bold text-neon-cyan">
                    {member.name}
                  </h3>
                  <p className="text-cool-gray text-sm mb-2">{member.role}</p>
                  <p className="mt-2 text-gray-200">{member.fullDesc}</p>
                  {/* Social Icons Row */}
                  <div className="mt-4 flex justify-center space-x-6 text-neon-cyan">
                    {member.socials.twitter && (
                      <a
                        href={member.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-5 h-5 hover:text-white" />
                      </a>
                    )}
                    {member.socials.github && (
                      <a
                        href={member.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-5 h-5 hover:text-white" />
                      </a>
                    )}
                    {member.socials.linkedin && (
                      <a
                        href={member.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-5 h-5 hover:text-white" />
                      </a>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamSection;
