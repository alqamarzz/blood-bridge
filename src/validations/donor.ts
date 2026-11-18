import { z } from "zod";

const bloodGroupValues = [
  "A_POS", "A_NEG", "B_POS", "B_NEG",
  "AB_POS", "AB_NEG", "O_POS", "O_NEG",
] as const;

export const donorProfileSchema = z.object({
  bloodGroup: z.enum(bloodGroupValues, {
    message: "Please select a valid blood group",
  }),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  city: z.string().min(1, "City is required"),
  area: z.string().optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be 6 digits")
    .optional()
    .or(z.literal("")),
  preferredRadius: z.number().int().min(1).max(100),
  isAvailable: z.boolean(),
  lastDonationDate: z.string().optional().nullable(),
  whatsappOptIn: z.boolean(),
  pushOptIn: z.boolean().optional(),
  locationConsent: z.boolean(),
});

export const donorAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export type DonorProfileInput = z.infer<typeof donorProfileSchema>;
export type DonorAvailabilityInput = z.infer<typeof donorAvailabilitySchema>;
