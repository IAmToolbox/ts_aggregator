// Blog Aggregator in TypeScript!
// A Guided Project from Boot.dev

import type { CommandsRegistry } from "./commands";

import { setUser, readConfig } from "./config";
import { handlerLogin, handlerRegisterUser, handlerGetUsers, handlerDeleteAllUsers, handlerAddFeed, handlerGetFeeds, handlerFollow, handlerGetFollows, handlerAggregate, registerCommand, middlewareLoggedIn, runCommand } from "./commands";

async function main() {
    const registry: CommandsRegistry = {};

    // Keep an eye out on the function signatures. Some of them will need to be wrapped in middleware to function properly.
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegisterUser);
    registerCommand(registry, "users", handlerGetUsers);
    registerCommand(registry, "reset", handlerDeleteAllUsers);
    registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, "feeds", handlerGetFeeds);
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following", middlewareLoggedIn(handlerGetFollows));
    registerCommand(registry, "agg", handlerAggregate);
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
