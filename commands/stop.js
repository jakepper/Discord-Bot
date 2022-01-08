module.exports = {
    name: 'stop',
    aliases: ['leave'],
    cooldown: undefined,
    description: "Disconnects bot from voice channel",
    usage: "stop",
    args: "NA",
    permissions: [],
    execute(message, args, client, Discord) {
        if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');

        const serverQueue = client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('There aren\'t any resources in the queue');

        serverQueue.songs = [];
        serverQueue.connection.destroy();
        client.queue.delete(message.guild.id);
        message.react('👍');
    }
}