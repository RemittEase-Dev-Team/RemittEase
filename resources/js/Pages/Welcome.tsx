import React from 'react';
import { Head } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import NavBarRemittEase from '@/Components/NavBarRemittEase';
import HeroSectionRemittEase from '@/Components/Sections/HeroSectionRemittEase';
import AboutSection from '@/Components/Sections/AboutSection';
import FeaturesSection from '@/Components/Sections/FeaturesSection';






const RoadmapSection: React.FC = () => (
  <div className="py-16 text-center bg-dark-navy text-soft-white">
    <h2 className="text-4xl font-bold text-neon-cyan">Our Roadmap</h2>
    <p className="mt-4 text-lg text-cool-gray">Exciting developments are on the way, including new features, partnerships, and expanded services.</p>
  </div>
);

const TeamSection: React.FC = () => (
  <div className="py-16 text-center bg-dark-navy text-soft-white">
    <h2 className="text-4xl font-bold text-neon-cyan">Meet the Team</h2>
    <p className="mt-4 text-lg text-cool-gray">A dedicated team of fintech and blockchain experts driving RemittEase forward.</p>
  </div>
);

const BlogSection: React.FC = () => (
  <div className="py-16 text-center bg-dark-navy text-soft-white">
    <h2 className="text-4xl font-bold text-neon-cyan">Latest News & Insights</h2>
    <p className="mt-4 text-lg text-cool-gray">Stay up to date with blockchain and remittance trends from our expert blog.</p>
  </div>
);

const QuestRewardsSection: React.FC = () => (
  <div className="py-16 text-center bg-dark-navy text-soft-white">
    <h2 className="text-4xl font-bold text-neon-cyan">Earn Rewards</h2>
    <p className="mt-4 text-lg text-cool-gray">Complete quests, engage with our community, and earn Remi Points for exclusive perks.</p>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="bg-dark-navy text-soft-white font-poppins">
      <Head title="RemittEase - Fast, Low-Cost, Secure Remittances" />
      <NavBarRemittEase />
      <HeroSectionRemittEase />
      <AboutSection />
      <FeaturesSection />
      <RoadmapSection />
      <TeamSection />
      <BlogSection />
      <QuestRewardsSection />
      <div className="text-center py-16">
        <h2 className="text-4xl font-bold text-neon-cyan">Join RemittEase Today!</h2>
        <p className="mt-4 text-lg text-cool-gray">Experience the future of borderless remittances.</p>
        <Button variant='primary'>
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
