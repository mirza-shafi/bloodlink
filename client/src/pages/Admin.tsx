import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { adminApi } from '@/services/api';
import type { AdminDashboardStats, Donor } from '@/types';
import { UserRole } from '@/types';
import {
  Users, Droplets, Activity, CheckCircle, Clock, TrendingUp,
  Trash2, UserCheck, UserX, Plus, X, AlertCircle, RefreshCw, Shield,
  Heart, MapPin, Phone, Mail
} from 'lucide-react';

// Blood group color map
const bgColors: Record<string, string> = {
  'A+': '#e74c3c', 'A-': '#c0392b',
  'B+': '#e67e22', 'B-': '#d35400',
  'AB+': '#9b59b6', 'AB-': '#8e44ad',
  'O+': '#2ecc71', 'O-': '#27ae60',
};

// Bangladesh divisions and districts
const bangladeshLocations = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi',
  'Khulna', 'Barisal', 'Mymensingh', 'Rangpur',
  'Comilla', 'Narayanganj', 'Gazipur',
  'Tangail', 'Faridpur', 'Jessore', "Cox's Bazar",
];

const bloodGroups = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const bgDisplayMap: Record<string, string> = {
  A_POS: 'A+', A_NEG: 'A-', B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-', O_POS: 'O+', O_NEG: 'O-',
};

interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  bloodGroup: string;
  currentLocation: string;
  age: string;
  role: 'DONOR' | 'PATIENT';
  requiredBloodGroup?: string;
  medicalCondition?: string;
  hospitalName?: string;
}

const defaultForm: CreateUserForm = {
  fullName: '', email: '', password: '',
  phoneNumber: '', bloodGroup: 'O_POS',
  currentLocation: '', age: '',
  role: 'DONOR',
};

