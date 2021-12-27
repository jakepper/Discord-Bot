module.exports = {
    name: 'kick',
    description: "Kick member from server",
    execute(message, args, client, Discord) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("You must have the Administrator permission in order to kick members");
        }

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