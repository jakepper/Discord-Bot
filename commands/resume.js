const { AudioPlayerPlayingState } = require('@discordjs/voice');

module.exports = {
    name: 'resume',
    aliases: ['unpause'],
    cooldown: undefined,
    description: "Resumes playback of current resource",
    usage: "resume",
    execute(message, args, client, Discord) {
        if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');

        const serverQueue = client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('There is no resource paused');
        if (serverQueue.player.state === AudioPlayerPlayingState) return message.channel.send('Resource is already playing');
        
        serverQueue.player.unpause();
    }
}