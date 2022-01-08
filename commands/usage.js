require('dotenv').config();
const colors = require('../colors.js');


module.exports = {
    name: 'usage',
    aliases: ['man', 'manual'],
    description: "Details the usage of an individual command",
    usage: "usage <command>",
    args: "<command> : REQUIRED - Name of a command",
    permissions: [],
    execute(message, args, client, Discord) {
        if (!args[0]) return message.channel.send('Please enter the command you would like to see the usage of');

        let command = client.commands.get(args[0]);
        if (!command) {
            for (const cmd in client.commands) {
                if (cmd.aliases.includes(args[0])) {
                    command = cmd;
                    break;
                }
            }

            if (!command) return message.channel.send(`The command \`${args[0]}\` does not exist`);
        }
        
        const embed = new Discord.MessageEmbed()
            .setTitle(`Usage: \`${process.env.PREFIX}${command.usage}\``)
            .addFields(
                { name: 'Aliases', value: command.aliases.join(" | ") || "NONE" },
                { name: 'Arguments', value: command.args },
                { name: 'Description', value: command.description }
            )
            .setColor(colors.USAGE);
        return message.channel.send({ embeds: [embed]});
    }
}