import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, Menu, X, User, LogOut, MessageSquare, Bell, Search, Moon, Sun, Shield } from 'lucide-react';
import { UserRole } from '@/types';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Find Donors', icon: Search },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/chat', label: 'Messages', icon: MessageSquare },
    { path: '/about', label: 'About' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-7 h-7 text-[#D62828] fill-[#D62828]" />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Blood<span className="text-[#D62828]">Link</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-[#D62828] bg-red-50 dark:bg-red-950'
                    : 'text-gray-600 dark:text-gray-300 hover:text-[#D62828] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === UserRole.ADMIN && (
              <Link
                to="/admin"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1 ${
                  isActive('/admin')
                    ? 'text-[#D62828] bg-red-50 dark:bg-red-950'
                    : 'text-gray-600 dark:text-gray-300 hover:text-[#D62828] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Shield className="w-4 h-4" />Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-[#D62828] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-[#D62828] transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#D62828] rounded-full" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      {user?.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D62828] to-[#9D0208] flex items-center justify-center text-white text-sm font-bold">
                          {user?.fullName?.charAt(0) ?? 'U'}
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="dark:hover:bg-gray-700 dark:text-gray-200">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="dark:hover:bg-gray-700 dark:text-gray-200">
                      <Heart className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    {user?.role === UserRole.ADMIN && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="dark:hover:bg-gray-700 dark:text-gray-200">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-gray-600 dark:text-gray-300">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/register')} className="bg-[#D62828] hover:bg-[#9D0208] text-white">
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-700">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 text-sm font-medium rounded-md ${
                  isActive(link.path)
                    ? 'text-[#D62828] bg-red-50 dark:bg-red-950'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === UserRole.ADMIN && (
              <Link
                to="/admin"
                className="block px-4 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Shield className="w-4 h-4" />Admin Panel
              </Link>
            )}
            {!isAuthenticated && (
              <div className="mt-4 px-4 flex flex-col gap-2">
                <Button variant="outline" onClick={() => { navigate('/login'); setMobileOpen(false); }} className="w-full">
                  Sign In
                </Button>
                <Button onClick={() => { navigate('/register'); setMobileOpen(false); }} className="w-full bg-[#D62828] hover:bg-[#9D0208] text-white">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
