import type { Recipient, PaginatedQuery } from "../../shared/types/index.js";

// Query types
export interface RecipientQuery extends PaginatedQuery {
  search?: string;
}

// Input types
export interface CreateRecipientInput {
  email: string;
  name?: string;
}

// Response types
export interface RecipientListResponse {
  data: Recipient[];
  nextCursor: string | null;
  hasMore: boolean;
}
