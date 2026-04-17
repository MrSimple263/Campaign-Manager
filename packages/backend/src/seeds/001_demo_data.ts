import { Knex } from "knex";

import { generateUuidV7, hashPassword } from "../shared/utils/index.js";

export async function seed(knex: Knex): Promise<void> {
  // Clean existing data (in reverse order of dependencies)
  await knex("campaign_recipients").del();
  await knex("campaigns").del();
  await knex("recipients").del();
  await knex("users").del();

  // Create demo user
  const demoUserId = generateUuidV7();
  const passwordHash = await hashPassword("password123");

  await knex("users").insert({
    id: demoUserId,
    email: "demo@example.com",
    name: "Demo User",
    password_hash: passwordHash,
  });

  console.log("Created demo user: demo@example.com / password123");

  // Create sample recipients
  const recipients = [
    { id: generateUuidV7(), email: "john.doe@example.com", name: "John Doe" },
    {
      id: generateUuidV7(),
      email: "jane.smith@example.com",
      name: "Jane Smith",
    },
    {
      id: generateUuidV7(),
      email: "bob.wilson@example.com",
      name: "Bob Wilson",
    },
    {
      id: generateUuidV7(),
      email: "alice.johnson@example.com",
      name: "Alice Johnson",
    },
    {
      id: generateUuidV7(),
      email: "charlie.brown@example.com",
      name: "Charlie Brown",
    },
    {
      id: generateUuidV7(),
      email: "diana.prince@example.com",
      name: "Diana Prince",
    },
    {
      id: generateUuidV7(),
      email: "edward.norton@example.com",
      name: "Edward Norton",
    },
    {
      id: generateUuidV7(),
      email: "fiona.green@example.com",
      name: "Fiona Green",
    },
    {
      id: generateUuidV7(),
      email: "george.harris@example.com",
      name: "George Harris",
    },
    {
      id: generateUuidV7(),
      email: "hannah.white@example.com",
      name: "Hannah White",
    },
  ];

  await knex("recipients").insert(recipients);
  console.log(`Created ${recipients.length} sample recipients`);

  // Create campaigns in various states
  const campaigns = [
    {
      id: generateUuidV7(),
      name: "Welcome Campaign",
      subject: "Welcome to our platform!",
      body: "Dear {{name}},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team",
      status: "sent",
      created_by: demoUserId,
    },
    {
      id: generateUuidV7(),
      name: "Product Launch",
      subject: "Introducing our new product!",
      body: "Hello {{name}},\n\nWe're thrilled to announce our latest product launch!\n\nCheck it out at our website.\n\nBest,\nThe Team",
      status: "scheduled",
      scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      created_by: demoUserId,
    },
    {
      id: generateUuidV7(),
      name: "Newsletter Draft",
      subject: "Monthly Newsletter - April 2026",
      body: "Hi {{name}},\n\nHere's what happened this month:\n\n- Feature 1\n- Feature 2\n- Feature 3\n\nStay tuned for more updates!\n\nCheers,\nThe Team",
      status: "draft",
      created_by: demoUserId,
    },
    {
      id: generateUuidV7(),
      name: "Special Offer",
      subject: "Exclusive 20% discount just for you!",
      body: "Dear {{name}},\n\nAs a valued customer, we're offering you an exclusive 20% discount on all purchases this week.\n\nUse code: SPECIAL20\n\nHappy shopping!\nThe Team",
      status: "draft",
      created_by: demoUserId,
    },
  ];

  await knex("campaigns").insert(campaigns);
  console.log(`Created ${campaigns.length} sample campaigns`);

  // Create campaign recipients for the "sent" campaign
  const sentCampaign = campaigns[0];
  const sentCampaignRecipients = recipients.slice(0, 5).map((r) => ({
    campaign_id: sentCampaign.id,
    recipient_id: r.id,
    status: Math.random() < 0.9 ? "sent" : "failed",
    sent_at: Math.random() < 0.9 ? new Date() : null,
    opened_at: Math.random() < 0.3 ? new Date() : null,
  }));

  await knex("campaign_recipients").insert(sentCampaignRecipients);

  // Create campaign recipients for the "scheduled" campaign
  const scheduledCampaign = campaigns[1];
  const scheduledCampaignRecipients = recipients.slice(3, 8).map((r) => ({
    campaign_id: scheduledCampaign.id,
    recipient_id: r.id,
    status: "pending",
  }));

  await knex("campaign_recipients").insert(scheduledCampaignRecipients);

  // Create campaign recipients for the draft campaigns
  const draftCampaign1 = campaigns[2];
  const draftCampaign1Recipients = recipients.slice(0, 3).map((r) => ({
    campaign_id: draftCampaign1.id,
    recipient_id: r.id,
    status: "pending",
  }));

  await knex("campaign_recipients").insert(draftCampaign1Recipients);

  const draftCampaign2 = campaigns[3];
  const draftCampaign2Recipients = recipients.map((r) => ({
    campaign_id: draftCampaign2.id,
    recipient_id: r.id,
    status: "pending",
  }));

  await knex("campaign_recipients").insert(draftCampaign2Recipients);

  console.log("Created campaign-recipient associations");
  console.log("Seed completed successfully!");
}
