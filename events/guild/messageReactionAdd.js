const ProfileModel = require('../../models/profileSchema');
require('dotenv').config();

module.exports = async (Discord, client, reaction, user) => {
    if (user.bot) return;

    const profileData = await ProfileModel.findOne({ userID: user.id });
    if (!profileData) return message.send(`You do not have a Profile set up yet\n Use ${process.env.PREFIX}help and a profile will automatically be set up for you :)`);

    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    // if (!reaction.message.guild) return;

    if (reaction.emoji.name === '❤️') {
        if (reaction.message.embeds.length) {
            const songTitle = reaction.message.embeds[0].description;
            const url = reaction.message.embeds[0].url;
            
            await ProfileModel.findOneAndUpdate(
                {
                    userID: user.id
                },
                {
                    $addToSet: {
                        likedSongs: { title: songTitle, url: url }
                    }
                }
            );
            console.log(`${user.username} liked : ${songTitle}`);
        }
    }
    else if (reaction.emoji.name === '➕') {
        const songTitle = reaction.message.embeds[0].description;
        const url = reaction.message.embeds[0].url;

        const addSongEmbed = new Discord.MessageEmbed()
            .setDescription('React with the ✅ under each playlist you would like to add the song to');
        await user.send({ embeds: [addSongEmbed] });

        for (const playlist of profileData.playlists) {
            const embed = new Discord.MessageEmbed()
                .setTitle(`Playlist - ${playlist.name}`)
                .addFields(
                    { name: 'track', value: songTitle }
                )
                .setURL(url);
            const dm = await user.send({ embeds: [embed] });
            dm.react('✅');
        }
    }
    else if (reaction.emoji.name === '✅') {
        if (reaction.message.embeds.length)
        {
            const embed = reaction.message.embeds[0];
            
            const newDoc = await ProfileModel.findOneAndUpdate(
                {
                    userID: user.id,
                    playlists: {
                        $elemMatch: { name: embed.title.split(' - ')[1] }
                    }
                },
                {
                    $addToSet: {
                        "playlists.$.songs": { title: embed.fields[0].value, url: embed.url }
                    }
                },
                {
                    returnNewDocument: true
                }
            );
            // console.log(newDoc);
        }
    }
}