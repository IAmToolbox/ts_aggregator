// Blog Aggregator in TypeScript!
// A Guided Project from Boot.dev

import { setUser, readConfig } from "./config.js";

function main() {
    const cfg = readConfig();
    setUser(cfg, "Toolbox");
    console.log(readConfig());
}

main();
