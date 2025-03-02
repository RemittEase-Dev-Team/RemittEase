import React from 'react';
// Lucide Icons
import { Rocket, Milestone, Users, Globe, Star, DollarSign, Shield, Gift, Zap, Trophy, Calendar, Award } from 'lucide-react';

interface RoadmapItem {
  quarter: string;
  details: string; // Adjusted to match the data structure
}

interface RoadMapSectionProps {
  roadmaps: RoadmapItem[];
}

const RoadMapSection: React.FC<RoadMapSectionProps> = ({ roadmaps }) => {
  return (
    <section
      className="relative py-16 bg-dark-navy text-soft-white overflow-hidden"
      style={{
        background: 'radial-gradient(circle, rgba(0, 115, 255, 0.2), rgba(0, 0, 22, 1))',
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-neon-cyan text-center mb-6">
          RemittEase Roadmap
        </h2>
        <p className="text-lg text-cool-gray text-center mb-12">
          Charting our path from humble beginnings to global domination.
        </p>

        {/* Vertical Timeline Container */}
        <div className="relative pl-4 md:pl-8">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-8 top-0 w-1 bg-neon-cyan h-full rounded-full opacity-40"></div>

          {roadmaps.map((item, index) => (
            <div key={index} className="relative mb-14">
              {/* Circle marker + Quarter Title */}
              <div className="flex items-center mb-4">
                <div className="z-10 flex items-center justify-center w-8 h-8 bg-neon-cyan text-dark-navy rounded-full">
                  <Milestone className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-bold text-neon-cyan ml-4">
                  {item.quarter}
                </h3>
              </div>

              {/* Card for bullet points */}
              <div className="ml-8 md:ml-12 bg-black bg-opacity-30 rounded-lg p-4 shadow-lg">
                <ul className="list-none space-y-2 text-cool-gray">
                  {JSON.parse(item.details).map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <Star className="text-neon-cyan w-4 h-4 mt-1 flex-shrink-0 mr-2" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadMapSection;
