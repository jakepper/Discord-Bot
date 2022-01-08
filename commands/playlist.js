const ProfileModel = require('../models/profileSchema');
const { validURL, playNextSong } = require('./play.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
const playdl = require('play-dl');
const colors = require('../colors.js');

module.exports = {
    name: 'playlist',
    aliases: ['playlists', 'pl'],
    cooldown: undefined,
    description: "Create, delete, add to, and list playlists",
    usage: "playlist <function> <playlist-name>",
    args: "<function> : REQUIRED - create | delete | add | play | list\n<playlist-name> : REQUIRED (create,delete,add,play) : OPTIONAL (list) - Name of Playlist",
    permissions: [],
    async execute(message, args, client, Discord, cmd, profileData) {
        if (args.length < 1) return message.channel.send('Please enter the desired playlist function you would like to perform, ex - create, delete, list, add, or play');

        const func = args[0].toLowerCase();

        if (func === 'create' || func === 'c') {
            if (args.length < 2) return message.channel.send('Please enter a playlist name');
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
                .setDescription(`Belongs to - \`${message.author.username}\``)
                .setColor(colors.QUEUED);
            return message.channel.send({ embeds: [embed] });
        }
        else if (func === 'delete' || func === 'd') {
            if (args.length < 2) return message.channel.send('Please enter a playlist name');
            const playlistName = args[1];
            
            const exists = this.exists(profileData, playlistName);
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
                .setDescription(`Belonged to - \`${message.author.username}\``)
                .setColor(colors.QUEUED);
            return message.channel.send({ embeds: [embed] });
        }
        else if (func === 'play' || func === 'p') {
            if (args.length < 2) return message.channel.send('Please enter a playlist name');
            const playlistName = args[1];

            if (!this.exists(profileData, playlistName)) return message.channel.send(`You do not have a playlist named \`${playlistName}\``);

            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.channel.send("You need to be in a voice channel to execute this command!");

            let serverQueue = client.queue.get(message.guild.id);

            try {
                if (!serverQueue) {
                    const queueConstructor = {
                        voiceChannel: voiceChannel,
                        textChannel: message.channel,
                        connection: null,
                        player: null,
                        songs: []
                    }
                    client.queue.set(message.guild.id, queueConstructor);
                    serverQueue = client.queue.get(message.guild.id);
        
                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator
                    });
                    queueConstructor.connection = connection;
                    const player = createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Play
                        }
                    });
                    player.on(AudioPlayerStatus.Idle, async () => {
                        queueConstructor.songs.shift();
                        await playNextSong(message.guild, client, Discord);
                    });
                    queueConstructor.player = player;
                    connection.subscribe(player);
                }
            }
            catch (error) {
                client.queue.delete(message.guild.id);
                await message.channel.send('There was an error connecting to the voice channel');
                console.log(error);
                return;
            }

            if (serverQueue.songs.length === 0) {
                setTimeout(() => {
                    playNextSong(message.guild, client, Discord);
                }, 1500);
            }

            let playlist;
            for (const pl of profileData.playlists) {
                if (pl.name === playlistName) {
                    playlist = pl.songs;
                }
            }
            
            for (const song of playlist) {
                serverQueue.songs.push(song);
            }
            console.log(`queued playlist`);

            const embed = new Discord.MessageEmbed()
                .setTitle(`***${playlist.length}*** songs queued from \`${message.author.username}\`'s playlist - \`${playlistName}\``)
                .setColor(colors.QUEUED);

            return message.channel.send({ embeds: [embed] });
        }
        else if (func === 'list' || func === 'l') {
            if (!profileData.playlists.length) return message.channel.send("You don't have any playlists");

            if (args.length === 2) {
                const playlistName = args[1];
                if (!this.exists(profileData, playlistName)) return message.channel.send(`You do not have a playlist named \`${playlistName}\``);

                let songs = []
                for (const playlist of profileData.playlists) {
                    if (playlist.name === playlistName) {
                        songs = playlist.songs;
                    }
                }
                let description = []
                let i = 1;
                for (const song of songs) {
                    description.push(`${i++} : ${song.title}`);
                }

                const embed = new Discord.MessageEmbed()
                    .setTitle(`Playlist - \`${playlistName}\``)
                    .setDescription(description.join('\n'))
                    .setFooter(`by ${message.author.username}`)
                    .setColor(colors.PLAYLIST);
                return message.channel.send({ embeds: [embed] });
            }

            let playlists = [];
            for (const playlist of profileData.playlists) {
                playlists.push(`**${playlist.name}** - ${playlist.songs.length} tracks`);
            }
            const embed = new Discord.MessageEmbed()
                .setTitle(`\`${message.author.username}\`'s Playlists`)
                .setDescription(playlists.join('\n'))
                .setColor(colors.PLAYLIST);
            return message.channel.send({ embeds: [embed] });
        }
        else if (func === 'add' || func === 'a') {
            if (args.length < 3) return message.channel.send(`Please enter a playlist name and spotify playlist url`);

            const playlistName = args[1];
            if (!this.exists(profileData, playlistName)) return message.channel.send(`You do not have a playlist named \`${playlistName}\``);

            const url = args[2];

            if (!validURL(url)) return message.channel.send(`Please enter a valid spotify playlist url`);

            if (playdl.is_expired()) {
                await playdl.refreshToken();
            }

            const videoFinder = async (query) => {
                const searchInfo = await playdl.search(query, {limit: 1});
                return (searchInfo.length > 0) ? searchInfo[0] : null;
            }

            const spotify = await playdl.spotify(url);
            if (spotify.type === 'playlist' || spotify.type === 'album') {
                console.log('\nFetching Playlist/Album . . .');
                await spotify.fetch();
                console.log(`Adding songs to playlist - ${playlistName}`);
                let count = 0;
                for (let i = 1; i <= spotify.total_pages; i++) {
                    for (const track of spotify.page(i)) {
                        const title = `${track.name} - ${track.artists[0].name}`;
                        const video = await videoFinder(title);
                        if (video) {
                            await ProfileModel.findOneAndUpdate(
                                {
                                    userID: message.author.id,
                                    playlists: {
                                        $elemMatch: { name: playlistName }
                                    }
                                },
                                {
                                    $addToSet: {
                                        "playlists.$.songs": { title: title, url: video.url }
                                    }
                                },
                            );
                            console.log(`\tSong Added : ${title}`);
                            count++;
                        }
                    }
                }
                console.log('\tDone!');

                const embed = new Discord.MessageEmbed()
                    .setTitle(`***${count}*** songs added to \`${playlistName}\``)
                    .setColor(colors.QUEUED);
                return message.reply({embeds: [embed]});
            }
        }

        return message.channel.send('Invalid command arguments');
    },
    exists(profileData, playlistName) {
        for (const playlist of profileData.playlists) {
            if (playlistName === playlist.name) {
                return true;
            }
        }
        
        return false;
    }
}