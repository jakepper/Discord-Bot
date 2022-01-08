const ProfileModel = require('../models/profileSchema');
const colors = require('../colors.js');

module.exports = {
    name: 'songs',
    aliases: ['liked', 'likedsongs', 'likes'],
    description: "DM's you a list of your liked songs",
    usage: "songs",
    args: "NA",
    permissions: [],
    async execute(message, args, client, Discord, cmd, profileData) {
        const songs = profileData.likedSongs;

        if (!songs.length) return message.author.send("You don't have any liked songs");

        let description = [];
        let i = 1;
        for (const song of songs) {
            description.push(`${i} : ${song.title}}`);
            i++;
        }

        const embed = new Discord.MessageEmbed()
            .setTitle('Liked Songs')
            .setDescription(description.join('\n'))
            .setColor(colors.PLAYLIST);
        return message.author.send({ embeds: [embed] });
    }
}