// Simple SVG Bar Chart Component
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item) => (
        <div key={item.label} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.value}</span>
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{
              height: `${(item.value / max) * 96}px`,
              minHeight: item.value > 0 ? '4px' : '0',
              backgroundColor: item.color,
            }}
          />
          <span className="text-[9px] text-gray-500 dark:text-gray-400 text-center leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Simple SVG Donut Chart
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const radius = 40;
  const cx = 60, cy = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((seg, i) => {
          const ratio = seg.value / total;
          const strokeDasharray = `${ratio * circumference} ${circumference}`;
          const rotation = (cumulative / total) * 360 - 90;
          cumulative += seg.value;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset="0"
              transform={`rotate(${rotation} ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.7s ease' }}
            />
          );
        })}
        <circle cx={cx} cy={cy} r="28" fill="white" className="dark:fill-gray-800" />
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor" className="text-gray-900 dark:text-white">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="7" fill="#9ca3af">Total</text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-gray-600 dark:text-gray-400">{seg.label}</span>
            <span className="font-bold text-gray-900 dark:text-white ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple Line/Trend indicator
function TrendBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{value} <span className="text-gray-400 font-normal text-xs">/ {total}</span></span>
      </div>
      <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'donors' | 'patients'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(defaultForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Route guard — admin only
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== UserRole.ADMIN) { navigate('/dashboard'); return; }
    loadData();
  }, [isAuthenticated, user]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, donorsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAllDonors(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      setDonors(donorsRes.data ?? []);
    } catch (e: any) {
      setError(e.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await adminApi.createDonor({
        ...form,
        age: parseInt(form.age) || undefined,
      });
      setShowCreateModal(false);
      setForm(defaultForm);
      loadData();
    } catch (e: any) {
      setFormError(e.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await adminApi.deleteUser(userId);
      setConfirmDelete(null);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await adminApi.toggleUserStatus(userId);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to update status');
    }
  };

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) return null;

  const statCards = stats ? [
    { label: 'Total Donors', value: stats.totalDonors, icon: Users, color: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400' },
    { label: 'Total Patients', value: stats.totalPatients, icon: Activity, color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400' },
    { label: 'Available Donors', value: stats.availableDonors, icon: Droplets, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-700 dark:text-yellow-400' },
    { label: 'Completed', value: stats.completedRequests, icon: CheckCircle, color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-400' },
    { label: 'Active Users', value: stats.totalActiveUsers, icon: TrendingUp, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-400' },
  ] : [];

  const filteredDonors = donors.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.fullName?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.currentLocation?.toLowerCase().includes(q);
  });

  const bloodChartData = stats ? Object.entries(stats.bloodAvailability).map(([group, count]) => ({
    label: group,
    value: count as number,
    color: bgColors[group] || '#D62828',
  })) : [];

  const requestDonutData = stats ? [
    { label: 'Pending', value: stats.pendingRequests, color: '#f59e0b' },
    { label: 'Accepted', value: stats.acceptedRequests, color: '#10b981' },
    { label: 'Completed', value: stats.completedRequests, color: '#6366f1' },
    { label: 'Total', value: (stats.totalRequests - stats.pendingRequests - stats.acceptedRequests - stats.completedRequests), color: '#e5e7eb' },
  ].filter(d => d.value > 0) : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D62828] to-[#9D0208] rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">BloodLink Bangladesh — Platform Management & Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setForm(defaultForm); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#D62828] hover:bg-[#9D0208] text-white rounded-xl text-sm font-medium transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          {(['overview', 'donors', 'patients'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#D62828] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {statCards.map(card => (
                    <div key={card.label} className={`${card.bg} rounded-2xl p-5 border border-transparent hover:scale-[1.02] transition-transform duration-200`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                          <card.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`text-3xl font-bold ${card.text}`}>{card.value}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Blood Inventory Bar Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-[#D62828]" />
                      Blood Group Distribution
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Available donors by blood group</p>
                    {bloodChartData.length > 0 ? (
                      <BarChart data={bloodChartData} />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No data available</div>
                    )}
                  </div>

                  {/* Request Status Donut */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Request Status</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Overview of blood requests</p>
                    {requestDonutData.length > 0 ? (
                      <DonutChart segments={requestDonutData} />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No requests yet</div>
                    )}
                  </div>
                </div>

                {/* Request Trend Bars */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Request Progress Overview</h2>
                  <div className="space-y-4">
                    <TrendBar label="Pending" value={stats.pendingRequests} total={stats.totalRequests} color="#f59e0b" />
                    <TrendBar label="Accepted" value={stats.acceptedRequests} total={stats.totalRequests} color="#10b981" />
                    <TrendBar label="Completed" value={stats.completedRequests} total={stats.totalRequests} color="#6366f1" />
                  </div>
                </div>

                {/* Platform Summary */}
                <div className="bg-gradient-to-r from-[#D62828] to-[#9D0208] rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-6 h-6 fill-white" />
                    <h2 className="text-lg font-bold">BloodLink Bangladesh Impact</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalDonors + stats.totalPatients}</div>
                      <div className="text-xs text-red-200">Total Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.completedRequests}</div>
                      <div className="text-xs text-red-200">Lives Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">64</div>
                      <div className="text-xs text-red-200">Districts covered</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DONORS TAB */}
            {activeTab === 'donors' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="text"
                    placeholder="Search donors by name, email, location..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{filteredDonors.length} donors</p>
                  <button
                    onClick={() => { setForm({ ...defaultForm, role: 'DONOR' }); setShowCreateModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#D62828] hover:bg-[#9D0208] text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add Donor
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Donor</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Blood</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredDonors.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <Droplets className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            No donors found
                          </td>
                        </tr>
                      ) : filteredDonors.map(donor => (
                        <tr key={donor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D62828] to-[#9D0208] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {donor.fullName?.charAt(0) ?? 'D'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{donor.fullName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />{donor.email}
                                </p>
                                {donor.phoneNumber && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />{donor.phoneNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            {donor.bloodGroup && (
                              <span
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                                style={{ backgroundColor: bgColors[donor.bloodGroup] || '#D62828' }}
                              >
                                {donor.bloodGroup}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-3 h-3 text-[#D62828]" />
                              {donor.currentLocation || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              donor.isActive
                                ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                              {donor.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleStatus(donor.id)}
                                title={donor.isActive ? 'Deactivate' : 'Activate'}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-[#D62828] hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                              >
                                {donor.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                              {confirmDelete === donor.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(donor.id)}
                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(donor.id)}
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PATIENTS TAB */}
            {activeTab === 'patients' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stats?.totalPatients ?? 0} patients registered</p>
                  <button
                    onClick={() => { setForm({ ...defaultForm, role: 'PATIENT' }); setShowCreateModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#D62828] hover:bg-[#9D0208] text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Patient
                  </button>
                </div>

                {/* Patient creation placeholder - patients not in donors list */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Patient Management</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Create and manage patient accounts. Patients can request blood donations and connect with verified donors.
                  </p>
                  <button
                    onClick={() => { setForm({ ...defaultForm, role: 'PATIENT' }); setShowCreateModal(true); }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#D62828] hover:bg-[#9D0208] text-white rounded-xl text-sm font-medium transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Patient
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#D62828]" />
                Add New {form.role === 'DONOR' ? 'Donor' : 'Patient'}
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); setFormError(''); setForm(defaultForm); }}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {/* Role Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Type *</label>
                <div className="flex gap-2">
                  {(['DONOR', 'PATIENT'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.role === r
                          ? 'bg-[#D62828] text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {r === 'DONOR' ? '🩸 Donor' : '🏥 Patient'}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    placeholder="e.g. Md. Arifur Rahman"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    required type="email"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="arif@gmail.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                  <input
                    required type="password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {form.role === 'DONOR' ? 'Blood Group *' : 'Blood Group (Donor)'}
                  </label>
                  <select
                    required={form.role === 'DONOR'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                    value={form.bloodGroup}
                    onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bgDisplayMap[bg]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                  <input
                    type="number" min="18" max="65"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="25"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                    value={form.phoneNumber}
                    onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    placeholder="+880 1711-000000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location (Bangladesh)</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                    value={form.currentLocation}
                    onChange={e => setForm(f => ({ ...f, currentLocation: e.target.value }))}
                  >
                    <option value="">Select Location</option>
                    {bangladeshLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Patient-specific fields */}
                {form.role === 'PATIENT' && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required Blood Group *</label>
                      <select
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                        value={form.requiredBloodGroup || ''}
                        onChange={e => setForm(f => ({ ...f, requiredBloodGroup: e.target.value }))}
                      >
                        <option value="">Select Required Blood Group</option>
                        {bloodGroups.map(bg => (
                          <option key={bg} value={bg}>{bgDisplayMap[bg]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hospital Name</label>
                      <input
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm"
                        value={form.hospitalName || ''}
                        onChange={e => setForm(f => ({ ...f, hospitalName: e.target.value }))}
                        placeholder="e.g. Dhaka Medical College Hospital"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Condition</label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D62828] text-sm resize-none"
                        value={form.medicalCondition || ''}
                        onChange={e => setForm(f => ({ ...f, medicalCondition: e.target.value }))}
                        placeholder="Brief description of medical condition"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setFormError(''); setForm(defaultForm); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#D62828] hover:bg-[#9D0208] text-white text-sm font-medium transition-all disabled:opacity-60"
                >
                  {formLoading ? 'Creating...' : `Create ${form.role === 'DONOR' ? 'Donor' : 'Patient'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
