module.exports = {
    name: 'unmute',
    aliases: [],
    description: "Unmutes a member",
    usage: "unmute <@member>",
    args: "<@member> : REQUIRED - Server member mention",
    execute(message, args, client, Discord) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("You must have the Administrator permission in order to unmute members");
        }

        const member = message.mentions.users.first();
        if (member) {
            let mainRole = message.guild.roles.cache.find(role => role.name === 'member');
            let muteRole = message.guild.roles.cache.find(role => role.name === 'mute');

            let target = message.guild.members.cache.get(member.id);

            target.roles.remove(muteRole);
            target.roles.add(mainRole);
            message.channel.send(`<@${target.user.id}> has been unmuted`);
        }
        else {
            message.channel.send('Mentioned member does not exist');
        }
    }
}