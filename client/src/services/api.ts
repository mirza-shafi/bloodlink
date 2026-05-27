import type { User, Donor, BloodRequest, Chat, Message, Notification, LoginRequest, RegisterRequest, ApiResponse } from '@/types';
import { BloodGroup, AvailabilityStatus } from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Blood Group mapping between Frontend (A+, O-) and Backend (A_POS, O_NEG)
const FRONTEND_TO_BACKEND_BLOOD_GROUP: Record<string, string> = {
  "A+": "A_POS",
  "A-": "A_NEG",
  "B+": "B_POS",
  "B-": "B_NEG",
  "AB+": "AB_POS",
  "AB-": "AB_NEG",
  "O+": "O_POS",
  "O-": "O_NEG",
};

const BACKEND_TO_FRONTEND_BLOOD_GROUP: Record<string, string> = {
  "A_POS": "A+",
  "A_NEG": "A-",
  "B_POS": "B+",
  "B_NEG": "B-",
  "AB_POS": "AB+",
  "AB_NEG": "AB-",
  "O_POS": "O+",
  "O_NEG": "O-",
};

export const toBackendBloodGroup = (bg?: string): any => {
  if (!bg) return undefined;
  return FRONTEND_TO_BACKEND_BLOOD_GROUP[bg] || bg;
};

export const toFrontendBloodGroup = (bg?: string): any => {
  if (!bg) return undefined;
  return BACKEND_TO_FRONTEND_BLOOD_GROUP[bg] || bg;
};

const mapUserToFrontend = (user: any): any => {
  if (!user) return user;
  return {
    ...user,
    bloodGroup: toFrontendBloodGroup(user.bloodGroup),
    requiredBloodGroup: toFrontendBloodGroup(user.requiredBloodGroup),
  };
};

const mapRequestToFrontend = (req: any): any => {
  if (!req) return req;
  return {
    ...req,
    bloodGroup: toFrontendBloodGroup(req.bloodGroup),
  };
};

const mapRequestToBackend = (req: any): any => {
  if (!req) return req;
  return {
    ...req,
    bloodGroup: toBackendBloodGroup(req.bloodGroup),
  };
};

let currentUser: User | null = null;

// Generic API Fetch Helper
const apiFetch = async <T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { success: false, message: err.message || 'Request failed', data: null as any };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || 'Network error', data: null as any };
  }
};

