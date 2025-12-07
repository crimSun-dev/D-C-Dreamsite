import { type User, type InsertUser, type Wish, type InsertWish } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private wishes: Map<string, Wish>;

  constructor() {
    this.users = new Map();
    this.wishes = new Map();
    
    this.seedWishes();
  }

  private seedWishes() {
    const sampleWishes: Wish[] = [
      {
        id: randomUUID(),
        title: "PlayStation 5",
        description: "To play co-op games together on cozy evenings",
        imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=60",
        category: "games",
        priority: "medium",
        owner: "draven",
        isCompleted: false,
      },
      {
        id: randomUUID(),
        title: "Matching Couple Rings",
        description: "Silver bands with our initials engraved inside",
        imageUrl: null,
        category: "products",
        priority: "high",
        owner: "ours",
        isCompleted: true,
      },
      {
        id: randomUUID(),
        title: "Build a Lego Set Together",
        description: "The big Hogwarts Castle set for weekend project",
        imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=60",
        category: "collections",
        priority: "high",
        owner: "ours",
        isCompleted: false,
      },
      {
        id: randomUUID(),
        title: "Start a Garden",
        description: "Plant flowers and vegetables on our balcony",
        imageUrl: null,
        category: "plans",
        priority: "high",
        owner: "ours",
        isCompleted: false,
      },
      {
        id: randomUUID(),
        title: "Stardew Valley Co-op",
        description: "Build a farm together in the game",
        imageUrl: null,
        category: "games",
        priority: "low",
        owner: "clairine",
        isCompleted: true,
      },
      {
        id: randomUUID(),
        title: "Trip to Japan",
        description: "Visit Tokyo and Kyoto during cherry blossom season",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=60",
        category: "travel",
        priority: "high",
        owner: "ours",
        isCompleted: false,
      },
    ];

    sampleWishes.forEach((wish) => {
      this.wishes.set(wish.id, wish);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllWishes(): Promise<Wish[]> {
    return Array.from(this.wishes.values());
  }

  async getWish(id: string): Promise<Wish | undefined> {
    return this.wishes.get(id);
  }

  async createWish(insertWish: InsertWish): Promise<Wish> {
    const id = randomUUID();
    const wish: Wish = {
      id,
      title: insertWish.title,
      description: insertWish.description ?? null,
      imageUrl: insertWish.imageUrl ?? null,
      category: insertWish.category ?? "products",
      priority: insertWish.priority ?? "medium",
      owner: insertWish.owner ?? "draven",
      isCompleted: insertWish.isCompleted ?? false,
    };
    this.wishes.set(id, wish);
    return wish;
  }

  async updateWish(id: string, updates: Partial<InsertWish>): Promise<Wish | undefined> {
    const wish = this.wishes.get(id);
    if (!wish) return undefined;

    const updatedWish: Wish = {
      ...wish,
      ...updates,
    };
    this.wishes.set(id, updatedWish);
    return updatedWish;
  }

  async deleteWish(id: string): Promise<boolean> {
    return this.wishes.delete(id);
  }

  async deleteCompletedWishes(): Promise<number> {
    let count = 0;
    const entries = Array.from(this.wishes.entries());
    for (const [id, wish] of entries) {
      if (wish.isCompleted) {
        this.wishes.delete(id);
        count++;
      }
    }
    return count;
  }
}

export const storage = new MemStorage();
