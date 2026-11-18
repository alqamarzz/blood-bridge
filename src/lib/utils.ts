import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a blood group enum value for display.
 * e.g., "A_POS" -> "A+", "AB_NEG" -> "AB-"
 */
export function formatBloodGroup(group: string): string {
  const map: Record<string, string> = {
    A_POS: "A+",
    A_NEG: "A-",
    B_POS: "B+",
    B_NEG: "B-",
    AB_POS: "AB+",
    AB_NEG: "AB-",
    O_POS: "O+",
    O_NEG: "O-",
  };
  return map[group] || group;
}

/**
 * Parse a display blood group back to enum value.
 * e.g., "A+" -> "A_POS"
 */
export function parseBloodGroup(display: string): string {
  const map: Record<string, string> = {
    "A+": "A_POS",
    "A-": "A_NEG",
    "B+": "B_POS",
    "B-": "B_NEG",
    "AB+": "AB_POS",
    "AB-": "AB_NEG",
    "O+": "O_POS",
    "O-": "O_NEG",
  };
  return map[display] || display;
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date with time for display.
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculate relative time (e.g., "2 hours ago").
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

/**
 * Approximate distance text. Never show exact distances.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return "Less than 1 km away";
  if (distanceKm < 2) return "About 1-2 km away";
  if (distanceKm < 5) return "About 2-5 km away";
  if (distanceKm < 10) return "About 5-10 km away";
  if (distanceKm < 20) return "About 10-20 km away";
  return "More than 20 km away";
}

/**
 * Generate a consistent API response structure.
 */
export function apiResponse<T>(data: T, message?: string) {
  return { success: true, data, message };
}

/**
 * Generate an API error response.
 */
export function apiError(message: string, status: number = 400) {
  return Response.json(
    { success: false, error: message },
    { status }
  );
}

/**
 * Mask phone number for privacy.
 * e.g., "+919876543210" -> "+91****3210"
 */
export function maskPhone(phone: string): string {
  if (phone.length < 4) return "****";
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

/**
 * Get urgency color class.
 */
export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case "CRITICAL":
      return "text-red-600 bg-red-50 border-red-200";
    case "URGENT":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "NORMAL":
    default:
      return "text-blue-600 bg-blue-50 border-blue-200";
  }
}

/**
 * Get request status color class.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "OPEN":
      return "text-green-600 bg-green-50 border-green-200";
    case "PARTIALLY_FILLED":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "FULFILLED":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "CANCELLED":
      return "text-gray-600 bg-gray-50 border-gray-200";
    case "EXPIRED":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}
