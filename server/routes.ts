import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWishSchema } from "@shared/schema";
import { z } from "zod";

const updateWishSchema = insertWishSchema.partial();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/wishes", async (_req, res) => {
    try {
      const wishes = await storage.getAllWishes();
      res.json(wishes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wishes" });
    }
  });

  app.get("/api/wishes/:id", async (req, res) => {
    try {
      const wish = await storage.getWish(req.params.id);
      if (!wish) {
        return res.status(404).json({ error: "Wish not found" });
      }
      res.json(wish);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wish" });
    }
  });

  app.post("/api/wishes", async (req, res) => {
    try {
      const parsed = insertWishSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid wish data", details: parsed.error.errors });
      }
      const wish = await storage.createWish(parsed.data);
      res.status(201).json(wish);
    } catch (error) {
      res.status(500).json({ error: "Failed to create wish" });
    }
  });

  app.patch("/api/wishes/:id", async (req, res) => {
    try {
      const parsed = updateWishSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid update data", details: parsed.error.errors });
      }
      
      const filteredData = Object.fromEntries(
        Object.entries(parsed.data).filter(([_, value]) => value !== undefined)
      );
      
      const wish = await storage.updateWish(req.params.id, filteredData);
      if (!wish) {
        return res.status(404).json({ error: "Wish not found" });
      }
      res.json(wish);
    } catch (error) {
      res.status(500).json({ error: "Failed to update wish" });
    }
  });

  app.delete("/api/wishes/completed/all", async (_req, res) => {
    try {
      const count = await storage.deleteCompletedWishes();
      res.json({ deleted: count });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete completed wishes" });
    }
  });

  app.delete("/api/wishes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWish(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Wish not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wish" });
    }
  });

  return httpServer;
}
