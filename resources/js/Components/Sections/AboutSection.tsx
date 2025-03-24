import React from 'react';
import { motion } from 'framer-motion';
// Import Lucide icons to represent each core value
import { ShieldCheck, RadioTower, DollarSign } from 'lucide-react';

interface About {
  mission: string;
  vision: string;
  core_values: string;
  sub_1_fees: string;
}

interface AboutSectionProps {
  abouts: About[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ abouts }) => {
  // Parse the abouts data
  const about = abouts[0]; // Get the first about entry
  const coreValues = JSON.parse(about?.core_values || '[]');
  const fees = JSON.parse(about?.sub_1_fees || '{"description": "", "fees": []}');

  return (
    <section
      className="py-32 text-center text-soft-white relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle, rgba(0, 115, 255, 0.2), rgba(0, 0, 22, 1))',
      }}
    >
      {/* Background Mesh Pattern - omitted for brevity */}
      <div className="absolute inset-0 opacity-20">
        {/* ... your mesh pattern SVG, if you still want it ... */}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Main Title */}
        <h2 className="text-4xl font-bold text-neon-cyan">About RemittEase</h2>
        <div className="mt-4 text-lg text-cool-gray max-w-2xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-neon-cyan">
            Our Mission
          </h3>
          <p>{about?.mission}</p>
        </div>

        {/* Cards Container */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Mission & Vision Card */}
          <div className="bg-black bg-opacity-30 rounded-lg p-6 shadow-lg">
            <div className="flex flex-col items-start space-y-4">
              <img
                src="/images/mission.png"
                alt="Mission & Vision"
                className="rounded-lg w-full object-cover"
              />
              <h3 className="text-2xl md:text-3xl font-bold text-neon-cyan">
                Mission &amp; Vision
              </h3>
              <p className="text-lg text-cool-gray">
                {about?.vision}
              </p>
            </div>
          </div>

          {/* Sub-1% Fees Card */}
          <div className="bg-black bg-opacity-30 rounded-lg p-6 shadow-lg">
            <div className="flex flex-col items-start space-y-4">
              <img
                src="/images/fees.png"
                alt="Sub-1% Fees"
                className="rounded-lg w-full object-cover"
              />
              <h3 className="text-2xl md:text-3xl font-bold text-neon-cyan">
                Sub-1% Fees
              </h3>
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-neon-cyan"
                style={{ textShadow: '0 0 8px #00bfff' }}
              >
                {fees.description}
              </motion.div>
              <div>
                <span className="text-lg text-cool-gray">Fees: </span>
                <span className="text-lg text-neon-cyan">
                  {fees.fees.map((fee: number, index: number) =>
                    `${fee}%${index < fees.fees.length - 1 ? ' | ' : ''}`
                  ).join('')}
                </span>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="border-2 border-neon-cyan p-2 rounded-lg flex-1"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-neon-cyan text-white py-2 px-4 rounded-lg"
                >
                  Calculate Savings
                </motion.button>
              </div>
            </div>
          </div>

          {/* Core Values Card */}
          <div className="bg-black bg-opacity-30 rounded-lg p-6 shadow-lg md:col-span-2">
            <div className="flex flex-col items-start space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-neon-cyan">
                Core Values
              </h3>

              {/* Three mini-cards in a row on desktop */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {coreValues.map((value: any, index: number) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="border border-neon-cyan rounded-lg p-4 bg-black bg-opacity-30 flex flex-col items-start text-left"
                  >
                    {value.title === 'Security' && <ShieldCheck className="w-12 h-12 text-neon-cyan mb-2" />}
                    {value.title === 'Decentralization' && <RadioTower className="w-12 h-12 text-neon-cyan mb-2" />}
                    {value.title === 'Affordability' && <DollarSign className="w-12 h-12 text-neon-cyan mb-2" />}
                    <h4 className="text-xl font-bold text-neon-cyan">{value.title}</h4>
                    <p className="text-cool-gray mt-2">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
    </section>
  );
};

export default AboutSection;
