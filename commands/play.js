const playdl = require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus, AudioPlayerPlayingState } = require('@discordjs/voice');

const queue = new Map();
// (message.guild.id, queueConstructor{});

module.exports = {
    name: 'play',
    aliases: ['skip', 'stop', 'pause', 'resume', 'shuffle', 'queue'],
    cooldown: undefined,
    description: "Advanced Music Bot",
    async execute(message, args, client, Discord, cmd) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send("You need to be in a voice channel to execute this command!");

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions");
        if (!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions");

        const serverQueue = queue.get(message.guild.id);

        // if (!serverQueue) {

        // }

        if (cmd === 'play') {
            if (!args.length) return message.channel.send('Please send keywords or a valid youtube/spotify/soundcloud link');

            let songs = [];

            const videoFinder = async (query) => {
                const searchInfo = await playdl.search(query, {limit: 1});
                return (searchInfo.length > 0) ? searchInfo[0] : null;
            }

            if (this.validURL(args[0])) {
                const url = args[0];
                if (url.includes('youtube')) {
                    const youtube = await playdl.video_info(url);
                    if (youtube.type === 'video') {
                        songs.push({title: songInfo.video_details.title, url: songInfo.video_details.url});
                    }
                    else {
                        return message.channel.send('Please enter a valid youtube video URL')
                    }
                }
                else if (url.includes('soundcloud')) {
                    const soundcloud = await playdl.soundcloud(url);
                    if (soundcloud.type === 'playlist') {
                        await soundcloud.fetch();

                        for (const track of soundcloud.tracks) {
                            songs.push({ title: `${track.name} - ${track.publisher.artist}`, url: track.url });
                        }

                        const embed = new Discord.MessageEmbed()
                            .setTitle(`***${soundcloud.tracks.length}*** songs queued from - \`${soundcloud.name}\``)
                            .setDescription(`Author - ${soundcloud.user.name}`)
                            .setColor('#dc143c')
                            .setURL(url);
                        await message.channel.send({embeds: [embed]});
                    }
                    else if (soundcloud.type === 'track') {
                        songs.push({ title: soundcloud.name, url: soundcloud.url });
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
                    if (spotifyInfo.type === 'playlist') {
                        console.log('\nFetching Playlist . . .');
                        await spotifyInfo.fetch();

                        let count = 0;
                        for (let i = 1; i <= spotify.total_pages; i++) {
                            for (const track of spotify.page(i)) {
                                const title = `${track.name} - ${track.artists[0].name}`;
                                const video = await videoFinder(title);
                                if (video) {
                                    songs.push({ title: title, url: video.url });
                                    console.log(`\tSong Queued: ${title}`);
                                    count++;
                                }
                            }
                        }

                        const embed = new Discord.MessageEmbed()
                            .setTitle(`***${count}*** songs queued from - \`${spotify.name}\``)
                            .setDescription(`Author - ${spotify.owner.name}`)
                            .setColor('#dc143c')
                            .setURL(url);
                        await message.channel.send({embeds: [embed]});
                    }
                    else if (spotify.type === 'track') {
                        const title = `${spotify.name} - ${spotify.artists[0].name}`;
                        const video = await videoFinder(title);
                        if (video) {
                            songs.push({ title: title, url: video.url });
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
                    songs.push({title: video.title, url: video.url});
                }
                else {
                    return message.channel.send('Error finding song');
                }
            }

            if (!serverQueue) {
                const queueConstructor = {
                    voiceChannel: voiceChannel,
                    textChannel: message.channel,
                    connection: null,
                    player: null,
                    songs: []
                }

                queue.set(message.guild.id, queueConstructor);
                songs.forEach(song => {
                    queueConstructor.songs.push(song);
                });

                try {
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
                        await playNextSong(message.guild, Discord);
                    });
                    queueConstructor.player = player;
                    await playNextSong(message.guild, Discord);
                    connection.subscribe(player);
                }
                catch (error) {
                    queue.delete(message.guild.id);
                    await message.channel.send('There was an error connecting to the voice channel');
                    console.log(error);
                }
            }
            else {
                songs.forEach(song => {
                    serverQueue.songs.push(song);
                });
                if (songs.length === 1) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle(`Track Queued - Position ${serverQueue.songs.indexOf(songs[0])}`)
                        .setDescription(songs[0].title)
                        .setURL(songs[0].url)
                        .setColor('#dc143c');
                    await message.channel.send({embeds: [embed]});
                }
            }
        }
        else if (cmd === 'skip') {
            if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');
            if (!serverQueue) return message.channel.send('There aren\'t any resources in the queue');

            const skipped = serverQueue.songs.shift();
            const embed = new Discord.MessageEmbed()
                .setTitle('Song Skipped')
                .setDescription(skipped.title)
                .setColor('#dc143c');
            serverQueue.player.pause();
            playNextSong(message.guild, Discord);
            await message.channel.send({embeds: [embed]});
        }
        else if (cmd === 'stop') {
            if (!serverQueue) return message.channel.send('There aren\'t any resources in the queue');
            if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');
            serverQueue.songs = [];
            serverQueue.connection.destroy();
            queue.delete(message.guild.id);
        }
        else if (cmd === 'pause') {
            if (!serverQueue) return message.channel.send('There is no resource playing');
            if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');
            if (!serverQueue.player.state === AudioPlayerPlayingState) return message.channel.send('There is no resource playing');

            serverQueue.player.pause();
        }
        else if (cmd === 'resume') {
            if (!serverQueue) return message.channel.send('There is no resource paused');
            if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');
            if (serverQueue.player.state === AudioPlayerPlayingState) return message.channel.send('Resource is already playing');

            serverQueue.player.unpause();
        }
        else if (cmd === 'shuffle') {
            if (!serverQueue) return message.channel.send('There aren\'t any resources in the queue');
            if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');
            
            const firstSong = serverQueue.songs.shift();
            serverQueue.songs = serverQueue.songs
                .map((value) => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
            serverQueue.songs.unshift(firstSong);
        }
        else if (cmd === 'queue') {
            if (!serverQueue) message.channel.send('There aren\'t any resources in the queue');
            console.log('Current Queue:')
            for (const song of serverQueue.songs) {
                console.log('\t' + song.title);
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
    }
}

const playNextSong = async (guild, Discord) => {
    const songQueue = queue.get(guild.id);
    const song = songQueue.songs[0];

    if (!song) {
        songQueue.connection.destroy();
        queue.delete(guild.id);
        return;
    }

    const stream = await playdl.stream(song.url);
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    songQueue.player.play(resource);

    const embed = new Discord.MessageEmbed()
        .setTitle('Now Playing')
        .setDescription(song.title)
        .setURL(song.url)
        .setColor('#dc143c');
    await songQueue.textChannel.send({embeds: [embed]});
}

const songPlayer = async (guild, song, Discord) => {
    const songQueue = queue.get(guild.id);

    if (!song) {
        songQueue.connection.disconnect();
        queue.delete(guild.id);
        return;
    }

    const stream = await playdl.stream(song.url);
    let player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    });
    let resource = createAudioResource(stream.stream, { inputType: stream.type });
    player.play(resource);
    songQueue.connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, async () => {
        songQueue.songs.shift();
        songPlayer(guild, songQueue.songs[0], Discord);
    });
    player.on('error', error => console.error(error));

    const embed = new Discord.MessageEmbed()
        .setTitle('Now Playing')
        .setDescription(song.title)
        .setURL(song.url)
        .setColor('#dc143c');
    await songQueue.textChannel.send({embeds: [embed]});
}