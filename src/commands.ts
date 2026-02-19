// This file handles all functions and types related to commands

import { setUser, readConfig } from "./config";
import { createUser, getUser, deleteAllUsers } from "./db/queries/users";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>; // Yay promises!

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
        console.log(`User ${args[0]} has been set`);
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

export async function handlerDeleteAllUsers(cmdName: string): Promise<void> {
    try {
        await deleteAllUsers();
        console.log("Users table has been reset");
    } catch (err) {
        console.error("Something went wrong while deleting all users");
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
