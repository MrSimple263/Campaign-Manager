import client from "./client";

import type { Recipient, PaginatedResponse, ApiResponse } from "../types";

export interface RecipientParams {
  limit?: number;
  cursor?: string;
  search?: string;
}

export interface CreateRecipientData {
  email: string;
  name?: string;
}

export const getRecipients = async (
  params: RecipientParams = {},
): Promise<PaginatedResponse<Recipient>> => {
  const response = await client.get<PaginatedResponse<Recipient>>(
    "/recipients",
    { params },
  );
  return response.data;
};

export const createRecipient = async (
  data: CreateRecipientData,
): Promise<ApiResponse<Recipient>> => {
  const response = await client.post<ApiResponse<Recipient>>(
    "/recipients",
    data,
  );
  return response.data;
};
