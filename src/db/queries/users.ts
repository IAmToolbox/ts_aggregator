// Functions that query the users table in the database

import { db } from "..";
import { users } from "../schema";
import { type InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

// Export type for user table
export type User = typeof users.$inferSelect;

// Query the creation of a user in the database
export async function createUser(name: string) {
    const [result] = await db.insert(users).values({ name: name}).returning();
    return result;
}

// Query searching for a user in the database
export async function getUser(name: string) {
    const [result] = await db.select().from(users).where(eq(users.name, name));
    return result;
}

// Query all users from the database
export async function getUsers() {
    const result = await db.select().from(users);
    return result;
}

// Query a full table reset for testing purposes
export async function deleteAllUsers() {
    await db.delete(users);
}
