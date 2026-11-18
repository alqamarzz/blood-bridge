import prisma from "@/lib/prisma";
import { DonorProfileInput } from "@/validations/donor";

/**
 * Create or update a donor profile.
 */
export async function upsertDonorProfile(userId: string, input: DonorProfileInput) {
  const profile = await prisma.donorProfile.upsert({
    where: { userId },
    create: {
      userId,
      bloodGroup: input.bloodGroup,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      city: input.city,
      area: input.area ?? null,
      pincode: input.pincode || null,
      preferredRadius: input.preferredRadius,
      isAvailable: input.isAvailable,
      lastDonationDate: input.lastDonationDate ? new Date(input.lastDonationDate) : null,
      whatsappOptIn: input.whatsappOptIn,
      pushOptIn: input.pushOptIn,
      locationConsent: input.locationConsent,
    },
    update: {
      bloodGroup: input.bloodGroup,
      latitude: input.latitude ?? undefined,
      longitude: input.longitude ?? undefined,
      city: input.city,
      area: input.area ?? undefined,
      pincode: input.pincode || undefined,
      preferredRadius: input.preferredRadius,
      isAvailable: input.isAvailable,
      lastDonationDate: input.lastDonationDate ? new Date(input.lastDonationDate) : undefined,
      whatsappOptIn: input.whatsappOptIn,
      pushOptIn: input.pushOptIn,
      locationConsent: input.locationConsent,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: "DONOR_PROFILE_CREATED",
      entityId: profile.id,
    },
  });

  return profile;
}

/**
 * Get a donor profile by user ID.
 */
export async function getDonorProfile(userId: string) {
  return prisma.donorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          phoneVerified: true,
        },
      },
    },
  });
}

/**
 * Toggle donor availability.
 */
export async function setDonorAvailability(userId: string, isAvailable: boolean) {
  const profile = await prisma.donorProfile.update({
    where: { userId },
    data: { isAvailable },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "DONOR_AVAILABILITY_CHANGED",
      entityId: profile.id,
      details: { isAvailable },
    },
  });

  return profile;
}
