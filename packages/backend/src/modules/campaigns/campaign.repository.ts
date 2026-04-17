import db from "../../db/index.js";
import {
  TABLES,
  CAMPAIGN_STATUS,
  RECIPIENT_STATUS,
} from "../../shared/constants/index.js";
import { generateUuidV7 } from "../../shared/utils/index.js";

import type { CampaignQuery, CampaignListItem } from "./campaign.types.js";
import type {
  Campaign,
  CampaignStatus,
  CampaignStats,
  CampaignRecipientWithDetails,
} from "../../shared/types/index.js";

export interface CreateCampaignData {
  name: string;
  subject: string;
  body: string;
  created_by: string;
}

export interface UpdateCampaignData {
  name?: string;
  subject?: string;
  body?: string;
  updated_at?: Date;
}

export interface FindManyResult {
  data: CampaignListItem[];
  hasMore: boolean;
  nextCursor: string | null;
}

export const campaignRepository = {
  async findById(id: string): Promise<Campaign | undefined> {
    return db(TABLES.CAMPAIGNS).where({ id }).first();
  },

  async findByIdAndUser(
    id: string,
    userId: string,
  ): Promise<Campaign | undefined> {
    return db(TABLES.CAMPAIGNS).where({ id, created_by: userId }).first();
  },

  async findMany(
    userId: string,
    options: CampaignQuery,
  ): Promise<FindManyResult> {
    const { limit = 20, cursor, status } = options;

    let query = db(TABLES.CAMPAIGNS)
      .where({ created_by: userId })
      .orderBy("created_at", "desc")
      .orderBy("id", "desc");

    // Apply status filter
    if (status) {
      query = query.where({ status });
    }

    // Apply cursor-based pagination
    if (cursor) {
      const cursorRecord = await db(TABLES.CAMPAIGNS)
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
    const campaigns = await query.limit(limit + 1);
    const hasMore = campaigns.length > limit;

    if (hasMore) {
      campaigns.pop();
    }

    // Add recipient count to each campaign
    const campaignsWithCount = await Promise.all(
      campaigns.map(async (campaign) => {
        const [{ count }] = await db(TABLES.CAMPAIGN_RECIPIENTS)
          .where({ campaign_id: campaign.id })
          .count("recipient_id as count");
        return { ...campaign, recipient_count: Number(count) };
      }),
    );

    const nextCursor = hasMore
      ? campaignsWithCount[campaignsWithCount.length - 1]?.id
      : null;

    return { data: campaignsWithCount, hasMore, nextCursor };
  },

  async create(data: CreateCampaignData): Promise<Campaign> {
    const [campaign] = await db(TABLES.CAMPAIGNS)
      .insert({
        id: generateUuidV7(),
        name: data.name,
        subject: data.subject,
        body: data.body,
        status: CAMPAIGN_STATUS.DRAFT,
        created_by: data.created_by,
      })
      .returning("*");

    return campaign;
  },

  async update(id: string, data: UpdateCampaignData): Promise<Campaign> {
    const [campaign] = await db(TABLES.CAMPAIGNS)
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning("*");

    return campaign;
  },

  async updateStatus(
    id: string,
    status: CampaignStatus,
    scheduledAt?: Date,
  ): Promise<Campaign> {
    const updateData: {
      status: CampaignStatus;
      updated_at: Date;
      scheduled_at?: Date;
    } = {
      status,
      updated_at: new Date(),
    };

    if (scheduledAt) {
      updateData.scheduled_at = scheduledAt;
    }

    const [campaign] = await db(TABLES.CAMPAIGNS)
      .where({ id })
      .update(updateData)
      .returning("*");

    return campaign;
  },

  async delete(id: string): Promise<void> {
    await db(TABLES.CAMPAIGNS).where({ id }).delete();
  },

  // Campaign Recipients methods
  async addRecipients(
    campaignId: string,
    recipientIds: string[],
  ): Promise<void> {
    const campaignRecipients = recipientIds.map((recipientId) => ({
      campaign_id: campaignId,
      recipient_id: recipientId,
      status: RECIPIENT_STATUS.PENDING,
    }));

    await db(TABLES.CAMPAIGN_RECIPIENTS).insert(campaignRecipients);
  },

  async clearRecipients(campaignId: string): Promise<void> {
    await db(TABLES.CAMPAIGN_RECIPIENTS)
      .where({ campaign_id: campaignId })
      .delete();
  },

  async getRecipients(
    campaignId: string,
  ): Promise<CampaignRecipientWithDetails[]> {
    return db(TABLES.CAMPAIGN_RECIPIENTS)
      .join(
        TABLES.RECIPIENTS,
        `${TABLES.CAMPAIGN_RECIPIENTS}.recipient_id`,
        `${TABLES.RECIPIENTS}.id`,
      )
      .where({ campaign_id: campaignId })
      .select(
        `${TABLES.RECIPIENTS}.id`,
        `${TABLES.RECIPIENTS}.email`,
        `${TABLES.RECIPIENTS}.name`,
        `${TABLES.CAMPAIGN_RECIPIENTS}.status`,
        `${TABLES.CAMPAIGN_RECIPIENTS}.sent_at`,
        `${TABLES.CAMPAIGN_RECIPIENTS}.opened_at`,
      );
  },

  async getStats(campaignId: string): Promise<CampaignStats> {
    const stats = await db(TABLES.CAMPAIGN_RECIPIENTS)
      .where({ campaign_id: campaignId })
      .select(
        db.raw("COUNT(*) as total"),
        db.raw("COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent"),
        db.raw("COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed"),
        db.raw("COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened"),
      )
      .first();

    const total = Number(stats?.total || 0);
    const sent = Number(stats?.sent || 0);
    const opened = Number(stats?.opened || 0);

    return {
      total,
      sent,
      failed: Number(stats?.failed || 0),
      opened,
      open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      send_rate: total > 0 ? Math.round((sent / total) * 100) : 0,
    };
  },

  async getPendingRecipients(
    campaignId: string,
  ): Promise<Array<{ recipient_id: string }>> {
    return db(TABLES.CAMPAIGN_RECIPIENTS)
      .where({ campaign_id: campaignId, status: RECIPIENT_STATUS.PENDING })
      .select("recipient_id");
  },

  async updateRecipientStatus(
    campaignId: string,
    recipientId: string,
    status: "sent" | "failed",
    sentAt?: Date,
  ): Promise<void> {
    const updateData: { status: string; sent_at?: Date } = { status };
    if (sentAt) {
      updateData.sent_at = sentAt;
    }

    await db(TABLES.CAMPAIGN_RECIPIENTS)
      .where({ campaign_id: campaignId, recipient_id: recipientId })
      .update(updateData);
  },

  async markRecipientOpened(
    campaignId: string,
    recipientId: string,
  ): Promise<void> {
    await db(TABLES.CAMPAIGN_RECIPIENTS)
      .where({
        campaign_id: campaignId,
        recipient_id: recipientId,
        status: "sent",
      })
      .update({ opened_at: new Date() });
  },
};
