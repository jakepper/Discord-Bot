module.exports = {
    name: 'ban',
    aliases: [],
    description: "Ban member from server",
    usage: "ban <@member>",
    args: "<@member> : REQUIRED - Server member mention",
    permissions: ['ADMINISTRATOR', 'BAN_MEMBERS'],
    execute(message, args, client, Discord, cmd, profileData) {
        const member = message.mentions.users.first();

        if (member) {
            let target = message.guild.members.cache.get(member.id);
            target.ban();
            message.channel.send("User has been banned");
        }
        else {
            message.channel.send("User could not be banned");
        }
    }
}