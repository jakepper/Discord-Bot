const { playNextSong } = require('./play.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'playlikes',
    aliases: ['playliked', 'playlikedsongs', 'playsongs'],
    cooldown: 60,
    description: "Queues all your liked songs",
    usage: "playlikes",
    args: "NA",
    async execute(message, args, client, Discord, cmd, profileData) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send("You need to be in a voice channel to execute this command!");

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions");
        if (!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions");

        if (!profileData.likedSongs.length) return message.chanel.send("You don't have any liked songs\nReact to any 'Now Playing' embed with a ❤️ to like a the song");

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

        for (const song of profileData.likedSongs) {
            serverQueue.songs.push(song);
        }
        console.log(`Queued ${message.author.username}'s liked songs :)`);

        const embed = new Discord.MessageEmbed()
            .setTitle(`***${profileData.likedSongs.length}*** songs queued from - \`${message.author.username}'s liked songs\``)
            //.setDescription(`Creator : ${message.author.username}`)
            .setColor('#dc143c');

        return message.channel.send({ embeds: [embed] });
    }
}