const ms = require('ms');

module.exports = {
    name: 'mute',
    description: 'Mutes a member',
    execute(message, args, client, Discord) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("You must have the Administrator permission in order to mute/timeout members");
        }

        const member = message.mentions.users.first();

        if (member) {
            let mainRole = message.guild.roles.cache.find(role => role.name === 'member');
            let muteRole = message.guild.roles.cache.find(role => role.name === 'mute');

            let target = message.guild.members.cache.get(member.id);

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
                message.channel.send('Invalid arguments, try again.');
            }
            
        }
        else {
            message.channel.send('Mentioned member does not exist');
        }
    }
}