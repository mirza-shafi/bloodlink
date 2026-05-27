export const BloodGroup = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
} as const;
export type BloodGroup = typeof BloodGroup[keyof typeof BloodGroup];

export const UserRole = {
  DONOR: "DONOR",
  PATIENT: "PATIENT",
  ADMIN: "ADMIN",
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const RequestStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

export const EmergencyLevel = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;
export type EmergencyLevel = typeof EmergencyLevel[keyof typeof EmergencyLevel];

export const AvailabilityStatus = {
  AVAILABLE: "AVAILABLE",
  UNAVAILABLE: "UNAVAILABLE",
} as const;
export type AvailabilityStatus = typeof AvailabilityStatus[keyof typeof AvailabilityStatus];

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  gender?: Gender;
  age?: number;
  currentLocation?: string;
  profilePhoto?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Donor extends User {
  bloodGroup?: BloodGroup;
  availableDonationArea?: string;
  lastDonationDate?: string;
  donationCount: number;
  medicalHistory?: string;
  diseasesRestrictions?: string;
  emergencyAvailable: boolean;
  availabilityStatus: AvailabilityStatus;
  latitude?: number;
  longitude?: number;
  distance?: number;
  matchScore?: number;
}

export interface Patient extends User {
  medicalCondition?: string;
  requiredBloodGroup?: BloodGroup;
  hospitalName?: string;
  emergencyLevel?: EmergencyLevel;
  requiredDate?: string;
}

export interface BloodRequest {
  id: number;
  patientId: number;
  patientName: string;
  donorId: number;
  donorName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalName?: string;
  hospitalAddress?: string;
  emergencyLevel: EmergencyLevel;
  requiredDate?: string;
  status: RequestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: number;
  participant1Id: number;
  participant1Name: string;
  participant1Photo?: string;
  participant2Id: number;
  participant2Name: string;
  participant2Photo?: string;
  createdAt: string;
  lastMessageAt?: string;
  lastMessage?: string;
  unread: boolean;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  senderPhoto?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message?: string;
  relatedRequestId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: UserRole;
  gender?: Gender;
  age?: number;
  currentLocation?: string;
  bloodGroup?: BloodGroup;
  requiredBloodGroup?: BloodGroup;
  hospitalName?: string;
}

export interface AdminDashboardStats {
  totalDonors: number;
  totalPatients: number;
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  completedRequests: number;
  totalActiveUsers: number;
  availableDonors: number;
  bloodAvailability: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
