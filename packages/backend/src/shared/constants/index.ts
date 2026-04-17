// Table names
export const TABLES = {
  USERS: "users",
  RECIPIENTS: "recipients",
  CAMPAIGNS: "campaigns",
  CAMPAIGN_RECIPIENTS: "campaign_recipients",
} as const;

// API response status
export const RESPONSE_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

// Campaign status
export const CAMPAIGN_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  SENT: "sent",
} as const;

// Campaign recipient status
export const RECIPIENT_STATUS = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
} as const;

// Types derived from constants
export type CampaignStatusType =
  (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS];
export type RecipientStatusType =
  (typeof RECIPIENT_STATUS)[keyof typeof RECIPIENT_STATUS];
