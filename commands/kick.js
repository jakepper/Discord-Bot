module.exports = {
    name: 'kick',
    aliases: [],
    description: "Kick member from server",
    usage: "kick <@member>",
    args: "<@member> : REQUIRED - Server member mention",
    permissions: ['ADMINISTRATOR', 'KICK_MEMEBERS'],
    execute(message, args, client, Discord, cmd, profileData) {
        const member = message.mentions.users.first();

        if (member) {
            let target = message.guild.members.cache.get(member.id);
            target.kick();
            message.channel.send("User has been kicked");
        }
        else {
            message.channel.send("User could not be kicked");
        }
    }
}