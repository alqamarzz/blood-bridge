// Core types for BloodBridge

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: "USER" | "ADMIN";
  phoneVerified: boolean;
  suspended: boolean;
  createdAt: string;
  donorProfile: DonorProfileSummary | null;
}

export interface DonorProfileSummary {
  id: string;
  bloodGroup: string;
  city: string;
  area: string | null;
  preferredRadius: number;
  isAvailable: boolean;
  lastDonationDate: string | null;
  whatsappOptIn: boolean;
  pushOptIn: boolean;
}

export interface BloodRequestSummary {
  id: string;
  bloodGroup: string;
  unitsRequired: number;
  unitsFulfilled: number;
  hospitalName: string;
  hospitalAddress: string;
  city: string;
  requiredBy: string;
  urgency: "NORMAL" | "URGENT" | "CRITICAL";
  status: "OPEN" | "PARTIALLY_FILLED" | "FULFILLED" | "CANCELLED" | "EXPIRED";
  additionalInformation: string | null;
  createdAt: string;
  requester: {
    id: string;
    name: string;
  };
  _count?: {
    donorResponses: number;
  };
  approximateDistance?: string;
}

export interface BloodRequestDetail extends BloodRequestSummary {
  contactPhone: string | null;
  donorResponses: DonorResponseDetail[];
}

export interface DonorResponseDetail {
  id: string;
  status: "INTERESTED" | "ACCEPTED" | "IGNORED" | "WITHDRAWN" | "COMPLETED";
  statusMessage: string | null;
  createdAt: string;
  donor: {
    id: string;
    name: string;
    donorProfile: {
      bloodGroup: string;
      city: string;
      area: string | null;
    } | null;
  };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  requestId: string | null;
  donorResponseId: string | null;
}

export interface DashboardStats {
  totalRequests: number;
  activeRequests: number;
  fulfilledRequests: number;
  totalResponses: number;
  acceptedResponses: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalDonors: number;
  activeRequests: number;
  fulfilledRequests: number;
  cancelledRequests: number;
  pendingReports: number;
  recentResponses: number;
}

export interface NearbyDonor {
  id: string;
  bloodGroup: string;
  city: string;
  approximateDistance: string;
  isAvailable: boolean;
}

export interface MapLocation {
  lat: number;
  lng: number;
}
