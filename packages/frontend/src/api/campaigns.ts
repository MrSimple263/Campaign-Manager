import client from "./client";

import type {
  Campaign,
  CampaignDetail,
  CampaignStats,
  PaginatedResponse,
  CampaignStatus,
  ApiResponse,
} from "../types";

export interface CampaignParams {
  limit?: number;
  cursor?: string;
  status?: CampaignStatus;
}

export interface RecipientInput {
  email: string;
  name?: string;
}

export interface CreateCampaignData {
  name: string;
  subject: string;
  body: string;
  recipients: RecipientInput[];
}

export interface ScheduleCampaignData {
  scheduled_at: string;
}

export const getCampaigns = async (
  params: CampaignParams = {},
): Promise<PaginatedResponse<Campaign>> => {
  const response = await client.get<PaginatedResponse<Campaign>>("/campaigns", {
    params,
  });
  return response.data;
};

export const getCampaign = async (
  id: string,
): Promise<ApiResponse<CampaignDetail>> => {
  const response = await client.get<ApiResponse<CampaignDetail>>(
    `/campaigns/${id}`,
  );
  return response.data;
};

export const createCampaign = async (
  data: CreateCampaignData,
): Promise<ApiResponse<Campaign>> => {
  const response = await client.post<ApiResponse<Campaign>>("/campaigns", data);
  return response.data;
};

export const updateCampaign = async (
  id: string,
  data: Partial<CreateCampaignData>,
): Promise<ApiResponse<Campaign>> => {
  const response = await client.patch<ApiResponse<Campaign>>(
    `/campaigns/${id}`,
    data,
  );
  return response.data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await client.delete(`/campaigns/${id}`);
};

export const scheduleCampaign = async (
  id: string,
  data: ScheduleCampaignData,
): Promise<ApiResponse<Campaign>> => {
  const response = await client.post<ApiResponse<Campaign>>(
    `/campaigns/${id}/schedule`,
    data,
  );
  return response.data;
};

export const sendCampaign = async (
  id: string,
): Promise<ApiResponse<Campaign>> => {
  const response = await client.post<ApiResponse<Campaign>>(
    `/campaigns/${id}/send`,
  );
  return response.data;
};

export const getCampaignStats = async (id: string): Promise<CampaignStats> => {
  const response = await client.get<CampaignStats>(`/campaigns/${id}/stats`);
  return response.data;
};
