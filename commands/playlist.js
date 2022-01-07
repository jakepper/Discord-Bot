const ProfileModel = require('../models/profileSchema');

const plusEmoji = '➕';

module.exports = {
    name: 'playlist',
    aliases: ['playlists'],
    cooldown: undefined,
    description: "Create, delete, and list playlists",
    usage: "playlist <function> <playlist-name>",
    args: "<function> : REQUIRED - create | delete | list\n<playlist-name> : REQUIRED (create and delete) : OPTIONAL (list) - Name of Playlist",
    async execute(message, args, client, Discord, cmd, profileData) {
        if (args.length < 1) return message.channel.send('Please enter valid command arguments');

        const func = args[0].toLowerCase();

        if (func === 'create') {
            if (args.length < 2) return message.channel.send('Please enter valid command arguments');
            const playlistName = args[1];

            for (const playlist of profileData.playlists) {
                if (playlistName === playlist.name) return message.channel.send(`You already have a playlist named \`${playlistName}\``);
            }

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
            if (args.length < 2) return message.channel.send('Please enter valid command arguments');
            const playlistName = args[1];
            
            let exists = true;
            for (const playlist of profileData.playlists) {
                if (playlistName === playlist.name) {
                    exists = false;
                }
            }
            if (!exists) return message.channel.send(`You do not have a playlist named \`${playlistName}\``);

            const deleted = await ProfileModel.findOneAndUpdate({ userID: message.author.id },
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
        else if (func === 'list') {
            if (!profileData.playlists.length) return message.channel.send("You don't have any playlists");
            const playListName = args[1];

            if (args.length === 2) {
                let songs = []
                for (const playlist of profileData.playlists) {
                    if (playlist.name === playListName) {
                        songs = playlist.songs;
                    }
                }
                let description = []
                let i = 1;
                for (const song of songs) {
                    description.push(`${i++} : ${song.title}`);
                }

                const embed = new Discord.MessageEmbed()
                    .setTitle(`Playlist - \`${playListName}\``)
                    .setDescription(description.join('\n'));
                return message.channel.send({ embeds: [embed] });
            }

            let playlists = [];
            for (const playlist of profileData.playlists) {
                playlists.push(`**${playlist.name}** - ${playlist.songs.length} tracks`);
            }
            const embed = new Discord.MessageEmbed()
                .setTitle(`\`${message.author.username}\`'s Playlists`)
                .setDescription(playlists.join('\n'));
            return message.channel.send({ embeds: [embed] });
        }

        return message.channel.send('Invalid command arguments');
    }
}