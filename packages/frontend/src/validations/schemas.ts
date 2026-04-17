import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RecipientSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z
    .string()
    .min(1, "Name recipient is required")
    .max(100, "Name too long"),
});

// Campaign schemas
export const campaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(255, "Subject too long"),
  body: z.string().min(1, "Content is required"),
  recipients: z
    .array(RecipientSchema)
    .min(1, "At least one recipient is required"),
});

export const campaignUpdateSchema = campaignSchema.partial();

export const scheduleSchema = z.object({
  scheduled_at: z
    .string()
    .min(1, "Scheduled date is required")
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Invalid date format" },
    )
    .refine(
      (val) => {
        const date = new Date(val);
        return date > new Date();
      },
      { message: "Scheduled date must be in the future" },
    ),
});

// Recipient schemas
export const recipientSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().max(100, "Name too long").optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type RecipientInput = z.infer<typeof recipientSchema>;
