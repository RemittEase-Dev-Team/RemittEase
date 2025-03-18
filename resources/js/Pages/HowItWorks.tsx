import React from 'react';
import { Head } from '@inertiajs/react';
import NavBarRemittEase from '@/Components/NavBarRemittEase';
import Footer from '@/Components/Footer';
import QuestRewardsSection from '@/Components/Sections/QuestRewardsSection';
import FeaturesSection from '@/Components/Sections/FeaturesSection';
import { Zap, Shield, Globe, ArrowRight, CheckCircle2, Clock, DollarSign, Users, Target, Award } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
}

interface QuestReward {
  title: string;
  description: string;
  rewardPoints: number;
  progress: number;
}

interface Props {
  features: Feature[];
  questRewards: QuestReward[];
}

export default function HowItWorksPage({ features, questRewards }: Props) {
  return (
    <>
      <Head title="How It Works" />
      <div className="min-h-screen bg-dark-navy text-soft-white font-poppins">
        <NavBarRemittEase />

        <main className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Hero Section with Animated Background */}
          <section className="relative text-center mb-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 animate-gradient-x"></div>
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                How RemittEase Works
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience seamless money transfers with our innovative platform. Fast, secure, and user-friendly.
              </p>
            </div>
          </section>

          {/* Process Steps with Timeline */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Simple Process
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-cyan-400 to-blue-500"></div>

              {/* Steps */}
              <div className="space-y-16">
                {[
                  {
                    icon: <Users className="w-8 h-8 text-cyan-400" />,
                    title: "Create Account",
                    description: "Sign up in minutes with your basic information and verify your identity.",
                    position: "left"
                  },
                  {
                    icon: <DollarSign className="w-8 h-8 text-cyan-400" />,
                    title: "Add Funds",
                    description: "Load your wallet securely using various payment methods.",
                    position: "right"
                  },
                  {
                    icon: <Globe className="w-8 h-8 text-cyan-400" />,
                    title: "Send Money",
                    description: "Select recipient, enter amount, and send money instantly.",
                    position: "left"
                  },
                  {
                    icon: <Shield className="w-8 h-8 text-cyan-400" />,
                    title: "Track Transfer",
                    description: "Monitor your transaction status in real-time.",
                    position: "right"
                  }
                ].map((step, index) => (
                  <div key={index} className={`flex items-center ${step.position === 'left' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-1/2 ${step.position === 'left' ? 'pr-8' : 'pl-8'}`}>
                      <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                            {step.icon}
                          </div>
                          <h3 className="text-2xl font-semibold text-cyan-400">{step.title}</h3>
                        </div>
                        <p className="text-gray-300 text-lg">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Our Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4 group-hover:bg-cyan-400/30 transition-colors duration-300">
                      <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-cyan-400">{feature.title}</h3>
                  </div>
                  <p className="text-gray-300 text-lg">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quest Rewards Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Quest Rewards
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {questRewards.map((quest, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                      <Award className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-cyan-400">{quest.title}</h3>
                  </div>
                  <p className="text-gray-300 mb-6 text-lg">{quest.description}</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Reward Points</span>
                      <span className="text-cyan-400 font-semibold text-xl">{quest.rewardPoints}</span>
                    </div>
                    <div className="relative">
                      <div className="h-3 bg-blue-900/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000"
                          style={{ width: `${quest.progress}%` }}
                        />
                      </div>
                      <div className="absolute top-0 right-0 text-sm text-gray-400">
                        {quest.progress}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-semibold text-cyan-400">Fast Transfers</h3>
              </div>
              <p className="text-gray-300 text-lg">
                Send money to your loved ones in minutes, not days. Our platform ensures quick and reliable transfers.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                  <Target className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-semibold text-cyan-400">Global Reach</h3>
              </div>
              <p className="text-gray-300 text-lg">
                Transfer money to over 100 countries worldwide with competitive exchange rates.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
