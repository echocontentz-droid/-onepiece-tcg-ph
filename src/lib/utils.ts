import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { PLATFORM_FEE_PERCENT } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------
// Currency
// ---------------------------------------------------------------
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ---------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------
export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

// ---------------------------------------------------------------
// Price helpers
// ---------------------------------------------------------------
export function calculatePlatformFee(price: number): number {
  return Math.ceil(price * PLATFORM_FEE_PERCENT * 100) / 100;
}

export function calculateTotal(price: number, shippingFee: number): {
  platformFee: number;
  total: number;
  sellerPayout: number;
} {
  const platformFee = calculatePlatformFee(price);
  const total = price + shippingFee;
  const sellerPayout = price - platformFee + shippingFee;
  return { platformFee, total, sellerPayout };
}

// ---------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------
// Rating helpers
// ---------------------------------------------------------------
export function ratingLabel(avg: number): string {
  if (avg >= 4.8) return "Excellent";
  if (avg >= 4.0) return "Great";
  if (avg >= 3.0) return "Good";
  if (avg >= 2.0) return "Fair";
  return "Poor";
}

export function ratingColor(avg: number): string {
  if (avg >= 4.5) return "text-emerald-500";
  if (avg >= 3.5) return "text-green-500";
  if (avg >= 2.5) return "text-yellow-500";
  if (avg >= 1.5) return "text-orange-500";
  return "text-red-500";
}

// ---------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------
export function isValidPhoneNumber(phone: string): boolean {
  // Philippine mobile number format: 09XXXXXXXXX or +639XXXXXXXXX
  return /^(\+63|0)9\d{9}$/.test(phone.replace(/\s/g, ""));
}

export function isValidGCashNumber(number: string): boolean {
  return isValidPhoneNumber(number);
}

export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("63")) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
}

// ---------------------------------------------------------------
// Image helpers
// ---------------------------------------------------------------
export function getSupabaseImageUrl(path: string, bucket: string = "listing-images"): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function getAvatarFallback(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=e63946`;
}

// ---------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isValidImageType(file: File): boolean {
  return ["image/jpeg", "image/png", "image/webp", "image/heic"].includes(file.type);
}

export function isValidImageSize(file: File, maxMb: number = 10): boolean {
  return file.size <= maxMb * 1024 * 1024;
}

// ---------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------
export function buildSearchUrl(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) {
      searchParams.set(key, String(value));
    }
  }
  const query = searchParams.toString();
  return `/listings${query ? `?${query}` : ""}`;
}

// ---------------------------------------------------------------
// Rate limiting (client-side check, server enforces)
// ---------------------------------------------------------------
export function getRateLimitKey(action: string, userId: string): string {
  return `rate_limit:${action}:${userId}`;
}
