const playdl = require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'play',
    aliases: [],
    cooldown: undefined,
    description: "Advanced Music Bot",
    usage: "play <Query|URL>",
    async execute(message, args, client, Discord, cmd) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send("You need to be in a voice channel to execute this command!");

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions");
        if (!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions");

        let serverQueue = client.queue.get(message.guild.id);

        if (cmd === 'play') {
            if (!args.length) return message.channel.send('Please send keywords or a valid youtube/spotify/soundcloud link');

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
                        await this.playNextSong(message.guild, client, Discord);
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

            const videoFinder = async (query) => {
                const searchInfo = await playdl.search(query, {limit: 1});
                return (searchInfo.length > 0) ? searchInfo[0] : null;
            }

            if (this.validURL(args[0])) {
                const url = args[0];
                if (url.includes('youtube')) {
                    const youtube = await playdl.video_info(url);
                    if (youtube.type === 'video') {
                        serverQueue.songs.push({title: songInfo.video_details.title, url: songInfo.video_details.url});
                    }
                    else {
                        return message.channel.send('Please enter a valid youtube video URL')
                    }
                }
                else if (url.includes('soundcloud')) {
                    const soundcloud = await playdl.soundcloud(url);
                    if (soundcloud.type === 'playlist') {
                        await soundcloud.fetch();

                        if (serverQueue.songs.length === 0) {
                            setTimeout(() => {
                                this.playNextSong(message.guild, client, Discord);
                            }, 5000);
                        }

                        for (const track of soundcloud.tracks) {
                            serverQueue.songs.push({ title: track.name, url: track.url });
                        }
                        console.log('\tDone!');

                        const embed = new Discord.MessageEmbed()
                            .setTitle(`***${soundcloud.tracks.length}*** songs queued from - \`${soundcloud.name}\``)
                            .setDescription(`Creator : ${soundcloud.user.name}`)
                            .setColor('#dc143c');
                            //.setURL(url);
                        return message.channel.send({embeds: [embed]});
                    }
                    else if (soundcloud.type === 'track') {
                        serverQueue.songs.push({ title: soundcloud.name, url: soundcloud.url });
                    }
                    else {
                        return message.channel.send('Please enter a valid soundcloud track/playlist/album URL');
                    }
                }
                else if (url.includes('spotify')) {
                    if (playdl.is_expired()) {
                        await playdl.refreshToken();
                    }

                    const spotify = await playdl.spotify(url);
                    if (spotify.type === 'playlist' || spotify.type === 'album') {
                        console.log('\nFetching Playlist/Album . . .');
                        await spotify.fetch();

                        if (serverQueue.songs.length === 0) {
                            setTimeout(() => {
                            this.playNextSong(message.guild, client, Discord);
                            }, 5000);
                        }
                        
                        let count = 0;
                        for (let i = 1; i <= spotify.total_pages; i++) {
                            for (const track of spotify.page(i)) {
                                const title = `${track.name} - ${track.artists[0].name}`;
                                const video = await videoFinder(title);
                                if (video) {
                                    serverQueue.songs.push({ title: title, url: video.url });
                                    console.log(`\tSong Queued: ${title}`);
                                    count++;
                                }
                            }
                        }
                        console.log('\tDone!');

                        const author = spotify.type === 'playlist' ? spotify.owner.name : spotify.artists[0].name;
                        const embed = new Discord.MessageEmbed()
                            .setTitle(`***${count}*** songs queued from - \`${spotify.name}\``)
                            .setDescription(`Creator : ${author}`)
                            .setColor('#dc143c');
                            //.setURL(url);
                        return message.channel.send({embeds: [embed]});
                    }
                    else if (spotify.type === 'track') {
                        const title = `${spotify.name} - ${spotify.artists[0].name}`;
                        const video = await videoFinder(title);
                        if (video) {
                            serverQueue.songs.push({ title: title, url: video.url });
                        }
                        else {
                            return message.channel.send('Error finding song.');
                        }
                    }
                    else if (spotify.type === 'album') {
                        return message.channel.send('Not yet implemented: Spotify Albums');
                    }
                    else {
                        return message.channel.send('Please enter a valid spotify track/album/playlist URL');
                    }
                }
            }
            else {
                const video = await videoFinder(args.join(' '));
                if (video) {
                    serverQueue.songs.push({title: video.title, url: video.url});
                }
                else {
                    return message.channel.send('Error finding song');
                }
            }

            if (serverQueue.songs.length > 1) {
                const embed = new Discord.MessageEmbed()
                    .setTitle(`Track Queued - Position ${serverQueue.songs.length}`)
                    .setDescription(serverQueue.songs[serverQueue.songs.length - 1].title)
                    .setColor('#dc143c');
                await message.channel.send({embeds: [embed]});
            }
            else {
                await this.playNextSong(message.guild, client, Discord);
            }
        }
    },
    validURL(url) {
        var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        if(!regex.test(url)){
            return false;
        } else {
            return true;
        }
    },
    async playNextSong(guild, client, Discord) {
        const songQueue = client.queue.get(guild.id);
        if (!songQueue) return;

        const song = songQueue.songs[0];
        if (!song) return;

        const stream = await playdl.stream(song.url);
        const resource = createAudioResource(stream.stream, { inputType: stream.type });
        songQueue.player.play(resource);

        const embed = new Discord.MessageEmbed()
            .setTitle('Now Playing')
            .setDescription(song.title)
            .setURL(song.url)
            .setColor('#dc143c');
        return songQueue.textChannel.send({embeds: [embed]});
    }
}

