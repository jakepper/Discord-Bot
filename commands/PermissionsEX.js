module.exports = {
    name: 'permission',
    description: "",
    execute(message, args, client, Discord) {
        // let role = message.guild.roles.cache.find(r => r.name === 'Mod');

        if (message.member.permissions.has('KICK_MEMBERS')) {
            message.channel.send('You have the permission to kick members');
        }
        if (message.member.permissions.has('BAN_MEMBER')) {
            message.channel.send('You have the permission to ban members');
        }
        else {
            message.channel.send('You do not have the permissions to kick or ban members');
        }
    }
}