// Auth API
export const authApi = {
  login: async (request: LoginRequest): Promise<ApiResponse<{ token: string; user: User }>> => {
    const loginRes = await apiFetch<{ accessToken: string; userId: number; email: string; role: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!loginRes.success || !loginRes.data) {
      return { success: false, message: loginRes.message || 'Login failed', data: null as any };
    }
    const token = loginRes.data.accessToken;
    // Set token immediately in localStorage so the subsequent me request uses it
    localStorage.setItem('token', token);
    
    const meRes = await apiFetch<User>('/api/auth/me');
    if (!meRes.success || !meRes.data) {
      localStorage.removeItem('token');
      return { success: false, message: 'Failed to retrieve profile after login', data: null as any };
    }
    currentUser = mapUserToFrontend(meRes.data);
    return {
      success: true,
      message: loginRes.message,
      data: { token, user: currentUser! },
    };
  },

  register: async (request: RegisterRequest): Promise<ApiResponse<{ token: string; user: User }>> => {
    const backendRequest = {
      ...request,
      bloodGroup: toBackendBloodGroup(request.bloodGroup),
      requiredBloodGroup: toBackendBloodGroup(request.requiredBloodGroup),
    };
    const registerRes = await apiFetch<{ accessToken: string; userId: number; email: string; role: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(backendRequest),
    });
    if (!registerRes.success || !registerRes.data) {
      return { success: false, message: registerRes.message || 'Registration failed', data: null as any };
    }
    const token = registerRes.data.accessToken;
    localStorage.setItem('token', token);

    const meRes = await apiFetch<User>('/api/auth/me');
    if (!meRes.success || !meRes.data) {
      localStorage.removeItem('token');
      return { success: false, message: 'Failed to retrieve profile after registration', data: null as any };
    }
    currentUser = mapUserToFrontend(meRes.data);
    return {
      success: true,
      message: registerRes.message,
      data: { token, user: currentUser! },
    };
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: "Not authenticated", data: null as any };
    }
    const meRes = await apiFetch<User>('/api/auth/me');
    if (meRes.success && meRes.data) {
      currentUser = mapUserToFrontend(meRes.data);
      return { success: true, message: meRes.message, data: currentUser! };
    }
    return meRes;
  },

  updateProfile: async (data: Partial<any>): Promise<ApiResponse<User>> => {
    const backendData = {
      ...data,
      bloodGroup: data.bloodGroup ? toBackendBloodGroup(data.bloodGroup) : undefined,
      requiredBloodGroup: data.requiredBloodGroup ? toBackendBloodGroup(data.requiredBloodGroup) : undefined,
    };
    const res = await apiFetch<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    if (res.success && res.data) {
      currentUser = mapUserToFrontend(res.data);
      // Persist updated user to localStorage
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
    return res;
  },

  logout: () => {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Donor API
export const donorApi = {
  getAllDonors: async (): Promise<ApiResponse<Donor[]>> => {
    const res = await apiFetch<Donor[]>('/api/donors');
    if (res.success && res.data) {
      res.data = res.data.map(mapUserToFrontend);
    }
    return res;
  },

  getDonorById: async (id: number): Promise<ApiResponse<Donor>> => {
    const res = await apiFetch<Donor>(`/api/donors/${id}`);
    if (res.success && res.data) {
      res.data = mapUserToFrontend(res.data);
    }
    return res;
  },

  searchDonors: async (criteria: { bloodGroup?: BloodGroup; location?: string; availableOnly?: boolean }): Promise<ApiResponse<Donor[]>> => {
    const backendCriteria = {
      bloodGroup: toBackendBloodGroup(criteria.bloodGroup),
      location: criteria.location,
      availableOnly: criteria.availableOnly,
    };
    const res = await apiFetch<Donor[]>('/api/donors/search', {
      method: 'POST',
      body: JSON.stringify(backendCriteria),
    });
    if (res.success && res.data) {
      res.data = res.data.map(mapUserToFrontend);
    }
    return res;
  },

  updateAvailability: async (id: number, status: AvailabilityStatus): Promise<ApiResponse<Donor>> => {
    const res = await apiFetch<Donor>(`/api/donors/${id}/availability?status=${status}`, {
      method: 'PUT',
    });
    if (res.success && res.data) {
      res.data = mapUserToFrontend(res.data);
    }
    return res;
  },
};

// Request API
export const requestApi = {
  getRequestsByPatient: async (patientId: number): Promise<ApiResponse<BloodRequest[]>> => {
    const res = await apiFetch<BloodRequest[]>(`/api/requests/patient/${patientId}`);
    if (res.success && res.data) {
      res.data = res.data.map(mapRequestToFrontend);
    }
    return res;
  },

  getRequestsByDonor: async (donorId: number): Promise<ApiResponse<BloodRequest[]>> => {
    const res = await apiFetch<BloodRequest[]>(`/api/requests/donor/${donorId}`);
    if (res.success && res.data) {
      res.data = res.data.map(mapRequestToFrontend);
    }
    return res;
  },

  createRequest: async (request: Partial<BloodRequest>): Promise<ApiResponse<BloodRequest>> => {
    const backendBody = mapRequestToBackend(request);
    const res = await apiFetch<BloodRequest>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(backendBody),
    });
    if (res.success && res.data) {
      res.data = mapRequestToFrontend(res.data);
    }
    return res;
  },

  acceptRequest: async (id: number): Promise<ApiResponse<BloodRequest>> => {
    const res = await apiFetch<BloodRequest>(`/api/requests/${id}/accept`, {
      method: 'PUT',
    });
    if (res.success && res.data) {
      res.data = mapRequestToFrontend(res.data);
    }
    return res;
  },

  declineRequest: async (id: number): Promise<ApiResponse<BloodRequest>> => {
    const res = await apiFetch<BloodRequest>(`/api/requests/${id}/decline`, {
      method: 'PUT',
    });
    if (res.success && res.data) {
      res.data = mapRequestToFrontend(res.data);
    }
    return res;
  },

  completeRequest: async (id: number): Promise<ApiResponse<BloodRequest>> => {
    const res = await apiFetch<BloodRequest>(`/api/requests/${id}/complete`, {
      method: 'PUT',
    });
    if (res.success && res.data) {
      res.data = mapRequestToFrontend(res.data);
    }
    return res;
  },
};

