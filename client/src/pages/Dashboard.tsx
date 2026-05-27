import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { donorApi, requestApi, notificationApi } from '@/services/api';
import type { Donor, BloodRequest, Notification } from '@/types';
import { UserRole, RequestStatus, AvailabilityStatus } from '@/types';
import { Heart, Droplets, MapPin, Calendar, Activity, CheckCircle, XCircle, Clock, Bell, MessageSquare, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({ totalDonors: 0, activeRequests: 0, completed: 0, pending: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    const donorsRes = await donorApi.getAllDonors();
    if (donorsRes.success) {
      setDonors(donorsRes.data);
      setStats(prev => ({ ...prev, totalDonors: donorsRes.data.length }));
    }

    if (user?.role === UserRole.PATIENT) {
      const reqRes = await requestApi.getRequestsByPatient(user.id);
      if (reqRes.success) {
        setRequests(reqRes.data);
        setStats(prev => ({
          ...prev,
          activeRequests: reqRes.data.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.ACCEPTED).length,
          completed: reqRes.data.filter(r => r.status === RequestStatus.COMPLETED).length,
          pending: reqRes.data.filter(r => r.status === RequestStatus.PENDING).length,
        }));
      }
    } else {
      const reqRes = await requestApi.getRequestsByDonor(user?.id || 1);
      if (reqRes.success) {
        setRequests(reqRes.data);
        setStats(prev => ({
          ...prev,
          activeRequests: reqRes.data.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.ACCEPTED).length,
          completed: reqRes.data.filter(r => r.status === RequestStatus.COMPLETED).length,
          pending: reqRes.data.filter(r => r.status === RequestStatus.PENDING).length,
        }));
      }
    }

    const notifRes = await notificationApi.getUserNotifications();
    if (notifRes.success) setNotifications(notifRes.data);
  };

  const handleAccept = async (id: number) => {
    const res = await requestApi.acceptRequest(id);
    if (res.success) loadData();
  };

  const handleDecline = async (id: number) => {
    const res = await requestApi.declineRequest(id);
    if (res.success) loadData();
  };

  const handleComplete = async (id: number) => {
    const res = await requestApi.completeRequest(id);
    if (res.success) loadData();
  };

  if (!isAuthenticated) return null;

  const isDonor = user?.role === UserRole.DONOR;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] dark:text-white">Dashboard</h1>
          <p className="text-[#555555] dark:text-zinc-400 mt-1">Welcome back, {user?.fullName}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-[#D62828]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{stats.totalDonors}</p>
                <p className="text-xs text-[#555555] dark:text-zinc-400">Total Donors</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{stats.activeRequests}</p>
                <p className="text-xs text-[#555555] dark:text-zinc-400">Active Requests</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{stats.completed}</p>
                <p className="text-xs text-[#555555] dark:text-zinc-400">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{stats.pending}</p>
                <p className="text-xs text-[#555555] dark:text-zinc-400">Pending</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="bg-white dark:bg-zinc-950 rounded-none border-b border-zinc-200 dark:border-zinc-800 w-full justify-start h-auto p-0">
                <TabsTrigger value="requests" className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#D62828]">
                  <Activity className="w-4 h-4 mr-2" />Requests
                </TabsTrigger>
                <TabsTrigger value="donors" className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#D62828]">
                  <Droplets className="w-4 h-4 mr-2" />Donors
                </TabsTrigger>
                {isDonor && (
                  <TabsTrigger value="availability" className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#D62828]">
                    <TrendingUp className="w-4 h-4 mr-2" />Availability
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="requests" className="space-y-4">
                {requests.length > 0 ? requests.map(req => (
                  <Card key={req.id} className="p-5 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${
                            req.status === RequestStatus.PENDING ? 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400' :
                            req.status === RequestStatus.ACCEPTED ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' :
                            req.status === RequestStatus.DECLINED ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          } border-0`}>
                            {req.status}
                          </Badge>
                          <Badge variant="outline" className="text-[#D62828] dark:text-red-400 border-[#D62828] dark:border-red-400">{req.bloodGroup}</Badge>
                        </div>
                        <p className="font-medium text-[#1A1A1A] dark:text-white">{isDonor ? req.patientName : req.donorName}</p>
                        <p className="text-sm text-[#555555] dark:text-zinc-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />{req.hospitalName}
                        </p>
                        <p className="text-xs text-[#555555] dark:text-zinc-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />{new Date(req.createdAt).toLocaleDateString()}
                        </p>
                        {req.message && <p className="text-sm text-[#555555] dark:text-zinc-400 mt-2 italic">&ldquo;{req.message}&rdquo;</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        {isDonor && req.status === RequestStatus.PENDING && (
                          <>
                            <Button size="sm" onClick={() => handleAccept(req.id)}
                              className="bg-[#D62828] hover:bg-[#9D0208] text-white rounded-none border-0">
                              <CheckCircle className="w-4 h-4 mr-1" />Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDecline(req.id)}
                              className="rounded-none border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                              <XCircle className="w-4 h-4 mr-1" />Decline
                            </Button>
                          </>
                        )}
                        {req.status === RequestStatus.ACCEPTED && (
                          <Button size="sm" onClick={() => handleComplete(req.id)}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-none border-0">
                            <CheckCircle className="w-4 h-4 mr-1" />Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-12 text-[#555555] dark:text-zinc-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
                    <p>No requests found</p>
                    <Button variant="outline" className="mt-3 rounded-none border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800" onClick={() => navigate('/search')}>
                      {isDonor ? 'View Requests' : 'Find Donors'}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="donors" className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {donors.slice(0, 6).map(donor => (
                    <Card key={donor.id} className="p-4 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-4">
                      <img src={donor.profilePhoto || '/avatar-male.jpg'} alt={donor.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-100 dark:border-zinc-800" />
                      <div className="flex-1">
                        <p className="font-medium text-[#1A1A1A] dark:text-white text-sm">{donor.fullName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-red-100 dark:bg-red-950/40 text-[#D62828] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 text-xs border-0">{donor.bloodGroup}</Badge>
                          <span className="text-xs text-[#555555] dark:text-zinc-400">{donor.currentLocation}</span>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        donor.availabilityStatus === AvailabilityStatus.AVAILABLE ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {isDonor && (
                <TabsContent value="availability">
                  <Card className="p-6 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-4">Update Availability Status</h3>
                    <div className="flex gap-3">
                      <Button onClick={() => donorApi.updateAvailability(user?.id || 1, AvailabilityStatus.AVAILABLE).then(loadData)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-none border-0">
                        <CheckCircle className="w-4 h-4 mr-2" />Available
                      </Button>
                      <Button variant="outline" onClick={() => donorApi.updateAvailability(user?.id || 1, AvailabilityStatus.UNAVAILABLE).then(loadData)}
                        className="rounded-none border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                        <XCircle className="w-4 h-4 mr-2" />Unavailable
                      </Button>
                    </div>
                    <p className="text-sm text-[#555555] dark:text-zinc-400 mt-4">
                      Current status:{' '}
                      <span className={donors.find(d => d.id === user?.id)?.availabilityStatus === AvailabilityStatus.AVAILABLE
                        ? 'text-green-600 dark:text-green-450 font-medium' : 'text-gray-500 dark:text-zinc-400 font-medium'}>
                        {donors.find(d => d.id === user?.id)?.availabilityStatus || 'AVAILABLE'}
                      </span>
                    </p>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-5 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />Notifications
              </h3>
              <div className="space-y-3">
                {notifications.slice(0, 5).map(notif => (
                  <div key={notif.id} className={`p-3 text-sm ${!notif.isRead ? 'bg-red-50 dark:bg-red-950/20 border-l-2 border-l-[#D62828]' : 'bg-gray-50 dark:bg-zinc-800/40'}`}>
                    <p className="font-medium text-[#1A1A1A] dark:text-white">{notif.title}</p>
                    <p className="text-xs text-[#555555] dark:text-zinc-400 mt-1">{notif.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-sm text-[#555555] dark:text-zinc-400">No notifications</p>}
              </div>
            </Card>

            <Card className="p-5 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start rounded-none border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => navigate('/search')}>
                  <Droplets className="w-4 h-4 mr-2" />Find Donors
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-none border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => navigate('/chat')}>
                  <MessageSquare className="w-4 h-4 mr-2" />Messages
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-none border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => navigate('/profile')}>
                  <Heart className="w-4 h-4 mr-2" />My Profile
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
