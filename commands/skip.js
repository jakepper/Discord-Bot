const { playNextSong } = require('./play.js');

module.exports = {
    name: 'skip',
    aliases: ['pass', 'next', 'playnext'],
    cooldown: 3,
    description: "Skips the currently playing resource if any",
    usage: "skip",
    args: "NA",
    permissions: [],
    execute(message, args, client, Discord) {
        if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');

        const serverQueue = client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('There aren\'t any resources in the queue');

        serverQueue.songs.shift();
        // const embed = new Discord.MessageEmbed()
        //     .setTitle('Song Skipped')
        //     .setDescription(skipped.title)
        //     .setColor('#dc143c');
        serverQueue.player.pause();
        playNextSong(message.guild, client, Discord);
        message.react('👍');
    }
}