// Shared types between frontend and backend

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export type CampaignStatus = "draft" | "scheduled" | "sent";

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduled_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  recipient_count?: number;
}

export interface Recipient {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export type CampaignRecipientStatus = "pending" | "sent" | "failed";

export interface CampaignRecipient {
  id: string;
  email: string;
  name: string | null;
  status: CampaignRecipientStatus;
  sent_at: string | null;
  opened: string | null;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

export interface CampaignDetail {
  campaign: Campaign;
  recipients: CampaignRecipient[];
}

// API response types
export interface ApiResponse<T> {
  status: "success";
  data: T;
}

export interface PaginatedResponse<T> {
  status: "success";
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface AuthResponse {
  status: "success";
  data: {
    user: User;
  };
}

export interface ApiError {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;
}
