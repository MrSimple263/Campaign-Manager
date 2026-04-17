import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create enum type for campaign recipient status
  await knex.raw(`
    CREATE TYPE campaign_recipient_status AS ENUM ('pending', 'sent', 'failed')
  `);

  await knex.schema.createTable("campaign_recipients", (table) => {
    table
      .uuid("campaign_id")
      .notNullable()
      .references("id")
      .inTable("campaigns");
    // .onDelete("CASCADE");
    table
      .uuid("recipient_id")
      .notNullable()
      .references("id")
      .inTable("recipients");
    // .onDelete("CASCADE");
    table
      .specificType("status", "campaign_recipient_status")
      .notNullable()
      .defaultTo("pending");
    table.timestamp("sent_at").nullable();
    table.timestamp("opened_at").nullable();

    // Composite primary key
    table.primary(["campaign_id", "recipient_id"]);

    // Indexes for stats aggregation and filtering
    table.index(
      ["campaign_id", "status"],
      "idx_campaign_recipients_campaign_id_status",
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("campaign_recipients");
  await knex.raw("DROP TYPE IF EXISTS campaign_recipient_status");
}
