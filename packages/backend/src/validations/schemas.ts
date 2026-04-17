import { z } from "zod";

// Common schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Recipient schemas
export const createRecipientSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string(),
});

export const recipientQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

// Campaign schemas
export const createCampaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  recipients: z
    .array(
      z.object({
        email: z.string().email("Invalid email format"),
        name: z.string().optional(),
      }),
    )
    .min(1, "At least one recipient is required"),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const campaignQuerySchema = paginationSchema.extend({
  status: z.enum(["draft", "sending", "scheduled", "sent"]).optional(),
});

export const scheduleSchema = z.object({
  scheduled_at: z
    .string()
    .datetime()
    .refine(
      (date) => new Date(date) > new Date(),
      "Scheduled time must be in the future",
    ),
});

// Inferred types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
