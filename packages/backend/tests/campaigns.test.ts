import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";

import app from "../src/app.js";
import { generateUuidV7, hashPassword } from "../src/utils/index.js";
import { db } from "./setup.js";

describe("Campaign API Business Logic Tests", () => {
  let authToken: string;
  let userId: string;
  let recipientIds: string[];

  afterAll(async () => {
    // Clean up after all tests
    await db("campaign_recipients").del();
    await db("campaigns").del();
    await db("recipients").del();
    await db("users").del();
  });

  beforeEach(async () => {
    // Clean tables
    await db("campaign_recipients").del();
    await db("campaigns").del();
    await db("recipients").del();
    await db("users").del();

    // Create test user
    userId = generateUuidV7();
    const passwordHash = await hashPassword("password123");
    await db("users").insert({
      id: userId,
      email: "test@example.com",
      name: "Test User",
      password_hash: passwordHash,
    });

    // Login to get token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });
    authToken = loginRes.body.data.token;

    // Create test recipients
    recipientIds = [generateUuidV7(), generateUuidV7(), generateUuidV7()];
    await db("recipients").insert([
      {
        id: recipientIds[0],
        email: "recipient1@example.com",
        name: "Recipient 1",
      },
      {
        id: recipientIds[1],
        email: "recipient2@example.com",
        name: "Recipient 2",
      },
      {
        id: recipientIds[2],
        email: "recipient3@example.com",
        name: "Recipient 3",
      },
    ]);
  });

  describe("Test: Cannot edit campaign with status != draft", () => {
    it("should return 400 when trying to edit a sent campaign", async () => {
      // Create a campaign
      const createRes = await request(app)
        .post("/api/campaigns")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Campaign",
          subject: "Test Subject",
          body: "Test Body",
          recipient_ids: recipientIds,
        });

      expect(createRes.status).toBe(201);
      const campaignId = createRes.body.data.id;

      // Send the campaign
      const sendRes = await request(app)
        .post(`/api/campaigns/${campaignId}/send`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(sendRes.status).toBe(200);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Try to edit the sent campaign
      const updateRes = await request(app)
        .patch(`/api/campaigns/${campaignId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Updated Name" });

      expect(updateRes.status).toBe(400);
      expect(updateRes.body.message).toContain("draft");
    });

    it("should return 400 when trying to edit a scheduled campaign", async () => {
      // Create a campaign
      const createRes = await request(app)
        .post("/api/campaigns")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Campaign",
          subject: "Test Subject",
          body: "Test Body",
          recipient_ids: recipientIds,
        });

      const campaignId = createRes.body.data.id;

      // Schedule the campaign
      const futureDate = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();
      await request(app)
        .post(`/api/campaigns/${campaignId}/schedule`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ scheduled_at: futureDate });

      // Try to edit the scheduled campaign
      const updateRes = await request(app)
        .patch(`/api/campaigns/${campaignId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Updated Name" });

      expect(updateRes.status).toBe(400);
      expect(updateRes.body.message).toContain("draft");
    });
  });

  describe("Test: Cannot schedule with past timestamp", () => {
    it("should return 400 when scheduling with a past date", async () => {
      // Create a campaign
      const createRes = await request(app)
        .post("/api/campaigns")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Campaign",
          subject: "Test Subject",
          body: "Test Body",
          recipient_ids: recipientIds,
        });

      const campaignId = createRes.body.data.id;

      // Try to schedule with a past date
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const scheduleRes = await request(app)
        .post(`/api/campaigns/${campaignId}/schedule`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ scheduled_at: pastDate });

      expect(scheduleRes.status).toBe(400);
      expect(scheduleRes.body.message).toContain("Validation failed");
    });

    it("should allow scheduling with a future date", async () => {
      // Create a campaign
      const createRes = await request(app)
        .post("/api/campaigns")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Campaign",
          subject: "Test Subject",
          body: "Test Body",
          recipient_ids: recipientIds,
        });

      const campaignId = createRes.body.data.id;

      // Schedule with a future date
      const futureDate = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();
      const scheduleRes = await request(app)
        .post(`/api/campaigns/${campaignId}/schedule`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ scheduled_at: futureDate });

      expect(scheduleRes.status).toBe(200);
      expect(scheduleRes.body.data.status).toBe("scheduled");
    });
  });

  describe("Test: Send marks recipients correctly", () => {
    it("should update recipient statuses after sending", async () => {
      // Create a campaign
      const createRes = await request(app)
        .post("/api/campaigns")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Campaign",
          subject: "Test Subject",
          body: "Test Body",
          recipient_ids: recipientIds,
        });

      const campaignId = createRes.body.data.id;

      // Verify initial status is pending
      const initialRecipients = await db("campaign_recipients").where({
        campaign_id: campaignId,
      });

      expect(initialRecipients.every((r) => r.status === "pending")).toBe(true);

      // Send the campaign
      const sendRes = await request(app)
        .post(`/api/campaigns/${campaignId}/send`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.data.status).toBe("sending");

      // Wait for async processing to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check recipient statuses have been updated
      const updatedRecipients = await db("campaign_recipients").where({
        campaign_id: campaignId,
      });

      // At least some recipients should be marked as sent or failed
      const processedRecipients = updatedRecipients.filter(
        (r) => r.status === "sent" || r.status === "failed",
      );

      expect(processedRecipients.length).toBeGreaterThan(0);

      // Check campaign status is now "sent"
      const campaign = await db("campaigns").where({ id: campaignId }).first();
      expect(campaign.status).toBe("sent");
    });
  });

  describe("Test: Cannot delete non-draft campaign", () => {
    it("should return 400 when trying to delete a sent campaign", async () => {
      // Create and send a campaign
      const createRes = await request(app)
        .post("/api/campaigns")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Campaign",
          subject: "Test Subject",
          body: "Test Body",
          recipient_ids: recipientIds,
        });

      const campaignId = createRes.body.data.id;

      // Send the campaign
      await request(app)
        .post(`/api/campaigns/${campaignId}/send`)
        .set("Authorization", `Bearer ${authToken}`);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Try to delete the sent campaign
      const deleteRes = await request(app)
        .delete(`/api/campaigns/${campaignId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body.message).toContain("draft");
    });

    it("should allow deleting a draft campaign", async () => {
      // Create a campaign
      const createRes = await request(app)
        .post("/api/campaigns")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Campaign",
          subject: "Test Subject",
          body: "Test Body",
          recipient_ids: recipientIds,
        });

      const campaignId = createRes.body.data.id;

      // Delete the draft campaign
      const deleteRes = await request(app)
        .delete(`/api/campaigns/${campaignId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(204);

      // Verify campaign is deleted
      const campaign = await db("campaigns").where({ id: campaignId }).first();
      expect(campaign).toBeUndefined();
    });
  });
});
