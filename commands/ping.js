module.exports = {
    name: 'ping',
    aliases: [],
    timeout: 10,
    description: "pings the bot!",
    usage: "ping",
    args: "NA",
    permissions: [],
    execute(message, args, client, Discord) {
        message.channel.send('pong!');
    }
}