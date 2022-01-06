const ProfileModel = require('../models/profileSchema');

module.exports = {
    name: 'playlist',
    aliases: ['playlists'],
    cooldown: undefined,
    description: "Create, delete, add to, and remove from Playlists",
    usage: "playlist <function> <function argument>",
    args: "<function> : REQUIRED - create | delete | add | remove\n<function argument> : REQUIRED - Playlist name if creating or deleting a playlist, song name if adding or removing from a playlist",
    async execute(message, args, client, Discord, cmd, profileData) {
        if (args.length < 2) return message.channel.send('Please enter valid command arguments\n');

        const func = args[0].toLowerCase();

        if (func === 'create') {
            const playlistName = args[1];

            await ProfileModel.findOneAndUpdate({ userID: message.author.id }, 
                {
                    $push: {
                        playlists: { name: playlistName, songs: [] }
                    }
                }
            );

            const embed = new Discord.MessageEmbed()
                .setTitle(`Created playlist - ${playlistName}`)
                .setDescription(`Belongs to - \`${message.author.username}\``);
            return message.channel.send({ embeds: [embed] });
        }
        else if (func === 'delete') {
            const playlistName = args[1];

            await ProfileModel.findOneAndUpdate({ userID: message.author.id },
                {
                    $pull: {
                        playlists: { name: playlistName }
                    }
                }
            );

            const embed = new Discord.MessageEmbed()
                .setTitle(`Deleted playlist - ${playlistName}`)
                .setDescription(`Belonged to - \`${message.author.username}\``);
            return message.channel.send({ embeds: [embed] });
        }
        // else if (func === 'add') {

        // }
        // else if (func === 'remove') {

        // }
    }
}