import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import * as campaignsApi from "../api/campaigns";

import type {
  CampaignParams,
  CreateCampaignData,
  ScheduleCampaignData,
} from "../api/campaigns";

export const campaignKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignKeys.all, "list"] as const,
  list: (params: CampaignParams) => [...campaignKeys.lists(), params] as const,
  details: () => [...campaignKeys.all, "detail"] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  stats: (id: string) => [...campaignKeys.all, "stats", id] as const,
};

export const useCampaigns = (params: CampaignParams = {}) => {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => campaignsApi.getCampaigns(params),
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignsApi.getCampaign(id),
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignsApi.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCampaignData>;
    }) => campaignsApi.updateCampaign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignsApi.deleteCampaign,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.removeQueries({ queryKey: campaignKeys.detail(id) });
    },
  });
};

export const useScheduleCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScheduleCampaignData }) =>
      campaignsApi.scheduleCampaign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.id),
      });
    },
  });
};

export const useSendCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignsApi.sendCampaign,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats(id) });
    },
  });
};

export const useStats = (id: string) => {
  return useQuery({
    queryKey: campaignKeys.stats(id),
    queryFn: () => campaignsApi.getCampaignStats(id),
    enabled: !!id,
  });
};
