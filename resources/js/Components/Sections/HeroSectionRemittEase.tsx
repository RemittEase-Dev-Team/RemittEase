import React from 'react';
// import Canvas3DRemittEase from '@/Components/ui/Canvas3DRemittEase';
import EarthGlobe from '@/Components/EarthGlobe';


const HeroSectionRemittEase: React.FC = () => {
  return (
    <section
      className="relative w-full min-svh-screen flex flex-col items-center justify-center text-white overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, rgba(0, 0, 22, 1),rgba(0, 0, 22, 1), rgba(0, 20, 221, 0.6), rgba(0, 0, 0, 1))',
      }}
    >


      {/* Main Hero Content */}
      <div className="z-10 text-center max-w-3xl px-4">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6 pt-10">
          Fast, Low-Cost, Secure Remittances
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 mb-8">
          Send and receive money across borders instantly with low fees and
          top security. Built on blockchain for transparency and affordability.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center py-1 px-0">
            <div className="flex flex-col sm:flex-row items-center py-1 px-2 border-2 border-yellow-500 rounded-full">
          <input
            type="email"
            placeholder="Your email address"
            className="py-1 text-white focus:outline-none border-transparent bg-transparent"
          />
          <button className="bg-yellow-500 hover:bg-orange-400 text-white px-6 py-2 rounded-full transition-colors">
            Join our community
          </button>
        </div>
        </div>

      </div>
      {/* The 3D Canvas in the background */}
      <EarthGlobe
        height="50vh"
        width="100%"
        rotationSpeed={0.0055}
        meshColor="#fff"
        vertexGlowColor="#007bff"
      />
    </section>
  );
};

export default HeroSectionRemittEase;
