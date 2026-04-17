import { CAMPAIGN_STATUS } from "../../shared/constants/index.js";
import { AppError } from "../../shared/middleware/index.js";
import { recipientRepository } from "../recipients/recipient.repository.js";

import { campaignRepository } from "./campaign.repository.js";

import type {
  CampaignQuery,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignWithRecipients,
  CampaignDetailResponse,
  CampaignListItem,
} from "./campaign.types.js";
import type { Campaign, CampaignStats } from "../../shared/types/index.js";

interface CampaignListResult {
  data: CampaignListItem[];
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Simulates sending a single email with realistic delay and success rate.
 */
async function simulateSendEmail(
  campaignId: string,
  recipientId: string,
): Promise<void> {
  // Simulate network delay (50-200ms)
  await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 150));

  // 90% success rate
  const isSuccess = Math.random() < 0.9;

  if (isSuccess) {
    await campaignRepository.updateRecipientStatus(
      campaignId,
      recipientId,
      "sent",
      new Date(),
    );

    // 30% chance the recipient "opens" the email (for demo purposes)
    if (Math.random() < 0.3) {
      // Simulate delayed open (1-5 seconds later)
      setTimeout(
        async () => {
          await campaignRepository.markRecipientOpened(campaignId, recipientId);
        },
        1000 + Math.random() * 4000,
      );
    }
  } else {
    await campaignRepository.updateRecipientStatus(
      campaignId,
      recipientId,
      "failed",
    );
  }
}

/**
 * Sends campaign emails asynchronously.
 */
async function sendCampaignEmails(campaignId: string): Promise<void> {
  const recipients = await campaignRepository.getPendingRecipients(campaignId);

  for (const recipient of recipients) {
    await simulateSendEmail(campaignId, recipient.recipient_id);
  }

  await campaignRepository.updateStatus(
    campaignId,
    CAMPAIGN_STATUS.SENT as "sent",
  );

  console.log(
    `Campaign ${campaignId} completed sending to ${recipients.length} recipients`,
  );
}

export const campaignService = {
  async getCampaigns(
    userId: string,
    options: CampaignQuery,
  ): Promise<CampaignListResult> {
    return campaignRepository.findMany(userId, options);
  },

  async getCampaign(
    id: string,
    userId: string,
  ): Promise<CampaignDetailResponse> {
    const campaign = await campaignRepository.findByIdAndUser(id, userId);
    if (!campaign) {
      throw new AppError(404, "Campaign not found");
    }

    const recipients = await campaignRepository.getRecipients(id);

    return { campaign, recipients };
  },

  async createCampaign(
    userId: string,
    input: CreateCampaignInput,
  ): Promise<CampaignWithRecipients> {
    const { name, subject, body, recipients } = input;

    // Upsert recipients (find-or-create by email)
    const upsertedRecipients = await recipientRepository.upsertMany(recipients);
    const recipientIds = upsertedRecipients.map((r) => r.id);

    // Create campaign
    const campaign = await campaignRepository.create({
      name,
      subject,
      body,
      created_by: userId,
    });

    // Add recipients
    await campaignRepository.addRecipients(campaign.id, recipientIds);

    // Get recipients for response
    const campaignRecipients = await campaignRepository.getRecipients(
      campaign.id,
    );

    return {
      ...campaign,
      recipients: campaignRecipients,
      recipient_count: campaignRecipients.length,
    };
  },

  async updateCampaign(
    id: string,
    userId: string,
    input: UpdateCampaignInput,
  ): Promise<CampaignWithRecipients> {
    const { name, subject, body, recipients } = input;

    // Check if campaign exists and is draft
    const existingCampaign = await campaignRepository.findByIdAndUser(
      id,
      userId,
    );
    if (!existingCampaign) {
      throw new AppError(404, "Campaign not found");
    }

    if (existingCampaign.status !== CAMPAIGN_STATUS.DRAFT) {
      throw new AppError(400, "Only draft campaigns can be edited");
    }

    // Build update data
    const updateData: { name?: string; subject?: string; body?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (body !== undefined) updateData.body = body;

    // Update campaign
    const campaign = await campaignRepository.update(id, updateData);

    // Update recipients if provided
    if (recipients !== undefined) {
      const upsertedRecipients =
        await recipientRepository.upsertMany(recipients);
      const recipientIds = upsertedRecipients.map((r) => r.id);

      await campaignRepository.clearRecipients(id);
      await campaignRepository.addRecipients(id, recipientIds);
    }

    // Get updated recipients
    const campaignRecipients = await campaignRepository.getRecipients(id);

    return {
      ...campaign,
      recipients: campaignRecipients,
      recipient_count: campaignRecipients.length,
    };
  },

  async deleteCampaign(id: string, userId: string): Promise<void> {
    const campaign = await campaignRepository.findByIdAndUser(id, userId);
    if (!campaign) {
      throw new AppError(404, "Campaign not found");
    }

    if (campaign.status !== CAMPAIGN_STATUS.DRAFT) {
      throw new AppError(400, "Only draft campaigns can be deleted");
    }

    await campaignRepository.delete(id);
  },

  async scheduleCampaign(
    id: string,
    userId: string,
    scheduledAt: string,
  ): Promise<Campaign> {
    const campaign = await campaignRepository.findByIdAndUser(id, userId);
    if (!campaign) {
      throw new AppError(404, "Campaign not found");
    }

    if (campaign.status !== CAMPAIGN_STATUS.DRAFT) {
      throw new AppError(400, "Only draft campaigns can be scheduled");
    }

    return campaignRepository.updateStatus(
      id,
      CAMPAIGN_STATUS.SCHEDULED as "scheduled",
      new Date(scheduledAt),
    );
  },

  async sendCampaign(id: string, userId: string): Promise<Campaign> {
    const campaign = await campaignRepository.findByIdAndUser(id, userId);
    if (!campaign) {
      throw new AppError(404, "Campaign not found");
    }

    if (campaign.status !== CAMPAIGN_STATUS.DRAFT) {
      throw new AppError(400, "Only draft campaigns can be sent");
    }

    // Update status to sending first
    const updatedCampaign = await campaignRepository.updateStatus(
      id,
      CAMPAIGN_STATUS.SENT as "sent",
    );

    // Send emails asynchronously (fire and forget)
    sendCampaignEmails(id).catch((error) => {
      console.error(`Failed to send campaign ${id}:`, error);
    });

    return updatedCampaign;
  },

  async getStats(id: string, userId: string): Promise<CampaignStats> {
    const campaign = await campaignRepository.findByIdAndUser(id, userId);
    if (!campaign) {
      throw new AppError(404, "Campaign not found");
    }

    return campaignRepository.getStats(id);
  },
};
