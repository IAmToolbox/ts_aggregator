// Functions to query the feed_follows table in the database. Lots of relational logic going on

import { db } from "..";
import { users, feeds, feedFollows} from "../schema";
import { eq } from "drizzle-orm";

// Multiple queries in one function here.
// This will insert a follow into the feed_follows table, then return a joined table with all info from that, as well as the names of the user and the feed
export async function createFeedFollow(userId: string, feedId: string) {
    const [newFeedFollow] = await db.insert(feedFollows).values({ userId: userId, feedId: feedId }).returning();
    const result = await db.select({

    })
}
