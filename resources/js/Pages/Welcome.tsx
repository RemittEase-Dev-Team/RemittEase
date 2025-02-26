import React from 'react';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react'; // Importing usePage
import Button from '@/Components/ui/Button';
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
  const { auth } = usePage<PageProps>().props; // Using usePage to get auth with correct type

  return (
    <div className="bg-dark-navy text-soft-white font-poppins">
      <Head title="RemittEase - Fast, Low-Cost, Secure Remittances" />
      <NavBarRemittEase auth={auth} /> {/* Passing auth to NavBarRemittEase */}
      <HeroSectionRemittEase />
      <AboutSection />
      <FeaturesSection />
      <RoadMapSection />
      <TeamSection />
      <BlogSection />
      <QuestRewardsSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
