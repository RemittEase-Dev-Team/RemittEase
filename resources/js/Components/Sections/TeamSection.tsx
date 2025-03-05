import React, { useState } from 'react';
import { Twitter, Github, Linkedin, X } from 'lucide-react';

interface TeamSectionProps {
  teams: any[];
}

const TeamSection: React.FC<TeamSectionProps> = ({ teams }) => {
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
          {teams?.map((member, index) => {
            const socials = member?.socials;
            return (
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
                    {socials.twitter && (
                      <a
                        href={socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-5 h-5 hover:text-white" />
                      </a>
                    )}
                    {socials.github && (
                      <a
                        href={socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-5 h-5 hover:text-white" />
                      </a>
                    )}
                    {socials.linkedin && (
                      <a
                        href={socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-5 h-5 hover:text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
              const member = teams[selectedMemberIndex];
              const socials = JSON.parse(member.socials);
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
                    {socials.twitter && (
                      <a
                        href={socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-5 h-5 hover:text-white" />
                      </a>
                    )}
                    {socials.github && (
                      <a
                        href={socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-5 h-5 hover:text-white" />
                      </a>
                    )}
                    {socials.linkedin && (
                      <a
                        href={socials.linkedin}
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
