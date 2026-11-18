import { z } from "zod";

const bloodGroupValues = [
  "A_POS", "A_NEG", "B_POS", "B_NEG",
  "AB_POS", "AB_NEG", "O_POS", "O_NEG",
] as const;

const urgencyValues = ["NORMAL", "URGENT", "CRITICAL"] as const;
const statusValues = ["OPEN", "PARTIALLY_FILLED", "FULFILLED", "CANCELLED", "EXPIRED"] as const;

export const createRequestSchema = z.object({
  bloodGroup: z.enum(bloodGroupValues, {
    message: "Please select a blood group",
  }),
  unitsRequired: z
    .number()
    .int()
    .min(1, "At least 1 unit is required")
    .max(20, "Maximum 20 units per request"),
  hospitalName: z
    .string()
    .min(2, "Hospital name is required")
    .max(200, "Hospital name must be less than 200 characters")
    .trim(),
  hospitalAddress: z
    .string()
    .min(5, "Hospital address is required")
    .max(500, "Address must be less than 500 characters")
    .trim(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  city: z.string().min(1, "City is required"),
  requiredBy: z
    .string()
    .refine(
      (val) => new Date(val) > new Date(),
      "Required date must be in the future"
    ),
  urgency: z.enum(urgencyValues),
  additionalInformation: z
    .string()
    .max(1000, "Additional information must be less than 1000 characters")
    .optional(),
  contactPhone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, "Please enter a valid Indian phone number")
    .optional()
    .or(z.literal("")),
});

export const updateRequestSchema = createRequestSchema.partial();

export const updateRequestStatusSchema = z.object({
  status: z.enum(statusValues),
});

export const donorResponseSchema = z.object({
  message: z
    .string()
    .max(500, "Message must be less than 500 characters")
    .optional(),
});

export const updateResponseStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "IGNORED"] as const),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
export type DonorResponseInput = z.infer<typeof donorResponseSchema>;
export type UpdateResponseStatusInput = z.infer<typeof updateResponseStatusSchema>;
