const redEmoji = '❤️';
const ProfileModel = require('../../models/profileSchema');

module.exports = async (Discord, client, reaction, user) => {
    const profileData = await ProfileModel.find({ userID: user.id });
    if (!profileData) return console.log(`${user.username} does not have a profile in the database`);

    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    if (reaction.emoji.name === redEmoji) {
        if (reaction.message.embeds.length) {
            const songTitle = reaction.message.embeds[0].description;
            // could get url as well if desired
            const profile = await ProfileModel.findOne({ userID: user.id, likedSongs: { $all: [songTitle] } });
            if (profile === null)
            {
                await ProfileModel.findOneAndUpdate(
                    {
                        userID: user.id
                    },
                    {
                        $push: {
                            likedSongs: songTitle
                        }
                    }
                );
                console.log(`${user.username} liked : ${songTitle}`);
            }
        }
    }
}