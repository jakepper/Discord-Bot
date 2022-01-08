const colors = require('../colors.js');

module.exports = {
    name: 'queue',
    aliases: ['q'],
    cooldown: undefined,
    description: "Lists the current queued resources",
    usage: "queue [amount]",
    args: "[amount] : OPTIONAL (default=10) - Number of songs to display",
    permissions: [],
    execute(message, args, client, Discord, cmd) {
        if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command');

        const serverQueue = client.queue.get(message.guild.id);

        if (!serverQueue) return message.channel.send('There aren\'t any tracks in the queue');
        if (serverQueue.songs.length < 2) return message.channel.send('There aren\'t any tracks in the queue');
        
        let amount;
        if (isNaN(args[0])) {
            amount = 26;
        }
        else {
            amount = parseInt(args[0]) + 1;
        }

        const description = [];

        for (let i = 1; i < Math.min(Math.min(100, amount), serverQueue.songs.length); i++) {
            description.push(`${i} : ${serverQueue.songs[i].title}\n`);
        }
        description.push(".\n");
        description.push(".\n");
        description.push(".");

        const embed = new Discord.MessageEmbed()
            .setTitle('Queued tracks:')
            .setDescription(description.join(""))
            .setColor(colors.QUEUE);
        return message.channel.send({ embeds: [embed] });

        // console.log('Current Queue:')
        // for (const song of serverQueue.songs) {
        //     console.log('\t' + song.title);
        // }
    }
}