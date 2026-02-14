// This file handles reading from and writing to the config file in the Home directory

import fs from "fs";
import os from "os";
import path from "path";

type Config = {
    dbUrl: string,
    currentUserName: string
};

export function setUser(cfg: Config, user: string): void {
    cfg.currentUserName = user;
    writeConfig(cfg);
}

export function readConfig(): Config {
    const rawConfig = JSON.parse(fs.readFileSync(getConfigFilePath(), {encoding: "utf-8"}));
    const cfg = validateConfig(rawConfig);
    return cfg;
}

function getConfigFilePath(): string {
    // Heavy assumption that the config file does exist in the home directory in the first place
    const filePath = path.join(os.homedir(), ".gatorconfig.json");
    return filePath;
}

function writeConfig(cfg: Config): void {
    fs.writeFileSync(getConfigFilePath(), JSON.stringify(cfg));
}

function validateConfig(rawConfig: any): Config {
    const keys = Object.keys(rawConfig);
    // Committing a sin and using a nested if
    if (keys.includes("dbUrl")) {
        if (keys.includes("currentUserName")) {
            console.log("Both keys exist");
            return {
                dbUrl: rawConfig.dbUrl,
                currentUserName: rawConfig.currentUserName
            };
        }
        console.log("One key exists");
        return {
            dbUrl: rawConfig.dbUrl,
            currentUserName: "placeholder" // This is the silliest way I've ever implemented a failsafe like this
        };
    }
    throw new Error("Something's wrong with the config file");
}
