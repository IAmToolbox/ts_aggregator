// This file handles all functions and types related to commands

import { setUser, readConfig } from "./config";
import { createUser, getUser, getUserFromId, getUsers, deleteAllUsers } from "./db/queries/users";
import { createFeed, getFeedByUrl, getFeeds, markFeedFetched, getNextFeedToFetch } from "./db/queries/feeds";
import { createFeedFollow, getFeedFollowsForUser, deleteFeedFollow } from "./db/queries/feed_follows";
import { fetchFeed } from "./feed";

import { type User } from "./db/queries/users";
import { type Feed } from "./db/queries/feeds";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>; // Yay promises!
type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

// These are the handler functions. They handle the commands that gator supports

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length === 0 || args === undefined) {
        throw new Error("Username is required");
    }
    try {
        const result = await getUser(args[0]);
        if (result.length === 0 || result === undefined) {
            throw new Error("User doesn't exist!");
        }
        setUser(readConfig(), args[0]);
        console.log(`User ${args[0]} has logged in.`);
    } catch (err) {
        console.error(`User ${args[0]} doesn't exist. Please register this user before logging in.`);
        process.exit(1);
    }
}

export async function handlerRegisterUser(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length === 0 || args === undefined) {
        throw new Error("Please provide a username to register");
    }
    try {
        const result = await createUser(args[0]);
        setUser(readConfig(), args[0]);
        console.log(`User ${args[0]} has been created`);
        console.log(result);
    } catch (err) {
        console.error(`User ${args[0]} already exists. Please register a different user.`);
        process.exit(1);
    }
}

export async function handlerGetUsers(cmdName: string): Promise<void> {
    const users = await getUsers();
    if (users.length === 0 || users === undefined) {
        console.log("No users registered");
        process.exit(0);
    }
    const cfg = readConfig()
    for (let user of users) {
        if (user.name === cfg.currentUserName) {
            console.log(`* ${user.name} (current)`);
            continue;
        }
        console.log(`* ${user.name}`);
    }
}

export async function handlerDeleteAllUsers(cmdName: string): Promise<void> {
    try {
        await deleteAllUsers();
        console.log("Users table has been reset");
    } catch (err) {
        console.error("Something went wrong while deleting all users");
        process.exit(1);
    }
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length !== 2 || args === undefined) {
        console.error("Not enough arguments. Please provide a feed name and a url.");
        process.exit(1);
    }

    try {
        const result = await createFeed(args[0], args[1], user.id);
        console.log(`Feed ${args[0]} has been created.`);
        printFeed(result, user);
        await handlerFollow(cmdName, user, args[1]); // We love reusing functions here :D
    } catch (err) {
        console.error(`Feed ${args[0]} already exists`);
        process.exit(1);
    }
}

export async function handlerGetFeeds(cmdName: string): Promise<void> {
    const feeds = await getFeeds();
    if (feeds.length === 0 || feeds === undefined) {
        console.log("No feeds registered");
        process.exit(0);
    }
    for (let feed of feeds) {
        const feedUser = await getUserFromId(feed.userId);
        console.log(`* ${feed.name} | ${feedUser.name}\n  - ${feed.url}`)
    }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length === 0 || args === undefined) {
        console.error("Please provide a url for the follow");
        process.exit(1);
    }

    const feed = await getFeedByUrl(args[0]);
    try {
        const createdFollow = await createFeedFollow(user.id, feed.id);
        console.log(`${user.name} followed feed ${feed.name}`);
        console.log(createdFollow.at(-1)); // Why do I have to do it this way Python has it figured out......
    } catch (err) {
        console.error("Feed follow couldn't be created...");
        process.exit(1);
    }
}

export async function handlerGetFollows(cmdName: string, user: User): Promise<void> {
    try {
        const follows = await getFeedFollowsForUser(user.id);
        if (follows.length === 0) {
            console.log(`${user.name} isn't following any feeds`);
            process.exit(0);
        }
        console.log(`${user.name} is following:`);
        for (let follow of follows) {
            console.log(`* ${follow.feedName}`);
        }
    } catch (err) {
        console.error(`Couldn't get follows for user ${user.name}`);
        process.exit(1);
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length === 0 || args === undefined) {
        console.error("Please provide a url to unfollow");
        process.exit(1);
    }

    const feed = await getFeedByUrl(args[0]);
    try {
        await deleteFeedFollow(user.id, feed.id);
        console.log(`${user.name} unfollowed the feed ${feed.name}`);
    } catch (err) {
        console.error("Couldn't unfollow feed");
        console.error(err);
    }
}

export async function handlerAggregate(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length === 0 || args === undefined) {
        console.error("Please provide a duration string");
        process.exit(1);
    }

    const timeBetweenRequests = parseDuration(args[0]);
    console.log(`Collecting feeds every ${args[0]}`);
    try {
        await scrapeFeeds();

        const interval = setInterval(() => {
            scrapeFeeds();
        }, timeBetweenRequests);

        await new Promise<void>((resolve) => {
            process.on("SIGINT", () => {
                console.log("\nShutting down feed aggregator...");
                clearInterval(interval);
                resolve();
            });
        });
    } catch (err) {
        console.error("Something went horribly wrong");
        console.error(err);
        process.exit(1);
    }
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    if (registry[cmdName]) {
        await registry[cmdName](cmdName, ...args);
    }
    else {
        throw new Error("Command not found");
    }
}

// This function is a middleware that keeps the check for a logged in user in a safe space
export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]) => {
        const cfg = readConfig();
        const user = await getUser(cfg.currentUserName);
        if (!user) {
            throw new Error(`User ${cfg.currentUserName} not found`);
        }
        await handler(cmdName, user, ...args);
    }
}

// This function is constantly called by the handlerAggregate
async function scrapeFeeds(): Promise<void> {
    const feed = await getNextFeedToFetch();
    await markFeedFetched(feed.id);
    const feedContents = await fetchFeed(feed.url);
    for (let item of feedContents.channel.item) {
        console.log(item.title);
    }
    console.log("\n"); // Give a little bit of space between feeds
}

function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (match === null) {
        console.error("Match failed. Please give a duration string (e.g 10m, 1s, 1h)");
        process.exit(1);
    }
    // Handle conversions
    switch (match[2]) {
        case "ms":
            return parseInt(match[1]);
        case "s":
            let durationSeconds = parseInt(match[1]);
            return durationSeconds * 1000;
        case "m":
            let durationMinutes = parseInt(match[1]);
            return (durationMinutes * 60) * 1000;
        case "h":
            let durationHours = parseInt(match[1]);
            return ((durationHours * 60) * 60) * 1000;
        default: // Just in case the regex fails to catch some weird edge case
            console.error("Incorrect duration string. Remember to use ms, s, m, or h after the number");
            process.exit(1);
    }
}

function printFeed(feed: Feed, user: User): void {
    console.log(feed);
    console.log(user);
}
