import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { donorApi, aiApi, chatApi, requestApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { Donor } from '@/types';
import { BloodGroup, AvailabilityStatus } from '@/types';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, MapPin, Heart, Droplets, Star, MessageSquare, Filter, Zap } from 'lucide-react';

export default function Search() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [aiDonors, setAiDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    location: '',
    availableOnly: false,
  });

  const [selectedDonorForRequest, setSelectedDonorForRequest] = useState<Donor | null>(null);
  const [requestForm, setRequestForm] = useState({
    unitsRequired: 1,
    hospitalName: '',
    hospitalAddress: '',
    emergencyLevel: 'MEDIUM',
    requiredDate: '',
    message: '',
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDonors();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadAIRecommendations(user.id);
    }
  }, [user]);

  const loadDonors = async () => {
    setLoading(true);
    setError('');
    const res = await donorApi.getAllDonors();
    if (res.success && res.data) setDonors(res.data);
    else if (!res.success) setError(res.message || 'Failed to load donors');
    setLoading(false);
  };

  const loadAIRecommendations = async (patientId: number) => {
    const res = await aiApi.recommendDonors(patientId, 6);
    if (res.success && res.data) setAiDonors(res.data);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    const res = await donorApi.searchDonors({
      bloodGroup: filters.bloodGroup ? BloodGroup[filters.bloodGroup as keyof typeof BloodGroup] : undefined,
      location: filters.location || undefined,
      availableOnly: filters.availableOnly || undefined,
    });
    if (res.success && res.data) setDonors(res.data);
    else if (!res.success) setError(res.message || 'Search failed');
    setLoading(false);
  };

  const handleChat = async (donorId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await chatApi.createChat(user?.id || 0, donorId);
    if (res.success) {
      navigate('/chat');
    }
  };

  const handleOpenRequest = (donor: Donor) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedDonorForRequest(donor);
    setRequestForm({
      unitsRequired: 1,
      hospitalName: '',
      hospitalAddress: '',
      emergencyLevel: 'MEDIUM',
      requiredDate: '',
      message: '',
    });
    setRequestSuccess(false);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorForRequest) return;
    setRequestLoading(true);
    try {
      const res = await requestApi.createRequest({
        donorId: selectedDonorForRequest.id,
        bloodGroup: selectedDonorForRequest.bloodGroup,
        unitsRequired: requestForm.unitsRequired,
        hospitalName: requestForm.hospitalName,
        hospitalAddress: requestForm.hospitalAddress,
        emergencyLevel: requestForm.emergencyLevel as any,
        requiredDate: requestForm.requiredDate,
        message: requestForm.message,
      });
      if (res.success) {
        setRequestSuccess(true);
        setTimeout(() => {
          setSelectedDonorForRequest(null);
        }, 1500);
      } else {
        alert(res.message || 'Failed to send request');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while sending request');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] dark:text-white">Find Blood Donors</h1>
          <p className="text-[#555555] dark:text-gray-400 mt-1">Search and connect with verified blood donors</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <span>⚠</span> {error}
            <button onClick={() => setError('')} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}

        {/* Search Filters */}
        <Card className="p-6 rounded-none mb-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-[#1A1A1A] dark:text-zinc-300 mb-1 block">Blood Group</label>
              <Select onValueChange={v => setFilters(p => ({ ...p, bloodGroup: v }))}>
                <SelectTrigger className="rounded-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {Object.keys(BloodGroup).map(bg => (
                    <SelectItem key={bg} value={bg}>{BloodGroup[bg as keyof typeof BloodGroup]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A1A] dark:text-zinc-300 mb-1 block">Location</label>
              <Input
                placeholder="e.g. Dhaka, Chittagong, Sylhet..."
                value={filters.location}
                onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}
                className="rounded-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1A1A] dark:text-zinc-300 mb-1 block">Availability</label>
              <Select onValueChange={v => setFilters(p => ({ ...p, availableOnly: v === 'true' }))}>
                <SelectTrigger className="rounded-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-gray-900 dark:text-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <SelectItem value="false">All Donors</SelectItem>
                  <SelectItem value="true">Available Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading}
                className="w-full bg-[#D62828] hover:bg-[#9D0208] text-white rounded-none">
                <Filter className="w-4 h-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white dark:bg-zinc-950 rounded-none border-b border-b-zinc-200 dark:border-b-zinc-800 w-full justify-start h-auto p-0">
            <TabsTrigger value="all" className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#D62828]">
              <SearchIcon className="w-4 h-4 mr-2" />All Donors ({donors.length})
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#D62828]">
              <Zap className="w-4 h-4 mr-2" />AI Recommendations ({aiDonors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {donors.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {donors.map(donor => (
                  <DonorCard
                    key={donor.id}
                    donor={donor}
                    onChat={() => handleChat(donor.id)}
                    onRequest={() => handleOpenRequest(donor)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-[#555555]">
                <Droplets className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No donors found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            {aiDonors.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiDonors.map(donor => (
                  <DonorCard
                    key={donor.id}
                    donor={donor}
                    onChat={() => handleChat(donor.id)}
                    onRequest={() => handleOpenRequest(donor)}
                    showScore
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-[#555555]">
                <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>AI recommendations loading...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Blood Request Modal */}
        {selectedDonorForRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full mx-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 rounded-none text-gray-900 dark:text-white">
              {requestSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Request Sent Successfully!</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-light">The donor has been notified and will review your request.</p>
                </div>
              ) : (
                <form onSubmit={handleSendRequest} className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Request Blood</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedDonorForRequest(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/20 p-3 flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-[#D62828]" />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Donor:</span>{' '}
                      <span className="text-gray-900 dark:text-white font-medium">{selectedDonorForRequest.fullName}</span>
                      <span className="mx-2 text-zinc-400 dark:text-zinc-700">|</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Blood Group:</span>{' '}
                      <span className="bg-[#D62828] text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {selectedDonorForRequest.bloodGroup}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-650 dark:text-gray-450 mb-1 block">
                        Units Required
                      </label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={requestForm.unitsRequired}
                        onChange={e => setRequestForm(p => ({ ...p, unitsRequired: parseInt(e.target.value) || 1 }))}
                        className="rounded-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-650 dark:text-gray-450 mb-1 block">
                        Emergency Level
                      </label>
                      <select
                        value={requestForm.emergencyLevel}
                        onChange={e => setRequestForm(p => ({ ...p, emergencyLevel: e.target.value }))}
                        className="w-full h-10 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828] rounded-none text-gray-900 dark:text-white"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-650 dark:text-gray-450 mb-1 block">
                      Hospital Name
                    </label>
                    <Input
                      placeholder="e.g. Mount Sinai Hospital"
                      required
                      value={requestForm.hospitalName}
                      onChange={e => setRequestForm(p => ({ ...p, hospitalName: e.target.value }))}
                      className="rounded-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-650 dark:text-gray-450 mb-1 block">
                      Hospital Address
                    </label>
                    <Input
                      placeholder="e.g. 123 Main St, City"
                      required
                      value={requestForm.hospitalAddress}
                      onChange={e => setRequestForm(p => ({ ...p, hospitalAddress: e.target.value }))}
                      className="rounded-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-650 dark:text-gray-450 mb-1 block">
                      Required Date
                    </label>
                    <Input
                      type="date"
                      required
                      value={requestForm.requiredDate}
                      onChange={e => setRequestForm(p => ({ ...p, requiredDate: e.target.value }))}
                      className="rounded-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-650 dark:text-gray-450 mb-1 block">
                      Message
                    </label>
                    <textarea
                      placeholder="Explain your medical condition or request urgency..."
                      rows={3}
                      value={requestForm.message}
                      onChange={e => setRequestForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full p-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] rounded-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedDonorForRequest(null)}
                      className="flex-1 rounded-none border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={requestLoading}
                      className="flex-1 bg-[#D62828] hover:bg-[#9D0208] text-white rounded-none"
                    >
                      {requestLoading ? 'Sending...' : 'Send Request'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function DonorCard({ donor, onChat, onRequest, showScore }: { donor: Donor; onChat: () => void; onRequest: () => void; showScore?: boolean }) {
  return (
    <Card className="p-5 rounded-none hover:shadow-lg transition-all group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img src={donor.profilePhoto || '/avatar-male.jpg'} alt={donor.fullName}
            className="w-14 h-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
            donor.availabilityStatus === AvailabilityStatus.AVAILABLE ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#D62828] dark:group-hover:text-[#F35C5C] transition-colors">
                {donor.fullName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-red-100 dark:bg-red-950/40 text-[#D62828] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 border-0">{donor.bloodGroup}</Badge>
                {showScore && donor.matchScore && (
                  <Badge className="bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/40 flex items-center gap-1 border-0">
                    <Star className="w-3 h-3 fill-yellow-600 dark:fill-yellow-500" />{donor.matchScore}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-2">
            <MapPin className="w-3 h-3" />{donor.currentLocation}
          </p>
          {donor.distance !== undefined && donor.distance !== null && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{donor.distance.toFixed(1)} km away</p>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <Heart className="w-3 h-3 text-[#D62828]" />
          {donor.donationCount} donations
        </div>
        {donor.emergencyAvailable && (
          <Badge className="bg-[#D62828] dark:bg-red-700 text-white text-xs border-0">24/7 Emergency</Badge>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" className="flex-1 bg-[#D62828] hover:bg-[#9D0208] text-white rounded-none border-0"
          onClick={onChat}>
          <MessageSquare className="w-4 h-4 mr-1" />Chat
        </Button>
        <Button size="sm" variant="outline" className="flex-1 rounded-none border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300"
          onClick={onRequest}>
          Request
        </Button>
      </div>
    </Card>
  );
}
