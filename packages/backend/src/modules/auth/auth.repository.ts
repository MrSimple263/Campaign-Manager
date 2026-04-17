import db from "../../db/index.js";
import { TABLES } from "../../shared/constants/index.js";
import { generateUuidV7 } from "../../shared/utils/index.js";

import type { User } from "../../shared/types/index.js";

export interface CreateUserData {
  email: string;
  name: string;
  password_hash: string;
}

export const authRepository = {
  async findByEmail(email: string): Promise<User | undefined> {
    return db(TABLES.USERS).where({ email }).first();
  },

  async findById(id: string): Promise<User | undefined> {
    return db(TABLES.USERS).where({ id }).first();
  },

  async create(data: CreateUserData): Promise<User> {
    const [user] = await db(TABLES.USERS)
      .insert({
        id: generateUuidV7(),
        email: data.email,
        name: data.name,
        password_hash: data.password_hash,
      })
      .returning("*");

    return user;
  },

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await db(TABLES.USERS).where({ email }).first();
    return !!user;
  },
};
