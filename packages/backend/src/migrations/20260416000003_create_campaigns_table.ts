import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create enum type for campaign status
  await knex.raw(`
    CREATE TYPE campaign_status AS ENUM ('draft','scheduled', 'sent')
  `);

  await knex.schema.createTable("campaigns", (table) => {
    table.uuid("id").primary();
    table.string("name", 255).notNullable();
    table.string("subject", 255).notNullable();
    table.text("body").notNullable();
    table
      .specificType("status", "campaign_status")
      .notNullable()
      .defaultTo("draft");
    table.timestamp("scheduled_at").nullable();
    table
      .uuid("created_by")
      .notNullable()
      .references("id")
      .inTable("users")
      // .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Indexes for filtering and pagination
    table.index("status", "idx_campaigns_status");
    table.index("created_at", "idx_campaigns_created_at");
    table.index("created_by", "idx_campaigns_created_by");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("campaigns");
  await knex.raw("DROP TYPE IF EXISTS campaign_status");
}
