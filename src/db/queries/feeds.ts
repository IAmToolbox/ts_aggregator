// Functions that query the feeds table in the database

import { db } from "..";
import { users, feeds } from "../schema";
import { type InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

// Export type for feeds table
export type Feed = typeof feeds.$inferSelect;

// Query the creation of a new feed. MAKE SURE THE USER ID MATCHES BECAUSE IT'S A FOREIGN KEY
export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, userId: userId}).returning();
    return result;
}

// Query the search of a single feed by URL
export async function getFeedByUrl(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

// Query searching all feeds

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}
