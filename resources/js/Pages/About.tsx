import React, { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import NavBarRemittEase from '@/Components/NavBarRemittEase';
import Footer from '@/Components/Footer';
import TeamSection from '@/Components/Sections/TeamSection';
import { Users, Target, Award, Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shootingStars, setShootingStars] = useState<Array<{id: number, delay: number, duration: number, top: number, left: number, size: number}>>([]);

  useEffect(() => {
    // Create random shooting stars
    const stars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      delay: Math.random() * 20,
      duration: 1 + Math.random() * 3,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1
    }));
    setShootingStars(stars);
  }, []);

  // Scroll down animation for hero section
  const scrollToContent = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.03,
      boxShadow: "0 25px 50px -12px rgba(0, 183, 255, 0.2)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  console.log('The fetched Fees are:', about.sub_1_fees);

  return (
    <>
      <Head title="About Us" />
      <div className="min-h-screen bg-dark-navy text-soft-white font-poppins relative overflow-hidden">
        {/* Shooting Stars */}
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="shooting-star absolute"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              width: `${star.size * 50}px`,
              height: `${star.size}px`
            }}
          ></div>
        ))}

        {/* Animated Background Elements */}
        <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl top-20 -left-48 animate-pulse-slow"></div>
        <div className="absolute w-80 h-80 bg-cyan-500/10 rounded-full filter blur-3xl bottom-20 -right-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

        {/* Floating orbs */}
        <div className="floating-orb absolute w-6 h-6 rounded-full bg-cyan-400/30 top-1/4 left-1/4" style={{ animationDuration: '15s' }}></div>
        <div className="floating-orb absolute w-4 h-4 rounded-full bg-blue-400/30 top-3/4 left-1/3" style={{ animationDuration: '18s', animationDelay: '1s' }}></div>
        <div className="floating-orb absolute w-8 h-8 rounded-full bg-cyan-400/20 top-1/2 right-1/4" style={{ animationDuration: '20s', animationDelay: '2s' }}></div>
        <div className="floating-orb absolute w-5 h-5 rounded-full bg-blue-400/20 bottom-1/4 right-1/3" style={{ animationDuration: '17s', animationDelay: '3s' }}></div>

        <NavBarRemittEase />

        <main className="px-0 overflow-hidden">
          {/* Hero Section with Animated Particles */}
          <section className="relative text-center overflow-hidden h-screen flex flex-col justify-center items-center">
            <div className="absolute inset-0 z-0">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-radial from-blue-600/20 via-blue-900/10 to-dark-navy animate-pulse-slow"></div>
              <div className="cosmic-background absolute inset-0"></div>

              {/* Animated Particles */}
              <div className="particle-container">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-cyan-400/30 animate-float"
                    style={{
                      width: `${Math.random() * 12 + 4}px`,
                      height: `${Math.random() * 12 + 4}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDuration: `${Math.random() * 10 + 10}s`,
                      animationDelay: `${Math.random() * 5}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <motion.div
              className="relative z-10 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                About RemittEase
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Revolutionizing global money transfers with blockchain technology and innovative solutions.
              </motion.p>

              <motion.button
                className="mt-8 flex items-center justify-center mx-auto text-cyan-400 hover:text-cyan-300 transition-colors"
                onClick={scrollToContent}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ y: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">Explore More</span>
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </motion.button>
            </motion.div>
          </section>

          {/* Mission & Vision Section with Parallax Effect */}
          <section
            ref={scrollRef}
            className="relative py-20 bg-dark-navy overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              {/* Animated background elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl"></div>
            </motion.div>

            <div className="container mx-auto max-w-7xl px-4 relative z-10">
              <motion.div
                className="grid md:grid-cols-2 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.div
                  className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-xl backdrop-blur-sm"
                  variants={itemVariants}
                  whileHover="hover"
                >
                  <div className="flex items-center mb-6">
                    <motion.div
                      className="w-14 h-14 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <Target className="w-7 h-7 text-cyan-400" />
                    </motion.div>
                    <h2 className="text-3xl font-semibold text-cyan-400">Our Mission</h2>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">{about.mission}</p>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-xl backdrop-blur-sm"
                  variants={itemVariants}
                  whileHover="hover"
                >
                  <div className="flex items-center mb-6">
                    <motion.div
                      className="w-14 h-14 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <Award className="w-7 h-7 text-cyan-400" />
                    </motion.div>
                    <h2 className="text-3xl font-semibold text-cyan-400">Our Vision</h2>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">{about.vision}</p>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Core Values Section with 3D Card Effect */}
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
              <motion.h2
                className="text-4xl md:text-5xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                Core Values
              </motion.h2>

              <motion.div
                className="grid md:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {coreValues.map((value: any, index: number) => (
                  <motion.div
                    key={index}
                    className="group bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm relative overflow-hidden"
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.05,
                      rotateY: 5,
                      rotateX: 5,
                      z: 50,
                      boxShadow: "0 25px 50px -12px rgba(0, 183, 255, 0.25)"
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Animated glowing spots in background */}
                    <div className="absolute w-20 h-20 bg-cyan-400/20 rounded-full -top-10 -right-10 filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute w-32 h-32 bg-blue-400/10 rounded-full -bottom-16 -left-16 filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <h3 className="text-2xl font-semibold mb-4 text-cyan-400 relative z-10">{value.title}</h3>
                    <p className="text-gray-300 text-lg relative z-10">{value.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Team Section with Enhanced Animations */}
          <TeamSection teams={teams} />

          {/* Fees Section with Interactive Elements */}
          <section className="container mx-auto px-4 py-16 mb-20 max-w-7xl relative overflow-hidden">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Our Fees
            </motion.h2>

            <motion.div
              className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-xl backdrop-blur-sm relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 183, 255, 0.2)" }}
            >
              {/* Background animated elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full filter blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/5 rounded-full filter blur-2xl"></div>

              <div className="flex items-center mb-8 relative z-10">
                <motion.div
                  className="w-14 h-14 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <Clock className="w-7 h-7 text-cyan-400" />
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-semibold text-cyan-400">Transparent Fee Structure</h3>
              </div>

              <motion.div
                className="grid md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {fees.fees?.map((fee: number, index: number) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-6 bg-blue-900/30 rounded-lg border border-blue-500/10 hover:border-cyan-400/30 transition-colors duration-300"
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.03,
                      backgroundColor: "rgba(21, 94, 117, 0.3)"
                    }}
                  >
                    <span className="text-gray-300 text-lg">Transfer Amount {index + 1}</span>
                    <motion.span
                      className="text-cyan-400 font-semibold text-xl"
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {fee}%
                    </motion.span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </section>
        </main>

        <Footer />
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(10px); }
          50% { transform: translateY(-20px) translateX(0); }
          75% { transform: translateY(-10px) translateX(-10px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0) rotate(315deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateX(-500px) translateY(500px) rotate(315deg) scale(1);
            opacity: 0;
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.5); }
          50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.8); }
        }

        .cosmic-background {
          background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 30, 0.8) 100%),
                      url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50 L50 50 L50 50 Z' fill='none' stroke='%23ffffff10' stroke-width='0.5'%3E%3C/path%3E%3C/svg%3E");
        }

        .floating-orb {
          animation: float linear infinite;
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }

        .shooting-star {
          background: linear-gradient(to right, transparent, rgba(6, 182, 212, 0.8), transparent);
          animation: shooting-star linear infinite;
          pointer-events: none;
        }

        .spiral-shape {
          background: conic-gradient(from 0deg, transparent, rgba(6, 182, 212, 0.3), transparent);
          border-radius: 50%;
          animation: spin-slow 20s linear infinite;
        }

        .glow-border {
          animation: glow 3s ease-in-out infinite;
        }

        .success-pulse {
          background: rgba(6, 182, 212, 0.2);
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to));
        }

        .particle-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
