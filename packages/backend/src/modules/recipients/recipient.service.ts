import { AppError } from "../../shared/middleware/index.js";

import { recipientRepository } from "./recipient.repository.js";

import type {
  RecipientQuery,
  CreateRecipientInput,
  RecipientListResponse,
} from "./recipient.types.js";
import type { Recipient } from "../../shared/types/index.js";

export const recipientService = {
  async getRecipients(options: RecipientQuery): Promise<RecipientListResponse> {
    const result = await recipientRepository.findMany(options);
    return {
      data: result.data,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  },

  async createRecipient(input: CreateRecipientInput): Promise<Recipient> {
    // Check if recipient already exists
    const isEmailTaken = await recipientRepository.isEmailTaken(input.email);
    if (isEmailTaken) {
      throw new AppError(409, "Recipient with this email already exists");
    }

    return recipientRepository.create(input);
  },

  async getRecipientsByIds(ids: string[]): Promise<Recipient[]> {
    return recipientRepository.findByIds(ids);
  },
};
