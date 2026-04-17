import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import * as recipientsApi from "../api/recipients";

import type { RecipientParams } from "../api/recipients";

export const recipientKeys = {
  all: ["recipients"] as const,
  lists: () => [...recipientKeys.all, "list"] as const,
  list: (params: RecipientParams) =>
    [...recipientKeys.lists(), params] as const,
};

export const useRecipients = (params: RecipientParams = {}) => {
  return useQuery({
    queryKey: recipientKeys.list(params),
    queryFn: () => recipientsApi.getRecipients(params),
  });
};

export const useCreateRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recipientsApi.createRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipientKeys.lists() });
    },
  });
};
