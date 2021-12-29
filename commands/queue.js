module.exports = {
    name: 'queue',
    aliases: ['q'],
    cooldown: undefined,
    description: "Lists the current song queue if any",
    execute(message, args, client, Discord) {
        if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command');

        const serverQueue = client.queue.get(message.guild.id);

        if (!serverQueue) return message.channel.send('There aren\'t any resources in the queue');

        console.log('Current Queue:')
        for (const song of serverQueue.songs) {
            console.log('\t' + song.title);
        }
    }
}