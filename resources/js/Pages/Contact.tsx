import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import NavBarRemittEase from '@/Components/NavBarRemittEase';
import Footer from '@/Components/Footer';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Globe,
  Send,
  MessageSquare,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  canLogin: boolean;
  canRegister: boolean;
}

export default function ContactPage({ canLogin, canRegister }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        reset();
      }, 5000);
    }, 1500);
    post(route('contact.send'));
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

  const formSuccess = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      <Head title="Contact Us" />
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
                Get in Touch
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
              </motion.p>
            </motion.div>

            {/* Animated spiral elements */}
            <div className="spiral-shape absolute left-10 top-10 w-16 h-16 opacity-30"></div>
            <div className="spiral-shape absolute right-10 bottom-10 w-16 h-16 opacity-30" style={{ animationDelay: '1s' }}></div>
          </motion.section>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.section
              className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm relative overflow-hidden"
              variants={cardHoverVariants}
              whileHover="hover"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Glowing form border effect */}
              <div className="absolute inset-0 border-2 border-transparent bg-transparent rounded-xl glow-border"></div>

              <div className="flex items-center mb-8">
                <motion.div
                  className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                >
                  <MessageSquare className="w-6 h-6 text-cyan-400" />
                </motion.div>
                <h2 className="text-3xl font-bold text-cyan-400">Send us a Message</h2>
              </div>

              <AnimatePresence>
                {isSubmitted ? (
                  <motion.div
                    className="flex flex-col items-center justify-center py-10"
                    variants={formSuccess}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="w-20 h-20 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mb-6">
                      <CheckCircle className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-cyan-400 mb-4">Message Sent!</h3>
                    <p className="text-gray-300 text-center mb-6">Thank you for reaching out. We'll get back to you shortly.</p>
                    <motion.div
                      className="success-pulse absolute inset-0 rounded-xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: [0, 0.2, 0],
                        scale: [0.8, 1.2, 1.4]
                      }}
                      transition={{
                        duration: 2,
                        repeat: 2,
                        repeatType: "loop"
                      }}
                    ></motion.div>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants}>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 relative z-20"
                        placeholder="Your name"
                      />
                      {errors.name && <div className="text-red-400 text-sm mt-1">{errors.name}</div>}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 relative z-20"
                        placeholder="your@email.com"
                      />
                      {errors.email && <div className="text-red-400 text-sm mt-1">{errors.email}</div>}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={data.subject}
                        onChange={e => setData('subject', e.target.value)}
                        className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 relative z-20"
                        placeholder="Message subject"
                      />
                      {errors.subject && <div className="text-red-400 text-sm mt-1">{errors.subject}</div>}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        value={data.message}
                        onChange={e => setData('message', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 relative z-20"
                        placeholder="Your message"
                      />
                      {errors.message && <div className="text-red-400 text-sm mt-1">{errors.message}</div>}
                    </motion.div>

                    <motion.button
                      type="submit"
                      disabled={processing}
                      className="w-full relative bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 overflow-hidden group"
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                      {processing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center relative z-10">
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </span>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Contact Information */}
            <motion.section
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              variants={containerVariants}
            >
              <motion.div
                className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm relative overflow-hidden"
                variants={cardHoverVariants}
                whileHover="hover"
              >
                {/* Card background animated elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-3xl"></div>

                <div className="flex items-center mb-8">
                  <motion.div
                    className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <MapPin className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-cyan-400">Contact Information</h2>
                </div>

                <motion.div
                  className="space-y-6"
                  variants={containerVariants}
                >
                  <motion.div
                    className="flex items-start space-x-4"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <MapPin className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-cyan-400 mb-1">Address</h3>
                      <p className="text-gray-300">123 Remittance Street, Financial District, City, Country</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-4"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <Phone className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-cyan-400 mb-1">Phone</h3>
                      <p className="text-gray-300">+1 (555) 123-4567</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-4"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <Mail className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-cyan-400 mb-1">Email</h3>
                      <p className="text-gray-300">support@remittease.com</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Business Hours */}
              <motion.div
                className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm relative overflow-hidden"
                variants={cardHoverVariants}
                whileHover="hover"
              >
                {/* Card background animated elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500/5 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-3xl"></div>

                <div className="flex items-center mb-8">
                  <motion.div
                    className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Clock className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-cyan-400">Business Hours</h2>
                </div>

                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                >
                  <motion.div
                    className="flex justify-between items-center p-4 bg-blue-900/30 rounded-lg border border-blue-500/10 relative overflow-hidden group"
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(21, 94, 117, 0.3)",
                      borderColor: "rgba(6, 182, 212, 0.3)"
                    }}
                  >
                    <span className="text-gray-300">Monday - Friday</span>
                    <span className="text-cyan-400 font-semibold flex items-center">
                      9:00 AM - 6:00 PM
                      <motion.div
                        initial={{ x: -5, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex justify-between items-center p-4 bg-blue-900/30 rounded-lg border border-blue-500/10 relative overflow-hidden group"
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(21, 94, 117, 0.3)",
                      borderColor: "rgba(6, 182, 212, 0.3)"
                    }}
                  >
                    <span className="text-gray-300">Saturday</span>
                    <span className="text-cyan-400 font-semibold flex items-center">
                      10:00 AM - 4:00 PM
                      <motion.div
                        initial={{ x: -5, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex justify-between items-center p-4 bg-blue-900/30 rounded-lg border border-blue-500/10 relative overflow-hidden group"
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(21, 94, 117, 0.3)",
                      borderColor: "rgba(6, 182, 212, 0.3)"
                    }}
                  >
                    <span className="text-gray-300">Sunday</span>
                    <span className="text-cyan-400 font-semibold flex items-center">
                      Closed
                      <motion.div
                        initial={{ x: -5, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm relative overflow-hidden"
                variants={cardHoverVariants}
                whileHover="hover"
              >
                {/* Card background animated elements */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-blue-500/10 to-transparent rounded-full animate-pulse-slow opacity-30"></div>

                <div className="flex items-center mb-8">
                  <motion.div
                    className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-cyan-400">Global Support</h2>
                </div>

                <motion.p
                  className="text-gray-300 text-lg mb-4"
                  variants={itemVariants}
                >
                  Our support team is available 24/7 to assist you with any questions or concerns about our services.
                </motion.p>

                <motion.div
                  className="flex items-center text-cyan-400"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  <span>Secure and reliable support system</span>
                </motion.div>
              </motion.div>
            </motion.section>
          </div>
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
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.2; }
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

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </>
  );
}