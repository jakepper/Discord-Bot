module.exports = (Discord, client, guildMember) => {
    let welcomeRole = guildMember.guild.roles.cache.find(role => role.name === 'member');
    guildMember.roles.add(welcomeRole);
    guildMember.guild.channels.cache.get('***channel id here***').send("***Welcome msg here***");
}