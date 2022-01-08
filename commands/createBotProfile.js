const ProfileModel = require('../models/profileSchema');

module.exports = {
    name: 'botprofile',
    aliases: [],
    description: "Creates a profile in the database for the bot",
    permissions: ['ADMINISTRATOR'],
    async execute(message, args, client, Discord, cmd, profileData) {
        try {
            let botprofile = ProfileModel.findOne({ userID: `${process.env.CLIENTID}`});
            if (!botprofile) {
                let profile = await ProfileModel.create({
                    userID: `${process.env.CLIENTID}`,
                    serverID: message.guild.id,
                    likedSongs: [],
                    playlists: []
                });
                profile.save();
                console.log('bot profile created');
            }
            
        }
        catch(error) {
            console.log(error);
        }
    }
}