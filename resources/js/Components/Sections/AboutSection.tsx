import React from 'react';
import { motion } from 'framer-motion';
// Import Lucide icons to represent each core value
import { ShieldCheck, RadioTower, DollarSign } from 'lucide-react';

interface AboutSectionProps {
  abouts: any[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ abouts }) => (
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
      {abouts.map((about, index) => (
        <div key={index} className="mt-4 text-lg text-cool-gray max-w-2xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-neon-cyan">
            {about.title}
          </h3>
          <p>{about.description}</p>
        </div>
      ))}

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
              We believe in financial freedom for everyone. Our goal is to make
              remittances cheaper, faster, and more accessible—no banks, no limits.
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
              Ultra-low fees—under 1%! Keep more of your money with RemittEase.
            </motion.div>
            <div>
              <span className="text-lg text-cool-gray">Fees: </span>
              <span className="text-lg text-neon-cyan">0.8% | 0.7% | 0.6%</span>
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
              {/* Card #1: Security */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border border-neon-cyan rounded-lg p-4 bg-black bg-opacity-30 flex flex-col items-start text-left"
              >
                <ShieldCheck className="w-12 h-12 text-neon-cyan mb-2" />
                <h4 className="text-xl font-bold text-neon-cyan">Security</h4>
                <p className="text-cool-gray mt-2">
                  Blockchain encryption keeps your money safe.
                </p>
              </motion.div>

              {/* Card #2: Decentralization */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border border-neon-cyan rounded-lg p-4 bg-black bg-opacity-30 flex flex-col items-start text-left"
              >
                <RadioTower className="w-12 h-12 text-neon-cyan mb-2" />
                <h4 className="text-xl font-bold text-neon-cyan">Decentralization</h4>
                <p className="text-cool-gray mt-2">
                  No banks, no middlemen—just fast transfers.
                </p>
              </motion.div>

              {/* Card #3: Affordability */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border border-neon-cyan rounded-lg p-4 bg-black bg-opacity-30 flex flex-col items-start text-left"
              >
                <DollarSign className="w-12 h-12 text-neon-cyan mb-2" />
                <h4 className="text-xl font-bold text-neon-cyan">Affordability</h4>
                <p className="text-cool-gray mt-2">
                  Under 1% fees—lower than banks and competitors.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Subtle overlay gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
  </section>
);

export default AboutSection;
