import Button from '@/Components/ui/Button';

const HeroSection: React.FC = () => (
    <div className="text-center py-20 bg-dark-navy text-soft-white">
      <h1 className="text-5xl font-bold text-neon-cyan">Fast, Low-Cost, Secure Remittances</h1>
      <p className="mt-4 text-lg text-cool-gray">Send and receive money across borders instantly with low fees and top security.</p>
      <Button className="mt-6 bg-neon-cyan hover:bg-bright-orange text-dark-navy font-semibold px-6 py-3 rounded-lg">
        Try Now
      </Button>
    </div>
  );

export default HeroSection;
