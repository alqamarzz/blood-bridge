// BloodBridge Constants

export const APP_NAME = "BloodBridge";
export const APP_DESCRIPTION =
  "Connecting blood requesters with nearby willing donors in real-time.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Blood groups
export const BLOOD_GROUPS = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A-" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B-" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB-" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O-" },
] as const;

// Urgency levels
export const URGENCY_LEVELS = [
  { value: "NORMAL", label: "Normal", description: "Required within a few days" },
  { value: "URGENT", label: "Urgent", description: "Required within 24 hours" },
  { value: "CRITICAL", label: "Critical", description: "Required immediately" },
] as const;

// Search radius options (in km)
export const SEARCH_RADII = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 50, label: "50 km" },
] as const;

// Default search radii for matching engine
export const DEFAULT_SEARCH_RADII = [5, 10, 20] as const;

// Cities supported (initially Kolkata, expandable)
export const SUPPORTED_CITIES = [
  "Kolkata",
  "Howrah",
  "Salt Lake",
  "New Town",
  "Dum Dum",
  "Barasat",
  "Barrackpore",
] as const;

// Kolkata center coordinates
export const KOLKATA_CENTER = {
  lat: 22.5726,
  lng: 88.3639,
} as const;

// OTP settings
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const MAX_OTP_ATTEMPTS = 3;

// Rate limiting
export const RATE_LIMIT = {
  OTP_REQUEST: { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3 per 15 min
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per min
  REQUEST_CREATE: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
} as const;

// Minimum days between donations (Indian guidelines)
export const MIN_DONATION_INTERVAL_DAYS = 90;

// Medical disclaimer
export const MEDICAL_DISCLAIMER =
  "BloodBridge connects blood requesters with potential donors. It is not a blood bank or medical service. Donor eligibility, blood compatibility, testing, and transfusion decisions must be determined by qualified medical professionals and licensed blood banks.";

// Request status labels
export const REQUEST_STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  PARTIALLY_FILLED: "Partially Filled",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

// Response status labels
export const RESPONSE_STATUS_LABELS: Record<string, string> = {
  INTERESTED: "Interested",
  ACCEPTED: "Accepted",
  IGNORED: "Ignored",
  WITHDRAWN: "Withdrawn",
  COMPLETED: "Completed",
};
