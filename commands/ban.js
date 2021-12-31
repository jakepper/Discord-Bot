module.exports = {
    name: 'ban',
    aliases: [],
    description: "Ban member from server",
    usage: "ban <@member>",
    execute(message, args, client, Discord) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("You must have the Administrator permission in order to ban members");
        }

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