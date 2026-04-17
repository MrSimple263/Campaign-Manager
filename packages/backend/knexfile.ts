import * as dotenv from "dotenv";

import type { Knex } from "knex";

dotenv.config({ path: "../../.env" });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: "./src/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/seeds",
      extension: "ts",
    },
    pool: {
      min: 1,
      max: 2,
    },
  },

  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: "./dist/migrations",
    },
    seeds: {
      directory: "./dist/seeds",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;
