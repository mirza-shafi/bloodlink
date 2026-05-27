import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { User, Heart, Droplets, MapPin, Calendar, Award, Edit, Save, Camera, Phone, X } from 'lucide-react';

const bangladeshLocations = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi',
  'Khulna', 'Barisal', 'Mymensingh', 'Rangpur',
  'Comilla', 'Narayanganj', 'Gazipur', 'Tangail',
  'Faridpur', 'Jessore', "Cox's Bazar", 'Noakhali',
  'Brahmanbaria', 'Bogura', 'Pabna', 'Dinajpur',
  'Rangamati', 'Bandarban', 'Khagrachari', 'Feni',
];

export default function Profile() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    currentLocation: user?.currentLocation || '',
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const isDonor = user?.role === 'DONOR';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      // Call PUT /api/auth/profile to persist changes
      const res = await authApi.updateProfile({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        currentLocation: form.currentLocation,
        profilePhoto: avatarPreview || user?.profilePhoto || '',
        role: user?.role as any,
      });

      if (res.success && res.data) {
        // Update user context
        updateUser(res.data);
        setAvatarPreview(null);
        setSaveSuccess(true);
        setEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.message || 'Failed to save profile. Please try again.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = avatarPreview || user?.profilePhoto || '/avatar-male.jpg';
  const displayLocation = user?.currentLocation || form.currentLocation || 'Location not set';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
            ✓ Profile updated successfully!
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            ✗ {saveError}
          </div>
        )}

        {/* Profile Header */}
        <Card className="rounded-2xl overflow-hidden mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="h-36 bg-gradient-to-r from-[#D62828] via-[#b52020] to-[#9D0208] relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full" />
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-4 flex items-end justify-between">
              <div className="relative">
                <img
                  src={currentAvatar}
                  alt={user?.fullName}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                />
                {editing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-8 h-8 bg-[#D62828] hover:bg-[#9D0208] rounded-full flex items-center justify-center shadow-lg transition-all"
                    title="Change photo"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditing(false); setAvatarPreview(null); setSaveError(''); }}
                      className="rounded-xl border-gray-200 dark:border-gray-700"
                    >
                      <X className="w-4 h-4 mr-1" />Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-xl bg-[#D62828] hover:bg-[#9D0208] text-white"
                    >
                      {saving ? (
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <><Save className="w-4 h-4 mr-1" />Save</>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditing(true); setForm({ fullName: user?.fullName || '', phoneNumber: user?.phoneNumber || '', currentLocation: user?.currentLocation || '' }); }}
                    className="rounded-xl border-gray-200 dark:border-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-1" />Edit Profile
                  </Button>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.fullName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge className="bg-red-100 dark:bg-red-950/40 text-[#D62828] dark:text-red-400 hover:bg-red-100 border-0">
                  {user?.role}
                </Badge>
                {isDonor && (user as any)?.bloodGroup && (
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border-0">
                    {(user as any).bloodGroup}
                  </Badge>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D62828]" />
                  {displayLocation}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full justify-start h-auto p-1 gap-1">
            <TabsTrigger value="info" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-[#D62828] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <User className="w-4 h-4 mr-2" />Profile Info
            </TabsTrigger>
            {isDonor && (
              <TabsTrigger value="donations" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-[#D62828] data-[state=active]:text-white data-[state=active]:shadow-sm">
                <Heart className="w-4 h-4 mr-2" />Donations
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-[#D62828] data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Award className="w-4 h-4 mr-2" />Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              {editing ? (
                <div className="space-y-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Edit Your Details</h3>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      value={form.fullName}
                      onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                      className="mt-1 rounded-xl border-gray-200 dark:border-gray-600"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                    <Input
                      value={form.phoneNumber}
                      onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                      className="mt-1 rounded-xl border-gray-200 dark:border-gray-600"
                      placeholder="+880 1711-000000"
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Format: +880 1X-XXXXXXXX</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</Label>
                    <select
                      value={form.currentLocation}
                      onChange={e => setForm(p => ({ ...p, currentLocation: e.target.value }))}
                      className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                    >
                      <option value="">Select your district</option>
                      {bangladeshLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {avatarPreview && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      New profile photo selected. Click Save to apply.
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center">
                        <span className="text-[10px] text-[#D62828]">@</span>
                      </span>
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#D62828]" />
                      {user?.phoneNumber || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">Gender</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.gender || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">Age</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.age ? `${user.age} years` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#D62828]" />
                      {user?.currentLocation || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">Member Since</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D62828]" />
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A'}
                    </p>
                  </div>
                  {isDonor && (user as any)?.bloodGroup && (
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">Blood Group</p>
                      <span className="inline-block px-3 py-1 bg-[#D62828] text-white text-sm font-bold rounded-lg">
                        {(user as any).bloodGroup}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {isDonor && (
            <TabsContent value="donations">
              <Card className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-xl">
                    <p className="text-2xl font-bold text-[#D62828]">{(user as any)?.donationCount || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Donations</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.floor(((user as any)?.donationCount || 0) * 0.8)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Lives Saved</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Active</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Status</p>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#D62828]" />Donation History
                </h3>
                <div className="space-y-3">
                  {[
                    { date: '2024-11-01', location: 'Dhaka Medical College Hospital', type: (user as any)?.bloodGroup || 'O+', units: 1 },
                    { date: '2024-08-15', location: 'Square Hospital, Dhaka', type: (user as any)?.bloodGroup || 'O+', units: 1 },
                    { date: '2024-05-20', location: 'Chittagong Medical College', type: (user as any)?.bloodGroup || 'O+', units: 2 },
                  ].map((donation, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{donation.location}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(donation.date).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 dark:bg-red-950/40 text-[#D62828] dark:text-red-400 border-0">{donation.type}</Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{donation.units} unit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="settings">
            <Card className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Account Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Change Password</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">Change</Button>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage notification preferences</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">Manage</Button>
                </div>
                {isDonor && (
                  <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-green-700 dark:text-green-400">Availability Status</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Toggle your donation availability</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl border-green-300 text-green-600">Toggle</Button>
                  </div>
                )}
                <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950/20 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-red-600 dark:text-red-400">Delete Account</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete your account</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl text-red-600 border-red-300 hover:bg-red-100">Delete</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
