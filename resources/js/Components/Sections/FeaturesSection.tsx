import React from 'react';
import { Globe, DollarSign, CreditCard, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturesSectionProps {
  features: { icon: string; title: string; description: string }[];
}

const iconMap: { [key: string]: React.ElementType } = {
  Globe,
  DollarSign,
  CreditCard,
  Shield,
  Zap,
};

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => (
  <section className="py-24 text-soft-white" style={{
    background: 'radial-gradient(circle, rgba(0, 115, 255, 0.2), rgba(0, 0, 22, 1))',
  }}>
    <h2 className="text-4xl font-bold text-neon-cyan text-center mb-8">Key Features</h2>
    <p className="text-lg text-cool-gray text-center mb-12">Unlock the full potential of your transactions with our cutting-edge features.</p>
    <div className="flex overflow-x-auto space-x-4 px-4 py-10 justify-center animate-scroll">
      {features.map((feature, index) => {
        const IconComponent = iconMap[feature.icon];
        return (
          <motion.div
            key={index}
            className="flex-shrink-0 w-64 bg-dark-navy p-6 rounded-lg shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.1))',
            }}
            whileHover={{ scale: 1.1, rotate: '10deg', transition: { duration: 0.5 } }}
          >
            <div className="text-5xl mb-4">
              {IconComponent && <IconComponent className='text-neon-cyan w-10 h-10' />}
            </div>
            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
            <p className="text-cool-gray">{feature.description}</p>
          </motion.div>
        );
      })}
    </div>
  </section>
);

export default FeaturesSection;
