import knex from "knex";

import { config } from "../config/index.js";

const isTest = config.nodeEnv === "test";
const dbName = isTest ? `${config.db.name}_test` : config.db.name;

const db = knex({
  client: "pg",
  connection: config.db.url || {
    host: config.db.host,
    port: config.db.port,
    database: dbName,
    user: config.db.user,
    password: config.db.password,
  },
  pool: {
    min: 2,
    max: 10,
  },
});

export default db;
