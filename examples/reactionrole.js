module.exports = {
    name: 'reactionrole',
    description: 'Sets up a reaction role message',
    async execute(message, args, client, Discord) {
        const channel = '924242345958973460';

        const redTeam = message.guild.roles.cache.find(role => role.name === 'Red Team');
        const blueTeam = message.guild.roles.cache.find(role => role.name === 'Blue Team');

        const redEmoji = '❤️';
        const blueEmoji = '💙';

        let embed = new Discord.MessageEmbed()
        .setColor('#ffffff')
        .setTitle('Choose a team!')
        .setDescription('Choosing a team will allow you to interact with your teamates!\n\n'
            + `${redEmoji} for red team`
            + `${blueEmoji} for blue team`
        );

        let messageEmbed = await message.channel.send({embeds: [embed]});
        messageEmbed.react(redEmoji);
        messageEmbed.react(blueEmoji);

        client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            if (reaction.partial) await reaction.fetch();
            if (user.bot) return;
            if (!reaction.message.guild) return;

            if (reaction.message.channel.id == channel) {
                if (reaction.emoji.name === redEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(redTeam);
                }
                if (reaction.emoji.name === blueEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(blueTeam);
                }
            }
            else {
                return;
            }
        });

        client.on('messageReactionRemove', async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            if (reaction.partial) await reaction.fetch();
            if (user.bot) return;
            if (!reaction.message.guild) return;

            if (reaction.message.channel.id == channel) {
                if (reaction.emoji.name === redEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(redTeam);
                }
                if (reaction.emoji.name === blueEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(blueTeam);
                }
            }
            else {
                return;
            }
        });
    }
}