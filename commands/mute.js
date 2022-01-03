const ms = require('ms');

module.exports = {
    name: 'mute',
    aliases: ['silence'],
    description: 'Mutes a member',
    usage: "mute <@member> [timeout]",
    args: "<@member> : REQUIRED - Server member mention\n[timeout] : OPTIONAL (default=none) - timeout, 1s | 2m | 3h",
    permissions: ['ADMINISTRATOR', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS'],
    execute(message, args, client, Discord, cmd, profileData) {
        const member = message.mentions.users.first();

        if (member) {
            let target = message.guild.members.cache.get(member.id);

            if (target.permissions.has('ADMINISTRATOR') || member === message.member) return message.channel.send('Cannot mute an administrator or yourself');

            let mainRole = message.guild.roles.cache.find(role => role.name === 'member');
            let muteRole = message.guild.roles.cache.find(role => role.name === 'mute');

            if (!args[1]) {
                target.roles.remove(mainRole);
                target.roles.add(muteRole);
                return message.channel.send(`<@${target.user.id}> has been muted`);
            }

            try {
                target.roles.remove(mainRole);
                target.roles.add(muteRole);
                message.channel.send(`<@${target.user.id}> has been muted for ${ms(ms(args[1]))}`);

                setTimeout(function() {
                    target.roles.remove(muteRole);
                    target.roles.add(mainRole);
                }, ms(args[1]));
            } 
            catch (error) {
                return message.channel.send('Invalid arguments, try again.');
            }
            
        }
        else {
            return message.channel.send('Mentioned member does not exist');
        }
    }
}