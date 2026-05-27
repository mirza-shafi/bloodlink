import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Globe, Droplets, Users, MapPin, Phone, Lock, X } from 'lucide-react';

export default function About() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const ok = await login({ email: loginForm.email, password: loginForm.password });
      if (ok) {
        setShowLoginModal(false);
        navigate('/admin');
      } else {
        setLoginError('Invalid email or password. Please try again.');
      }
    } catch {
      setLoginError('Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
            <Heart className="w-8 h-8 text-[#D62828] fill-[#D62828]" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            About Blood<span className="text-[#D62828]">Link</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto">
            Bangladesh's first AI-powered blood donation platform, bridging the gap between donors and patients in real-time.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {[
            { icon: Users, value: '5,000+', label: 'Registered Donors', sub: 'Across Bangladesh' },
            { icon: Droplets, value: '12,000+', label: 'Blood Units Donated', sub: 'Lives saved' },
            { icon: MapPin, value: '64', label: 'Districts Covered', sub: 'All divisions' },
          ].map(stat => (
            <div key={stat.label} className="text-center bg-white dark:bg-zinc-900/60 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-6">
              <stat.icon className="w-6 h-6 text-[#D62828] mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{stat.label}</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-8 hover:shadow-lg transition-all rounded-none">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-[#D62828]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-light">
              To make blood donation accessible across every district in Bangladesh — from Dhaka, Chittagong, Sylhet, Rajshahi to the most remote areas. Using AI-powered matching algorithms to find the right donor in critical moments.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-8 hover:shadow-lg transition-all rounded-none">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#D62828]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Platform Integrity</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-light">
              All donors and patients are verified and screened. We maintain the highest safety standards following DGDA (Directorate General of Drug Administration) guidelines to ensure a trustworthy platform.
            </p>
          </div>
        </div>

        {/* Features / Details */}
        <div className="bg-gray-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-8 mb-16 rounded-none">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Core Platform Features</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D62828] mb-1">AI Match</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                Matches based on blood group compatibility, location proximity, and donation history analysis.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D62828] mb-1">Real-Time Chat</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                Instant communication between patients and donors to coordinate logistics quickly.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D62828] mb-1">64 Districts</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                Active donor network covering all 64 districts of Bangladesh.
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Area */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-8 mb-16 rounded-none">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#D62828]" />
            Coverage Areas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Mymensingh', 'Rangpur'].map(city => (
              <div key={city} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20">
                <div className="w-2 h-2 bg-[#D62828] rounded-full" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{city}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">+ 56 more districts</p>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-6 mb-16 rounded-none flex items-center gap-4">
          <Phone className="w-8 h-8 text-[#D62828] flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">Emergency Helpline</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Blood emergency contact: <span className="font-bold text-[#D62828]">16108</span> (National Blood Helpline, Bangladesh)</p>
          </div>
        </div>

        {/* OOP Course Context Section */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-12 text-center mb-16">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Project Context</h4>
          <p className="text-xs text-gray-500 dark:text-gray-500 font-light max-w-lg mx-auto">
            This application is built as part of an Object-Oriented Programming (OOP) course. It demonstrates software engineering principles including Polymorphism, Inheritance (Hibernate Single Table Inheritance), Encapsulation, and the MVC architectural pattern.
          </p>
        </div>

        {/* Admin Login Button — requires credentials */}
        <div className="flex flex-col items-center pt-8 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] text-gray-400 dark:text-gray-600 mb-2 font-mono">Admin Access</span>
          <Button
            onClick={() => { setShowLoginModal(true); setLoginError(''); setLoginForm({ email: '', password: '' }); }}
            size="sm"
            variant="outline"
            className="text-[11px] h-8 px-3 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-[#D62828] hover:border-[#D62828] dark:hover:text-[#F35C5C] dark:hover:border-[#F35C5C] rounded-none bg-transparent hover:bg-red-50/20"
          >
            <Lock className="w-3 h-3 mr-1.5" />
            Login as Admin
          </Button>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#D62828] to-[#9D0208] rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Admin Login</h2>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="p-5 space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-xs">
                  {loginError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@bloodlink.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#D62828] hover:bg-[#9D0208] text-white text-sm font-medium transition-all disabled:opacity-60"
                >
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
