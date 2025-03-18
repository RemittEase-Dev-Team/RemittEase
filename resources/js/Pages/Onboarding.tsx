import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import NavBarRemittEase from '@/Components/NavBarRemittEase';
import Footer from '@/Components/Footer';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface Props {
  email: string;
}

export default function OnboardingPage({ email }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { data, setData, post, processing, errors } = useForm<{
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
  }>({
    name: '',
    email: email,
    password: '',
    password_confirmation: '',
    terms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      return;
    }
    post(route('register'));
  };

  return (
    <>
      <Head title="Complete Your Registration" />
      <div className="min-h-screen bg-dark-navy text-soft-white font-poppins">
        <NavBarRemittEase />

        <main className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Hero Section with Animated Background */}
          <section className="relative text-center mb-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 animate-gradient-x"></div>
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                Complete Your Registration
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Just a few more details to get you started with RemittEase.
              </p>
            </div>
          </section>

          {/* Registration Form */}
          <section className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={data.email}
                    readOnly
                    className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={data.password}
                      onChange={e => setData('password', e.target.value)}
                      className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="password_confirmation"
                      value={data.password_confirmation}
                      onChange={e => setData('password_confirmation', e.target.value)}
                      className="w-full px-4 py-3 bg-blue-900/30 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      onChange={e => {
                        setAcceptedTerms(e.target.checked);
                        setData('terms', e.target.checked);
                      }}
                      className="w-4 h-4 bg-blue-900/30 border-cyan-500/20 rounded text-cyan-400 focus:ring-cyan-400"
                      required
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="terms" className="text-gray-300">
                      I agree to the{' '}
                      <a href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing || !acceptedTerms}
                  className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors duration-300 ${
                    processing || !acceptedTerms
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600'
                  }`}
                >
                  {processing ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
