const ProfileModel = require('../models/profileSchema');
const colors = require('../colors.js');

module.exports = {
    name: 'songs',
    aliases: ['liked', 'likedsongs', 'likes'],
    cooldown: 10,
    description: "DM's you a list of your liked songs",
    usage: "songs",
    args: "NA",
    permissions: [],
    async execute(message, args, client, Discord, cmd, profileData) {
        const songs = profileData.likedSongs;

        if (!songs.length) return message.author.send("You don't have any liked songs");

        let descriptions = [];
        let description = [];
        let count = 1;
        for (const song of songs) {
            description.push(`${count++} : ${song.title}}`);
            if (count % 100 === 0) {
                descriptions.push(description);
                description = [];
            }
        }
        descriptions.push(description);

        const embed = new Discord.MessageEmbed()
            .setTitle('Liked Songs')
            .setDescription(descriptions[0].join('\n'))
            .setFooter(`by ${message.author.username}`)
            .setColor(colors.PLAYLIST);
        message.author.send({ embeds: [embed] });

        for (let i = 1; i < descriptions.length; i++) {
            let extraEmbed = new Discord.MessageEmbed()
                .setDescription(descriptions[i].join('\n'))
                .setFooter(`by ${message.author.username}`)
                .setColor(colors.PLAYLIST);
            message.author.send({ embeds: [extraEmbed] });
        }
        
        return;
    }
}