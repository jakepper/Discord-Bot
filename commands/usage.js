module.exports = {
    name: 'usage',
    aliases: ['man', 'manual'],
    description: "Details the usage of an individual command",
    usage: "usage <command>",
    execute(message, args, client, Discord) {
        if (!args[0]) return message.channel.send('Please enter the command you would like to see the usage of');

        const command = client.commands.get(args[0]);
        if (!command) {
            return message.channel.send(`The command \`${args[0]} does not exist`);
        }
        else {
            const embed = new Discord.MessageEmbed()
                .setTitle(`Usage - \`${command.name}\``)
                .setDescription(`Description: ${command.description}\nUsage: ${command.usage}`);
            return message.channel.send({ embeds: [embed]});
        }
    }
}