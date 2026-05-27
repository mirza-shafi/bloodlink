import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Heart, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; password?: string } | null;
  const { login } = useAuth();
  const [email, setEmail] = useState(state?.email || '');
  const [password, setPassword] = useState(state?.password || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state?.email) setEmail(state.email);
    if (state?.password) setPassword(state.password);
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login({ email, password });
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-transparent flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Heart className="w-8 h-8 text-[#D62828] fill-[#D62828]" />
            <span className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
              Blood<span className="text-[#D62828]">Link</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-[#1A1A1A] dark:text-white">Welcome back</h1>
          <p className="text-sm text-[#555555] dark:text-zinc-400 mt-1">Sign in to your account</p>
        </div>

        <Card className="p-8 rounded-none shadow-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[#1A1A1A] dark:text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="mt-1 rounded-none"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-[#1A1A1A] dark:text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 rounded-none"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D62828] hover:bg-[#9D0208] text-white rounded-none py-5"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
            <p className="text-xs text-[#555555] dark:text-zinc-400 text-center mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => { setEmail('john.donor@email.com'); setPassword('password'); }}
                className="p-2 bg-gray-50 dark:bg-zinc-850 hover:bg-gray-100 dark:hover:bg-zinc-800 text-left text-[#555555] dark:text-zinc-300 transition-colors border border-transparent dark:border-zinc-700">
                Donor: john.donor@email.com
              </button>
              <button onClick={() => { setEmail('alice.need@email.com'); setPassword('password'); }}
                className="p-2 bg-gray-50 dark:bg-zinc-850 hover:bg-gray-100 dark:hover:bg-zinc-800 text-left text-[#555555] dark:text-zinc-300 transition-colors border border-transparent dark:border-zinc-700">
                Patient: alice.need@email.com
              </button>
            </div>
          </div>
        </Card>

        <p className="mt-6 text-center text-sm text-[#555555] dark:text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#D62828] font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
