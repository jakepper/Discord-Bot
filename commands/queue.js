module.exports = {
    name: 'queue',
    aliases: ['q'],
    cooldown: undefined,
    description: "Lists the current queued resources",
    usage: "queue [amount]",
    args: "[amount] : OPTIONAL (default=10) - Number of songs to display",
    execute(message, args, client, Discord, cmd) {
        if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command');

        const serverQueue = client.queue.get(message.guild.id);

        if (!serverQueue) return message.channel.send('There aren\'t any resources in the queue');

        
        const amount = args[0] ? args[0] : 11;

        const description = [];

        for (let i = 1; i < Math.min(serverQueue.songs.length, amount); i++) {
            description.push(`${i} : ${serverQueue.songs[i].title}\n`);
        }
        description.push(".\n");
        description.push(".\n");
        description.push(".");

        const embed = new Discord.MessageEmbed()
            .setTitle('Queued tracks:')
            .setDescription(description.join(""));
        return message.channel.send({ embeds: [embed] });

        // console.log('Current Queue:')
        // for (const song of serverQueue.songs) {
        //     console.log('\t' + song.title);
        // }
    }
}