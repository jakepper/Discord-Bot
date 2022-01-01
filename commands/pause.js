const { AudioPlayerPlayingState } = require('@discordjs/voice');

module.exports = {
    name: 'pause',
    aliases: [],
    cooldown: undefined,
    description: "Pauses the currently playing resource",
    usage: "pause",
    args: "NA",
    execute(message, args, client, Discord) {
        if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');

        const serverQueue = client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('There is no resource playing');
        if (!serverQueue.player.state === AudioPlayerPlayingState) return message.channel.send('There is no resource playing');

        serverQueue.player.pause();
    }
}