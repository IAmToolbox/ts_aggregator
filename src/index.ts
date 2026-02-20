// Blog Aggregator in TypeScript!
// A Guided Project from Boot.dev

import type { CommandsRegistry } from "./commands";

import { setUser, readConfig } from "./config";
import { handlerLogin, handlerRegisterUser, handlerGetUsers, handlerDeleteAllUsers, registerCommand, runCommand } from "./commands";

async function main() {
    const registry: CommandsRegistry = {};

    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegisterUser);
    registerCommand(registry, "users", handlerGetUsers);
    registerCommand(registry, "reset", handlerDeleteAllUsers);
    const userArgs = process.argv.slice(2);
    if (userArgs.length === 0) {
        console.error("Please provide a command.");
        process.exit(1);
    }

    const cmdName = userArgs[0];
    const args = userArgs.slice(1);
    await runCommand(registry, cmdName, ...args);
    process.exit(0);
}

main();
