// Blog Aggregator in TypeScript!
// A Guided Project from Boot.dev

import type { CommandsRegistry } from "./commands";

import { setUser, readConfig } from "./config";
import * as commands from "./commands";

async function main() {
    const registry: CommandsRegistry = {};

    // Keep an eye out on the function signatures. Some of them will need to be wrapped in middleware to function properly.
    commands.registerCommand(registry, "login", commands.handlerLogin);
    commands.registerCommand(registry, "register", commands.handlerRegisterUser);
    commands.registerCommand(registry, "users", commands.handlerGetUsers);
    commands.registerCommand(registry, "reset", commands.handlerDeleteAllUsers);
    commands.registerCommand(registry, "addfeed", commands.middlewareLoggedIn(commands.handlerAddFeed));
    commands.registerCommand(registry, "feeds", commands.handlerGetFeeds);
    commands.registerCommand(registry, "follow", commands.middlewareLoggedIn(commands.handlerFollow));
    commands.registerCommand(registry, "following", commands.middlewareLoggedIn(commands.handlerGetFollows));
    commands.registerCommand(registry, "unfollow", commands.middlewareLoggedIn(commands.handlerUnfollow));
    commands.registerCommand(registry, "agg", commands.handlerAggregate);
    const userArgs = process.argv.slice(2);
    if (userArgs.length === 0) {
        console.error("Please provide a command.");
        process.exit(1);
    }

    const cmdName = userArgs[0];
    const args = userArgs.slice(1);
    await commands.runCommand(registry, cmdName, ...args);
    process.exit(0);
}

main();
