require('dotenv').config();
const colors = require('../colors.js');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: "Lists valid commands",
    usage: "help",
    args: "NA",
    permissions: [],
    execute(message, args, client, Discord, cmd, profileData) {
        let embed = new Discord.MessageEmbed()
            .setTitle('Command List')
            .setFooter(`Use ${process.env.PREFIX}usage <command> for more details`)
            .setColor(colors.HELP);
        client.commands.forEach((value, key) => {
            if (value.permissions) {
                if (!value.permissions.includes('ADMINISTRATOR')) {
                    embed.addField(key, value.description, true);
                }
            }
        });

        return message.channel.send({ embeds: [embed]});
    }
}