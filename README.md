## GATOR: THE BLOG AGGREGATOR 🐊

gator is a program that allows you to follow RSS Feeds and display them right from your command line.

# Requirements

gator works best on a Unix-like environment. If you're using MacOS or Linux you should be set, but if you're on Windows make sure you're using WSL.

To make sure installation runs smoothly, install NVM (https://github.com/nvm-sh/nvm)

To run the database make sure you install PostgreSQL version 16 or higher. On MacOS run this command:

```bash
brew install postgresql@16
```

On Debian-based Linux distributions and WSL installs, run these commands:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

- RHEL distros such as Fedora may need additional support. Please refer to external documentation for more information.

# Installation

To begin installation, clone this repository onto a directory of your choice

```bash
git clone "https://github.com/IAmToolbox/ts_aggregator.git"
```

Make sure you `cd` into the new directory, and run the following commands:

```bash
nvm use
npm install
```

gator is now installed in this directory. 

A PostgreSQL database will be needed to run the program. Run the included `psql` program to create a database.

On MacOS run this command:

```bash
psql postgres
```

On Linux and WSL run this command:

```bash
sudo -u postgres psql
```

Afterwards, query the creation of the database:

```sql
CREATE DATABASE gator;
```

Before you can run commands, a `.gatorconfig.json` file will be needed in your Home directory. It will have a structure like this:

```json
{"dbUrl":"postgres://username:password@localhost:5432/gator?sslmode=disable","currentUserName":"user"}
```

The dbUrl field will have your postgres connection string. On MacOS the username will be your username, but on Linux and WSL it will be the postgres user.

After setting this up, run the included migration script:

```bash
npm run migrate
```

# Usage

While in the directory, you can run the `start` script alongside arguments to use the program

```bash
npm run start [arguments]
```

Here are some commands you can use:

- `register [username]`: Register a new user
- `login [username]`: Set a user as the current user
- `addfeed [name] [url]`: Adds a new feed
- `agg [duration]`: Aggregates posts from feeds
- `browse [limit]`: Views the latest posts from all followed feeds

## I hope you enjoy using gator to follow your favorite RSS feeds 🐊

This is a guided project from the backend TypeScript path of Boot.dev
