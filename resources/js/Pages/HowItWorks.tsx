import React, { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import NavBarRemittEase from '@/Components/NavBarRemittEase';
import Footer from '@/Components/Footer';
import { ArrowRight, Send, Wallet, Shield, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  canLogin: boolean;
  canRegister: boolean;
}

export default function HowItWorksPage({ canLogin, canRegister }: Props) {
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

  const steps = [
    {
      title: "Create Account",
      description: "Sign up for a RemittEase account in minutes. Our simple registration process requires basic information and identity verification.",
      icon: <Wallet className="w-7 h-7 text-cyan-400" />,
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "Add Funds",
      description: "Securely add funds to your account using various payment methods. Our platform supports multiple currencies and payment options.",
      icon: <Send className="w-7 h-7 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-500/20"
    },
    {
      title: "Send Money",
      description: "Transfer money to your loved ones worldwide. Our platform ensures fast, secure, and cost-effective transfers.",
      icon: <Shield className="w-7 h-7 text-cyan-400" />,
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "Track Transfer",
      description: "Monitor your transfer status in real-time. Get instant notifications when your money is delivered.",
      icon: <Clock className="w-7 h-7 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-500/20"
    }
  ];

  return (
    <>
      <Head title="How It Works" />
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

        <main className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
          {/* Hero Section with Animated Background */}
          <motion.section
            className="relative text-center mb-20 overflow-hidden py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 animate-gradient-x"></div>
            <div className="cosmic-background absolute inset-0 z-0"></div>

            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.h1
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.4
                }}
              >
                How RemittEase Works
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Simple, secure, and fast money transfers to your loved ones worldwide.
              </motion.p>
            </motion.div>

            {/* Animated spiral elements */}
            <div className="spiral-shape absolute left-10 top-10 w-16 h-16 opacity-30"></div>
            <div className="spiral-shape absolute right-10 bottom-10 w-16 h-16 opacity-30" style={{ animationDelay: '1s' }}></div>
          </motion.section>

          {/* Steps Section */}
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
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    className={`bg-gradient-to-br ${step.color} p-8 rounded-xl border border-cyan-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden`}
                    variants={itemVariants}
                    whileHover="hover"
                  >
                    {/* Animated glowing spots in background */}
                    <div className="absolute w-20 h-20 bg-cyan-400/20 rounded-full -top-10 -right-10 filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute w-32 h-32 bg-blue-400/10 rounded-full -bottom-16 -left-16 filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="flex items-center mb-6">
                      <motion.div
                        className="w-14 h-14 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                      >
                        {step.icon}
                      </motion.div>
                      <h2 className="text-3xl font-semibold text-cyan-400">{step.title}</h2>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
                    {index < steps.length - 1 && (
                      <motion.div
                        className="absolute bottom-0 right-0 p-4"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <ArrowRight className="w-6 h-6 text-cyan-400" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
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
                Why Choose RemittEase?
              </motion.h2>

              <motion.div
                className="grid md:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {[
                  {
                    title: "Secure Transfers",
                    description: "Your money is protected with state-of-the-art encryption and security measures.",
                    icon: <Shield className="w-7 h-7 text-cyan-400" />
                  },
                  {
                    title: "Fast Delivery",
                    description: "Most transfers are completed within minutes, not days.",
                    icon: <Clock className="w-7 h-7 text-cyan-400" />
                  },
                  {
                    title: "Low Fees",
                    description: "Competitive rates and transparent fee structure.",
                    icon: <CheckCircle className="w-7 h-7 text-cyan-400" />
                  }
                ].map((feature, index) => (
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

                    <div className="flex items-center mb-6">
                      <motion.div
                        className="w-14 h-14 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-2xl font-semibold text-cyan-400">{feature.title}</h3>
                    </div>
                    <p className="text-gray-300 text-lg relative z-10">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
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
