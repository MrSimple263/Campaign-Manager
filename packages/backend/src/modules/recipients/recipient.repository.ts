import db from "@/db/index.js";
import { TABLES } from "@/shared/constants/index.js";
import { generateUuidV7 } from "@/shared/utils/index.js";

import type {
  CreateRecipientInput,
  RecipientQuery,
} from "./recipient.types.js";
import type { Recipient } from "@/shared/types/index.js";

export interface FindManyResult {
  data: Recipient[];
  hasMore: boolean;
  nextCursor: string | null;
}

export const recipientRepository = {
  async findByIds(ids: string[]): Promise<Recipient[]> {
    return db(TABLES.RECIPIENTS).whereIn("id", ids);
  },

  async findMany(options: RecipientQuery): Promise<FindManyResult> {
    const { limit = 20, cursor, search } = options;

    let query = db(TABLES.RECIPIENTS)
      .orderBy("created_at", "desc")
      .orderBy("id", "desc");

    // Apply search filter
    if (search) {
      query = query.where((builder) => {
        builder
          .whereILike("email", `%${search}%`)
          .orWhereILike("name", `%${search}%`);
      });
    }

    // Apply cursor-based pagination
    if (cursor) {
      const cursorRecord = await db(TABLES.RECIPIENTS)
        .where({ id: cursor })
        .first();
      if (cursorRecord) {
        query = query.where((builder) => {
          builder
            .where("created_at", "<", cursorRecord.created_at)
            .orWhere((b) => {
              b.where("created_at", "=", cursorRecord.created_at).where(
                "id",
                "<",
                cursor,
              );
            });
        });
      }
    }

    // Fetch one extra to determine if there are more results
    const recipients = await query.limit(limit + 1);
    const hasMore = recipients.length > limit;

    if (hasMore) {
      recipients.pop();
    }

    const nextCursor = hasMore ? recipients[recipients.length - 1]?.id : null;

    return { data: recipients, hasMore, nextCursor };
  },

  async findByEmail(email: string): Promise<Recipient | null> {
    const recipient = await db(TABLES.RECIPIENTS).where({ email }).first();
    return recipient || null;
  },

  async findByEmails(emails: string[]): Promise<Recipient[]> {
    return db(TABLES.RECIPIENTS).whereIn("email", emails);
  },

  async upsertMany(
    inputs: { email: string; name?: string }[],
  ): Promise<Recipient[]> {
    if (inputs.length === 0) return [];

    // Prepare data with generated IDs
    const data = inputs.map((input) => ({
      id: generateUuidV7(),
      email: input.email,
      name: input.name || null,
    }));

    // Bulk upsert using ON CONFLICT
    await db(TABLES.RECIPIENTS)
      .insert(data)
      .onConflict("email")
      .merge(["name"]);

    // Fetch all upserted recipients
    const emails = inputs.map((i) => i.email);
    return db(TABLES.RECIPIENTS).whereIn("email", emails);
  },

  async create(input: CreateRecipientInput): Promise<Recipient> {
    const [recipient] = await db(TABLES.RECIPIENTS)
      .insert({
        id: generateUuidV7(),
        email: input.email,
        name: input.name || null,
      })
      .returning("*");

    return recipient;
  },

  async isEmailTaken(email: string): Promise<boolean> {
    const recipient = await db(TABLES.RECIPIENTS).where({ email }).first();
    return !!recipient;
  },
};
