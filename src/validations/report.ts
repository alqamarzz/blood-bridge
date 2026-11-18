import { z } from "zod";

const reportReasonValues = [
  "FAKE_REQUEST",
  "SPAM",
  "HARASSMENT",
  "INAPPROPRIATE",
  "SUSPICIOUS_ACTIVITY",
  "OTHER",
] as const;

export const createReportSchema = z.object({
  reportedUserId: z.string().uuid().optional(),
  requestId: z.string().uuid().optional(),
  reason: z.enum(reportReasonValues, {
    message: "Please select a reason for reporting",
  }),
  description: z
    .string()
    .min(10, "Please provide at least 10 characters of detail")
    .max(1000, "Description must be less than 1000 characters")
    .trim(),
}).refine(
  (data) => data.reportedUserId || data.requestId,
  { message: "Either a user or a request must be reported" }
);

export type CreateReportInput = z.infer<typeof createReportSchema>;
