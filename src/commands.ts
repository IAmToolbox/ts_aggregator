// This file handles all functions and types related to commands

import { setUser, readConfig } from "./config.js";

type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;

export function handlerLogin(cmdName: string, ...args: string[]): void {
    if (args.length === 0 || args === undefined) {
        throw new Error("Username is required");
    }
    setUser(readConfig(), args[0]);
    console.log(`User ${args[0]} has been set`);
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): void {
    if (registry[cmdName]) {
        registry[cmdName](cmdName, ...args);
    }
    else {
        throw new Error("Command not found");
    }
}
