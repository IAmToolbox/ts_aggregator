// Blog Aggregator in TypeScript!
// A Guided Project from Boot.dev

import type { CommandsRegistry } from "./commands.js";

import { setUser, readConfig } from "./config.js";
import { handlerLogin, registerCommand, runCommand } from "./commands.js";

function main() {
    const registry: CommandsRegistry = {};

    registerCommand(registry, "login", handlerLogin);
    const userArgs = process.argv.slice(2);
    if (userArgs.length === 0) {
        console.error("Not enough arguments. Please provide an argument.");
        exit(1);
    }

    const cmdName = userArgs[0];
    const args = userArgs.slice(1);
    runCommand(registry, cmdName, ...args);
}

main();
