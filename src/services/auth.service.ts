import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { RegisterInput } from "@/validations/auth";
import { OTP_LENGTH, OTP_EXPIRY_MINUTES, MAX_OTP_ATTEMPTS } from "@/lib/constants";

const SALT_ROUNDS = 12;

/**
 * Register a new user.
 */
export async function registerUser(input: RegisterInput) {
  // Check if phone already registered
  const existingUser = await prisma.user.findUnique({
    where: { phone: input.phone },
  });

  if (existingUser) {
    throw new Error("A user with this phone number already exists");
  }

  // Check email uniqueness if provided
  if (input.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingEmail) {
      throw new Error("A user with this email already exists");
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      passwordHash,
      role: "USER",
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      phoneVerified: true,
      createdAt: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_REGISTERED",
      details: { phone: input.phone },
    },
  });

  return user;
}

/**
 * Generate and store an OTP for phone verification.
 * In development, the OTP is logged to console.
 */
export async function generateOtp(phone: string): Promise<string> {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store OTP
  await prisma.otpVerification.create({
    data: {
      phone,
      otp,
      expiresAt,
    },
  });

  // In development, log the OTP
  if (process.env.NODE_ENV === "development" || process.env.OTP_PROVIDER === "console") {
    console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
  }

  // TODO: In production, send OTP via SMS provider (Twilio, MSG91, etc.)

  return otp;
}

/**
 * Verify an OTP.
 */
export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
  const record = await prisma.otpVerification.findFirst({
    where: {
      phone,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new Error("OTP expired or not found. Please request a new OTP.");
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many attempts. Please request a new OTP.");
  }

  // Increment attempts
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  if (record.otp !== otp) {
    throw new Error("Invalid OTP. Please try again.");
  }

  // Mark OTP as verified
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });

  // Mark user's phone as verified
  await prisma.user.updateMany({
    where: { phone },
    data: { phoneVerified: true },
  });

  return true;
}

/**
 * Get user by ID with their donor profile.
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      phoneVerified: true,
      suspended: true,
      createdAt: true,
      updatedAt: true,
      donorProfile: {
        select: {
          id: true,
          bloodGroup: true,
          city: true,
          area: true,
          preferredRadius: true,
          isAvailable: true,
          lastDonationDate: true,
          whatsappOptIn: true,
          pushOptIn: true,
        },
      },
    },
  });
}

/**
 * Check if a user is an admin.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}
