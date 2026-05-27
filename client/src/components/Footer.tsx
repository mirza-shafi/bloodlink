import { Link } from 'react-router';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-[#D62828] fill-[#D62828]" />
              <span className="text-lg font-bold">Blood<span className="text-[#D62828]">Link</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting blood donors with patients in need through AI-powered matching technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-sm text-gray-400 hover:text-white transition-colors">Find Donors</Link></li>
              <li><Link to="/register" className="text-sm text-gray-400 hover:text-white transition-colors">Become a Donor</Link></li>
              <li><Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">Blood Type Guide</span></li>
              <li><span className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">Eligibility Criteria</span></li>
              <li><span className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">FAQs</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-400">support@bloodlink.org</span></li>
              <li><span className="text-sm text-gray-400">1-800-BLOODLINK</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; 2025 BloodLink. All rights reserved. Built with Java Spring Boot & React.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">Privacy Policy</span>
            <span className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
