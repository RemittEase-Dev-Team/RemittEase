import React from 'react';
import { Head } from '@inertiajs/react';
import NavBarRemittEase from '@/Components/NavBarRemittEase';
import Footer from '@/Components/Footer';
import TeamSection from '@/Components/Sections/TeamSection';
import { Users, Target, Award, Clock } from 'lucide-react';

interface About {
  mission: string;
  vision: string;
  core_values: string;
  sub_1_fees: string;
}

interface Team {
  name: string;
  role: string;
  description: string;
  image: string;
  shortDesc: string;
  fullDesc: string;
  socials: {
    twitter: string;
    github: string;
    linkedin: string;
  };
}

interface Props {
  about: About;
  teams: Team[];
}

export default function AboutPage({ about, teams }: Props) {
  const coreValues = JSON.parse(about.core_values || '[]');
  const fees = JSON.parse(about.sub_1_fees || '{}');

  return (
    <>
      <Head title="About Us" />
      <div className="min-h-screen bg-dark-navy text-soft-white font-poppins">
        <NavBarRemittEase />

        <main className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Hero Section with Animated Background */}
          <section className="relative text-center mb-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 animate-gradient-x"></div>
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                About RemittEase
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Revolutionizing global money transfers with blockchain technology and innovative solutions.
              </p>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-cyan-400">Our Mission</h2>
                </div>
                <p className="text-gray-300 text-lg">{about.mission}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                    <Award className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-cyan-400">Our Vision</h2>
                </div>
                <p className="text-gray-300 text-lg">{about.vision}</p>
              </div>
            </div>
          </section>

          {/* Core Values Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Core Values
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {coreValues.map((value: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
                  <h3 className="text-2xl font-semibold mb-4 text-cyan-400">{value.title}</h3>
                  <p className="text-gray-300 text-lg">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team Section */}
          <TeamSection teams={teams} />

          {/* Fees Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Our Fees
            </h2>
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-semibold text-cyan-400">Transparent Fee Structure</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {fees.fees?.map((fee: number, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-blue-900/30 rounded-lg">
                    <span className="text-gray-300">Transfer Amount {index + 1}</span>
                    <span className="text-cyan-400 font-semibold">{fee}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
