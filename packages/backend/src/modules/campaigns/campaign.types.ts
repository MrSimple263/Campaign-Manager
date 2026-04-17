import type {
  Campaign,
  CampaignStatus,
  CampaignRecipientWithDetails,
  PaginatedQuery,
} from "../../shared/types/index.js";

// Query types
export interface CampaignQuery extends PaginatedQuery {
  status?: CampaignStatus;
}

// Input types
export interface RecipientInput {
  email: string;
  name?: string;
}

export interface CreateCampaignInput {
  name: string;
  subject: string;
  body: string;
  recipients: RecipientInput[];
}

export interface UpdateCampaignInput {
  name?: string;
  subject?: string;
  body?: string;
  recipients?: RecipientInput[];
}

export interface ScheduleInput {
  scheduled_at: string;
}

// Response types
export interface CampaignWithRecipients extends Campaign {
  recipients: CampaignRecipientWithDetails[];
  recipient_count: number;
}

export interface CampaignDetailResponse {
  campaign: Campaign;
  recipients: CampaignRecipientWithDetails[];
}

export interface CampaignListItem extends Campaign {
  recipient_count: number;
}