// Chat API
export const chatApi = {
  getUserChats: async (): Promise<ApiResponse<Chat[]>> => {
    return apiFetch<Chat[]>('/api/chats');
  },

  getChatMessages: async (chatId: number): Promise<ApiResponse<Message[]>> => {
    return apiFetch<Message[]>(`/api/chats/${chatId}/messages`);
  },

  sendMessage: async (chatId: number, _senderId: number, content: string): Promise<ApiResponse<Message>> => {
    return apiFetch<Message>(`/api/chats/${chatId}/messages?content=${encodeURIComponent(content)}`, {
      method: 'POST',
    });
  },

  createChat: async (_user1Id: number, user2Id: number): Promise<ApiResponse<Chat>> => {
    return apiFetch<Chat>(`/api/chats?otherUserId=${user2Id}`, {
      method: 'POST',
    });
  },
};

// Notification API
export const notificationApi = {
  getUserNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    return apiFetch<Notification[]>('/api/notifications');
  },

  markAsRead: async (id: number): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/api/notifications/read-all', {
      method: 'PUT',
    });
  },
};

// AI Recommendation API
export const aiApi = {
  recommendDonors: async (patientId: number, limit: number = 10): Promise<ApiResponse<Donor[]>> => {
    const res = await apiFetch<Donor[]>(`/api/ai/recommend/${patientId}?limit=${limit}`);
    if (res.success && res.data) {
      res.data = res.data.map(mapUserToFrontend);
    }
    return res;
  },
};

// Admin API
export const adminApi = {
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    const res = await apiFetch<any>('/api/admin/dashboard');
    if (res.success && res.data && res.data.bloodAvailability) {
      const mappedAvailability: Record<string, number> = {};
      Object.entries(res.data.bloodAvailability).forEach(([key, val]) => {
        mappedAvailability[toFrontendBloodGroup(key)] = val as number;
      });
      res.data.bloodAvailability = mappedAvailability;
    }
    return res;
  },

  getAllDonors: async (): Promise<ApiResponse<Donor[]>> => {
    const res = await apiFetch<Donor[]>('/api/admin/donors');
    if (res.success && res.data) {
      res.data = res.data.map(mapUserToFrontend);
    }
    return res;
  },

  createDonor: async (data: object): Promise<ApiResponse<Donor>> => {
    const mappedData = {
      ...data,
      bloodGroup: toBackendBloodGroup((data as any).bloodGroup),
    };
    const res = await apiFetch<Donor>('/api/admin/donors', {
      method: 'POST',
      body: JSON.stringify(mappedData),
    });
    if (res.success && res.data) {
      res.data = mapUserToFrontend(res.data);
    }
    return res;
  },

  deleteUser: (userId: number) =>
    apiFetch<void>(`/api/admin/users/${userId}`, { method: 'DELETE' }),

  toggleUserStatus: (userId: number) =>
    apiFetch<void>(`/api/admin/users/${userId}/toggle-active`, { method: 'PUT' }),
};

export { currentUser };
