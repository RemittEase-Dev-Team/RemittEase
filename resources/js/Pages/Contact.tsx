import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import NavBarRemittEase from '@/Components/NavBarRemittEase';
import Footer from '@/Components/Footer';
import { Mail, Phone, MapPin, Clock, Shield, Globe, Send, MessageSquare } from 'lucide-react';

interface Props {
  canLogin: boolean;
  canRegister: boolean;
}

export default function ContactPage({ canLogin, canRegister }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('contact.send'));
  };

  return (
    <>
      <Head title="Contact Us" />
      <div className="min-h-screen bg-dark-navy text-soft-white font-poppins">
        <NavBarRemittEase />

        <main className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Hero Section with Animated Background */}
          <section className="relative text-center mb-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 animate-gradient-x"></div>
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <section className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                  <MessageSquare className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-cyan-400">Send us a Message</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="Your name"
                  />
                  {errors.name && <div className="text-red-400 text-sm mt-1">{errors.name}</div>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="your@email.com"
                  />
                  {errors.email && <div className="text-red-400 text-sm mt-1">{errors.email}</div>}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={data.subject}
                    onChange={e => setData('subject', e.target.value)}
                    className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="Message subject"
                  />
                  {errors.subject && <div className="text-red-400 text-sm mt-1">{errors.subject}</div>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={data.message}
                    onChange={e => setData('message', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="Your message"
                  />
                  {errors.message && <div className="text-red-400 text-sm mt-1">{errors.message}</div>}
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </span>
                  )}
                </button>
              </form>
            </section>

            {/* Contact Information */}
            <section className="space-y-8">
              <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                    <MapPin className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-cyan-400">Contact Information</h2>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <MapPin className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-cyan-400 mb-1">Address</h3>
                      <p className="text-gray-300">123 Remittance Street, Financial District, City, Country</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <Phone className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-cyan-400 mb-1">Phone</h3>
                      <p className="text-gray-300">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <Mail className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-cyan-400 mb-1">Email</h3>
                      <p className="text-gray-300">support@remittease.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                    <Clock className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-cyan-400">Business Hours</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg">
                    <span className="text-gray-300">Monday - Friday</span>
                    <span className="text-cyan-400">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg">
                    <span className="text-gray-300">Saturday</span>
                    <span className="text-cyan-400">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg">
                    <span className="text-gray-300">Sunday</span>
                    <span className="text-cyan-400">Closed</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center border border-cyan-400/30 mr-4">
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-cyan-400">Global Support</h2>
                </div>
                <p className="text-gray-300 text-lg mb-4">
                  Our support team is available 24/7 to assist you with any questions or concerns about our services.
                </p>
                <div className="flex items-center text-cyan-400">
                  <Shield className="w-5 h-5 mr-2" />
                  <span>Secure and reliable support system</span>
                </div>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
