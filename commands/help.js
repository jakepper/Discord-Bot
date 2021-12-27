module.exports = {
    name: 'help',
    aliases: ['h'],
    description: "Lists valid commands",
    execute(message, args, client, Discord) {
        message.channel.send('Commands:\n\t$ping - Pings the Bot\n\t$help - Lists avaliable commands');
    }
}