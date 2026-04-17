import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("recipients", (table) => {
    table.uuid("id").primary();
    table.string("email", 255).notNullable().unique();
    table.string("name", 255).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Index for cursor-based pagination
    table.index("created_at", "idx_recipients_created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("recipients");
}
