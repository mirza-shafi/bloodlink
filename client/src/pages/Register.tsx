import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, AlertCircle } from 'lucide-react';
import { UserRole, BloodGroup, Gender } from '@/types';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(UserRole.DONOR);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phoneNumber: '',
    gender: '', age: '', currentLocation: '',
    bloodGroup: '', requiredBloodGroup: '', hospitalName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const request = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        role,
        gender: form.gender ? Gender[form.gender as keyof typeof Gender] : undefined,
        age: form.age ? parseInt(form.age) : undefined,
        currentLocation: form.currentLocation,
        bloodGroup: role === UserRole.DONOR && form.bloodGroup ? BloodGroup[form.bloodGroup as keyof typeof BloodGroup] : undefined,
        requiredBloodGroup: role === UserRole.PATIENT && form.requiredBloodGroup ? BloodGroup[form.requiredBloodGroup as keyof typeof BloodGroup] : undefined,
        hospitalName: role === UserRole.PATIENT ? form.hospitalName : undefined,
      };
      const success = await register(request);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Registration failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-transparent flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Heart className="w-8 h-8 text-[#D62828] fill-[#D62828]" />
            <span className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
              Blood<span className="text-[#D62828]">Link</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-[#1A1A1A] dark:text-white">Create your account</h1>
          <p className="text-sm text-[#555555] dark:text-zinc-400 mt-1">Join our life-saving community</p>
        </div>

        <Card className="p-8 rounded-none shadow-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">I want to register as:</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setRole(UserRole.DONOR); setStep(2); }}
                  className={`p-6 border-2 text-center transition-all ${
                    role === UserRole.DONOR ? 'border-[#D62828] bg-red-50 dark:bg-red-950/20' : 'border-gray-200 dark:border-zinc-800 hover:border-[#D62828] dark:hover:border-red-400'
                  }`}
                >
                  <Heart className="w-8 h-8 mx-auto mb-2 text-[#D62828]" />
                  <p className="font-semibold text-[#1A1A1A] dark:text-white">Donor</p>
                  <p className="text-xs text-[#555555] dark:text-zinc-400 mt-1">I want to donate blood</p>
                </button>
                <button
                  onClick={() => { setRole(UserRole.PATIENT); setStep(2); }}
                  className={`p-6 border-2 text-center transition-all ${
                    role === UserRole.PATIENT ? 'border-[#D62828] bg-red-50 dark:bg-red-950/20' : 'border-gray-200 dark:border-zinc-800 hover:border-[#D62828] dark:hover:border-red-400'
                  }`}
                >
                  <Heart className="w-8 h-8 mx-auto mb-2 text-[#D62828] fill-[#D62828]" />
                  <p className="font-semibold text-[#1A1A1A] dark:text-white">Patient</p>
                  <p className="text-xs text-[#555555] dark:text-zinc-400 mt-1">I need blood donation</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Full Name</Label>
                  <Input value={form.fullName} onChange={e => updateField('fullName', e.target.value)}
                    placeholder="John Doe" className="mt-1 rounded-none" required />
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)}
                    placeholder="john@email.com" className="mt-1 rounded-none" required />
                </div>
              </div>
              <div>
                <Label className="text-sm">Password</Label>
                <Input type="password" value={form.password} onChange={e => updateField('password', e.target.value)}
                  placeholder="Min 6 characters" className="mt-1 rounded-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Phone</Label>
                  <Input value={form.phoneNumber} onChange={e => updateField('phoneNumber', e.target.value)}
                    placeholder="+1-555-0000" className="mt-1 rounded-none" />
                </div>
                <div>
                  <Label className="text-sm">Age</Label>
                  <Input type="number" value={form.age} onChange={e => updateField('age', e.target.value)}
                    placeholder="25" className="mt-1 rounded-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Gender</Label>
                  <Select onValueChange={v => updateField('gender', v)}>
                    <SelectTrigger className="mt-1 rounded-none">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Location</Label>
                  <Input value={form.currentLocation} onChange={e => updateField('currentLocation', e.target.value)}
                    placeholder="City, State" className="mt-1 rounded-none" />
                </div>
              </div>

              {role === UserRole.DONOR && (
                <div>
                  <Label className="text-sm">Blood Group</Label>
                  <Select onValueChange={v => updateField('bloodGroup', v)}>
                    <SelectTrigger className="mt-1 rounded-none">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(BloodGroup).map(bg => (
                        <SelectItem key={bg} value={bg}>{BloodGroup[bg as keyof typeof BloodGroup]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {role === UserRole.PATIENT && (
                <>
                  <div>
                    <Label className="text-sm">Required Blood Group</Label>
                    <Select onValueChange={v => updateField('requiredBloodGroup', v)}>
                      <SelectTrigger className="mt-1 rounded-none">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(BloodGroup).map(bg => (
                          <SelectItem key={bg} value={bg}>{BloodGroup[bg as keyof typeof BloodGroup]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Hospital Name</Label>
                    <Input value={form.hospitalName} onChange={e => updateField('hospitalName', e.target.value)}
                      placeholder="Hospital name" className="mt-1 rounded-none" />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}
                  className="flex-1 rounded-none">Back</Button>
                <Button type="submit" disabled={loading}
                  className="flex-1 bg-[#D62828] hover:bg-[#9D0208] text-white rounded-none py-5">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-[#555555] dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#D62828] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
