// Database table types

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
}

export type SafeUser = Omit<User, "password_hash">;

export type CampaignStatus = "draft" | "scheduled" | "sent";

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduled_at: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Recipient {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
}

export type CampaignRecipientStatus = "pending" | "sent" | "failed";

export interface CampaignRecipient {
  campaign_id: string;
  recipient_id: string;
  status: CampaignRecipientStatus;
  sent_at: Date | null;
  opened_at: Date | null;
}

// Extended types for API responses

export interface CampaignWithCount extends Campaign {
  recipient_count: number;
}

export interface CampaignRecipientWithDetails {
  id: string;
  email: string;
  name: string | null;
  status: CampaignRecipientStatus;
  sent_at: Date | null;
  opened_at: Date | null;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  send_rate: number;
  open_rate: number;
}

// Pagination types
export interface PaginatedQuery {
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
