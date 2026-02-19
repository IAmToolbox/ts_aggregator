// Functions that query the users table in the database

import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";

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

// Query a full table reset for testing purposes
export async function deleteAllUsers() {
    await db.delete(users);
}
