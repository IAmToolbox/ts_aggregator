// Gonna keep everything related to fetching the RSS feeds in here

import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
}

const parser = new XMLParser();
const headers = new Headers({
    "User-Agent": "gator", // This header identifies the program to the server we're requesting the data from'
});

export async function fetchFeed(feedURL: string): RSSFeed {
    const responseObject = await fetch(feedURL, { headers: headers });
    const response = await responseObject.text();

    const parsedObject = parser.parse(response);
    if (!parsedObject.rss.channel) {
        console.error("Unable to parse feed");
        process.exit(1);
    }
    const channel = parsedObject.rss.channel;
    const title = channel.title;
    const link = channel.link;
    const description = channel.description;
    const items = [];
    if (channel.item) {
        if (Array.isArray(channel.item)) {
            for (let item of channel.item) {
                items.push({
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    pubDate: item.pubDate,
                });
            }
        } else {
            items.push({
                title: parsedObject.channel.item.title,
                link: parsedObject.channel.item.link,
                description: parsedObject.channel.item.description,
                pubDate: parsedObject.channel.item.pubDate,
            });
        }
    }

    return {
        channel: {
            title: title,
            link: link,
            description: description,
            item: items,
        },
    };
}
