module.exports = {
    name: 'shuffle',
    aliases: ['random', 'randomize', 'mix'],
    cooldown: 5,
    description: "Shuffles the current queue if any",
    usage: "shuffle",
    args: "NA",
    permissions: [],
    execute(message, args, client, Discord) {
        if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');
        
        const serverQueue = client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('There aren\'t any resources in the queue');
        
        const firstSong = serverQueue.songs.shift();
        serverQueue.songs = serverQueue.songs
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
        serverQueue.songs.unshift(firstSong);

        message.react('👍');
    }
}