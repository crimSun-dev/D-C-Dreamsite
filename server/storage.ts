import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  users,
  wishes,
  type InsertUser,
  type InsertWish,
  type User,
  type Wish,
} from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
pool.on("error", (error) => {
  console.error("idle pg client error", error);
});

const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllWishes(): Promise<Wish[]>;
  getWish(id: string): Promise<Wish | undefined>;
  createWish(wish: InsertWish): Promise<Wish>;
  updateWish(id: string, wish: Partial<InsertWish>): Promise<Wish | undefined>;
  deleteWish(id: string): Promise<boolean>;
  deleteCompletedWishes(): Promise<number>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, id: randomUUID() })
      .returning();
    return user;
  }

  async getAllWishes(): Promise<Wish[]> {
    return db.select().from(wishes);
  }

  async getWish(id: string): Promise<Wish | undefined> {
    const [wish] = await db.select().from(wishes).where(eq(wishes.id, id));
    return wish;
  }

  async createWish(insertWish: InsertWish): Promise<Wish> {
    const [wish] = await db
      .insert(wishes)
      .values({
        id: randomUUID(),
        title: insertWish.title,
        description: insertWish.description ?? null,
        imageUrl: insertWish.imageUrl ?? null,
        category: insertWish.category ?? "products",
        priority: insertWish.priority ?? "medium",
        owner: insertWish.owner ?? "draven",
        isCompleted: insertWish.isCompleted ?? false,
      })
      .returning();
    return wish;
  }

  async updateWish(id: string, updates: Partial<InsertWish>): Promise<Wish | undefined> {
    const [wish] = await db.update(wishes).set(updates).where(eq(wishes.id, id)).returning();
    return wish;
  }

  async deleteWish(id: string): Promise<boolean> {
    const rows = await db.delete(wishes).where(eq(wishes.id, id)).returning();
    return rows.length > 0;
  }

  async deleteCompletedWishes(): Promise<number> {
    const rows = await db.delete(wishes).where(eq(wishes.isCompleted, true)).returning();
    return rows.length;
  }
}

export const storage = new DbStorage();
