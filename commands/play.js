const playdl = require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

const queue = new Map();
// (message.guild.id, queueConstructor object { voice channel, text channel, connection, song[] });

module.exports = {
    name: 'play',
    aliases: ['skip', 'stop'],
    cooldown: undefined,
    description: "Advanced Music Bot",
    async execute(message, args, client, Discord, cmd) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send("You need to be in a voice channel to execute this command!");

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions");
        if (!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions");

        const serverQueue = queue.get(message.guild.id);

        if (cmd === 'play') {
            if (!args.length) return message.channel.send('You need to send the search arguments!');

            let songs = [];

            const videoFinder = async (query) => {
                    const searchInfo = await playdl.search(query, {limit: 1});
                    return (searchInfo.length > 0) ? searchInfo[0] : null;
                }

            if (this.validURL(args[0])) {
                const url = args[0];
                if (url.includes('youtube')) {
                    const songInfo = await playdl.video_info(url);
                    songs.push({title: songInfo.video_details.title, url: songInfo.video_details.url});
                }
                else if (url.includes('spotify')) {
                    if (playdl.is_expired()) {
                        await playdl.refreshToken();
                    }

                    const spotifyInfo = await playdl.spotify(url);
                    if (spotifyInfo.type === 'playlist') {
                        await spotifyInfo.fetch();

                        let count = 0;
                        for (let i = 1; i <= spotifyInfo.total_pages; i++) {
                            for (const track of spotifyInfo.page(i)) {
                                const title = `${track.name} - ${track.artists[0].name}`;
                                const video = await videoFinder(title);
                                if (video) {
                                    songs.push({title: title, url: video.url});
                                    count++;
                                }
                            }
                        }

                        const embed = new Discord.MessageEmbed()
                            .setTitle(`***${count}*** songs queued from ***${spotifyInfo.name}***`)
                            .setColor('#dc143c')
                            .setURL(url);
                        await message.channel.send({embeds: [embed]});
                    }
                    else {
                        const title = `${spotifyInfo.name} - ${spotifyInfo.artists[0].name}`;
                        const video = await videoFinder(title);
                        if (video) {
                            songs.push({title: title, url: video.url});
                        }
                        else {
                            return message.channel.send('Error finding song.');
                        }
                    }
                }
            }
            else {
                const video = await videoFinder(args.join(' '));
                if (video) {
                    songs.push({title: video.title, url: video.url});
                }
                else {
                    return message.channel.send('Error finding song.');
                }
            }

            if (!serverQueue) {
                const queueConstructor = {
                    voiceChannel: voiceChannel,
                    textChannel: message.channel,
                    connection: null,
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
                    songPlayer(message.guild, queueConstructor.songs[0], Discord);
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
            if (!serverQueue) {
                return message.channel.send('There are no songs in the queue');
            }
            const skipped = serverQueue.songs.shift();
            const embed = new Discord.MessageEmbed()
                .setTitle('Song Skipped')
                .setDescription(skipped.title)
                .setColor('#dc143c');
            songPlayer(message.guild, serverQueue.songs[0], Discord);
            await message.channel.send({embeds: [embed]});
        }
        else if (cmd === 'stop') {
            if (!message.member.voice.channel) return message.channel.send('You need to be in a voice channel to execute this command!');
            serverQueue.songs = [];
            serverQueue.connection.destroy();
            queue.delete(message.guild.id);
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
    player.on(AudioPlayerStatus.Idle, () => {
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