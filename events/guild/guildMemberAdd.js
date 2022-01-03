const ProfileModel = require('../../models/profileSchema');

module.exports = async (Discord, client, guildMember) => {
    let welcomeRole = guildMember.guild.roles.cache.find(role => role.name === 'member');
    guildMember.roles.add(welcomeRole);
    // guildMember.guild.channels.cache.get('***channel id here***').send("***Welcome msg here***");
    try {
        let profile = await ProfileModel.create({
            userID: guildMember.id,
            serverID: guildMember.guild.id,
            likedSongs: []
        });
        profile.save();
    }
    catch(error)
    {
        console.log(error);
    }
    
}