import React, { useState, useEffect } from 'react';

const NavBarRemittEase: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keep the navbar sticky when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`w-full flex justify-between items-center py-4 px-8 z-30 bg-dark-navy text-white transition-colors ${
        isSticky ? 'sticky top-0' : ''
      }`}
    >
      {/* Logo / Brand */}
      <div className="text-2xl font-bold">
        <img
          src="/svg/logo-w.svg"
          alt="RemittEase Logo"
          style={{ width: '180px' }}
        />
      </div>

      {/* Desktop Nav Links */}
      <ul className="hidden md:flex space-x-6 font-poppins">
        <li>
          <a href="#" className="hover:text-gray-300 transition-colors">
            About us
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-gray-300 transition-colors">
            How it works
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-gray-300 transition-colors">
            Contact
          </a>
        </li>
        <li>
          <a
            href="/login"
            className="bg-yellow-400 hover:bg-orange-400 px-4 py-2 rounded-full text-dark-navy font-semibold transition-colors"
          >
            Login or Register
          </a>
        </li>
      </ul>

      {/* Hamburger Button (mobile only) */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden flex items-center justify-center focus:outline-none"
      >
        {/* A simple hamburger icon (SVG) */}
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Full-Screen Overlay Menu (Mobile) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-gradient-to-br from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-8"
          style={{ backgroundBlendMode: 'overlay' }}
        >
          {/* Close Button, top-right corner */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-white"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Logo in the Center */}
          <div className="mb-8">
            <img
              src="/svg/logo-w.svg"
              alt="RemittEase Logo"
              style={{ width: '180px' }}
            />
          </div>

          {/* Mobile Menu Links */}
          <ul className="font-poppins text-left space-y-6 w-full max-w-xs">
            <li>
              <a
                href="#"
                className="block text-xl text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block text-xl text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it works
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block text-xl text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
            </li>
            @auth
            <li>
                <a
                href="/dashboard"
                className="block bg-yellow-400 hover:bg-orange-400 px-4 py-2 rounded-full text-dark-navy text-center font-semibold transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                 Dashboard
              </a>
            </li>
            @else
            <li>
              <a
                href="/login"
                className="block bg-yellow-400 hover:bg-orange-400 px-4 py-2 rounded-full text-dark-navy text-center font-semibold transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login / Register
              </a>
            </li>
            @endauth
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavBarRemittEase;
