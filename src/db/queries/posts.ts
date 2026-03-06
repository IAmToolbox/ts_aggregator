// Functions that query the posts table in the database

import { db } from "..";
import { posts } from "../schema";
import { eq, desc } from "drizzle-orm";

// Query the creation of a new post from a feed
export async function createPost(title: string, url: string, description: string, publishedAt: Date, feedId: string) {
    const [result] = await db.insert(posts).values({ title: title, url: url, description: description, publishedAt: publishedAt, feedId: feedId }).returning()
    // Jeez that query looks like it was written by the Department of Redundancy Department
    return result;
}

// Query the posts from a feed the user's following. This will be handled in the handler function
export async function getPostsForUser(feedId: string, limit: number) {
    const result = await db.select().from(posts).where(eq(posts.feedId, feedId)).orderBy(desc(posts.publishedAt)).limit(limit);
    return result;
}
