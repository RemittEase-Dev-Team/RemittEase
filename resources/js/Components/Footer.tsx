import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-navy text-soft-white">
      {/* Main container */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Top row with logo + nav links */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo / Brand */}
          <div className="mb-6 md:mb-0 flex items-center">
            <img
              src="/svg/logo-w.svg"
              alt="RemittEase Logo"
              className="h-12 w-auto mr-4"
            />

          </div>

          {/* Useful Links */}
          <nav className="space-x-4 flex flex-wrap justify-center">
            <a
              href="#about"
              className="text-cool-gray hover:text-neon-cyan transition-colors"
            >
              About
            </a>
            <a
              href="#features"
              className="text-cool-gray hover:text-neon-cyan transition-colors"
            >
              Features
            </a>
            <a
              href="#blog"
              className="text-cool-gray hover:text-neon-cyan transition-colors"
            >
              Blog
            </a>
            <a
              href="#roadmap"
              className="text-cool-gray hover:text-neon-cyan transition-colors"
            >
              Roadmap
            </a>
            <a
              href="#team"
              className="text-cool-gray hover:text-neon-cyan transition-colors"
            >
              Team
            </a>
            <a
              href="#quests"
              className="text-cool-gray hover:text-neon-cyan transition-colors"
            >
              Quests
            </a>
            <a
              href="#contact"
              className="text-cool-gray hover:text-neon-cyan transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16">
          <h2 className="text-4xl font-bold text-neon-cyan">
            Join RemittEase Today!
          </h2>
          <p className="mt-4 text-lg text-cool-gray">
            Experience the future of borderless remittances.
          </p>
          {/* Replace this with your own button component if needed */}
          <a
            href={route('login')}
            className="mt-6 px-6 py-3 text-white bg-neon-cyan hover:bg-cyan-400 rounded-full font-semibold transition-colors inline-block"
          >
            Get Started
          </a>

        </div>

        {/* Bottom row / copyright */}
        <div className="border-t border-gray-600 pt-6 mt-6 text-center text-sm text-cool-gray">
          &copy; {new Date().getFullYear()} RemittEase. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
