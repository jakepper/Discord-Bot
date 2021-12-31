var Scraper = require('images-scraper');

const google = new Scraper({
    puppeteer: {
        headless: true
    }
});

module.exports = {
    name: 'image',
    aliases: ['img'],
    description: "Sends image based off of query",
    usage: "image <query>",
    async execute(message, args, client, Discord) {
        const imageQuery = args.join(' ');
        if (!imageQuery) return message.channel.send('Please send an image query');

        const imageResults = await google.scrape(imageQuery, 1);
        message.channel.send(imageResults[0].url);
    }
}