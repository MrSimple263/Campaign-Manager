import knex from "knex";
import { beforeAll, afterAll } from "vitest";

import config from "../knexfile.js";

const db = knex(config.test);

// Global setup before all tests
beforeAll(async () => {
  try {
    // Run migrations
    await db.migrate.latest();
    console.log("✓ Test database migrations completed");
  } catch (error) {
    console.error("✗ Failed to run migrations:", error);
    throw error;
  }
});

// Global teardown after all tests
afterAll(async () => {
  try {
    // Rollback migrations
    await db.migrate.rollback(undefined, true);
    console.log("✓ Test database rolled back");
    await db.destroy();
    console.log("✓ Test database connection closed");
  } catch (error) {
    console.error("✗ Failed to teardown:", error);
    throw error;
  }
});

export { db };
