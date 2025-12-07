import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const wishes = pgTable("wishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  category: text("category").notNull().default("products"),
  priority: text("priority").notNull().default("medium"),
  owner: text("owner").notNull().default("draven"),
  isCompleted: boolean("is_completed").notNull().default(false),
});

export const insertWishSchema = createInsertSchema(wishes).omit({
  id: true,
});

export type InsertWish = z.infer<typeof insertWishSchema>;
export type Wish = typeof wishes.$inferSelect;

export const categories = [
  { id: "all", label: "All Wishes", icon: "Sparkles" },
  { id: "products", label: "Products", icon: "Gift" },
  { id: "travel", label: "Travel", icon: "Plane" },
  { id: "shows", label: "Shows & Movies", icon: "Clapperboard" },
  { id: "games", label: "Games", icon: "Gamepad2" },
  { id: "collections", label: "Collections", icon: "Bookmark" },
  { id: "fashion", label: "Fashion", icon: "Shirt" },
  { id: "plans", label: "Future Plans", icon: "Calendar" },
] as const;

export const priorities = [
  { id: "high", label: "High Priority", color: "destructive" },
  { id: "medium", label: "Medium Priority", color: "warning" },
  { id: "low", label: "Low Priority", color: "success" },
] as const;

export const owners = [
  { id: "everyone", label: "Everyone", avatar: null },
  { id: "draven", label: "Draven", avatar: "D" },
  { id: "clairine", label: "Clairine", avatar: "C" },
  { id: "ours", label: "Our Dreams", avatar: "heart" },
] as const;

export type Category = typeof categories[number]["id"];
export type Priority = typeof priorities[number]["id"];
export type Owner = typeof owners[number]["id"];
