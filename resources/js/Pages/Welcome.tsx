import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react'; // Importing usePage
import NavBarRemittEase from '@/Components/NavBarRemittEase';
import HeroSectionRemittEase from '@/Components/Sections/HeroSectionRemittEase';
import AboutSection from '@/Components/Sections/AboutSection';
import FeaturesSection from '@/Components/Sections/FeaturesSection';
import BlogSection from '@/Components/Sections/BlogSection';
import RoadMapSection from '@/Components/Sections/RoadMapSection';
import TeamSection from '@/Components/Sections/TeamSection';
import QuestRewardsSection from '@/Components/Sections/QuestRewardsSection';
import Footer from '@/Components/Footer';
import { PageProps } from '@/types'; // Importing PageProps instead of Auth

const LandingPage: React.FC = () => {
  const { auth, questRewards, heroes, features, roadmaps, abouts, blogs, teams } = usePage<PageProps>().props; // Using usePage to get auth with correct type
  const [email, setEmail] = useState('');

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('onboarding'), { email });
  };

  console.log('features', features);
  console.log('heroes', heroes);
  console.log('roadmaps', roadmaps);
  console.log('abouts', abouts);
  console.log('blogs', blogs);
  console.log('teams', teams);
  return (
    <div className="bg-dark-navy text-soft-white font-poppins">
      <Head title="RemittEase - Fast, Low-Cost, Secure Remittances" />
      <NavBarRemittEase />
      <HeroSectionRemittEase heroes={heroes} onGetStarted={handleGetStarted} email={email} setEmail={setEmail} />
      <AboutSection abouts={abouts} />
      <FeaturesSection features={features} />
      <RoadMapSection roadmaps={roadmaps} />
      <TeamSection teams={teams} />
      <BlogSection />
      <QuestRewardsSection questRewards={questRewards} />
      <Footer />
    </div>
  );
};

export default LandingPage;
