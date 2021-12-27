module.exports = {
    name: 'ping',
    description: "pings the bot!",
    execute(message, args, client, Discord) {
        message.channel.send('pong!');
    }
}