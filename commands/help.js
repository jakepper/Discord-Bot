module.exports = {
    name: 'help',
    aliases: ['h'],
    description: "Lists valid commands",
    usage: "help",
    async execute(message, args, client, Discord) {
        let description = []

        client.commands.forEach((value, key) => {
            description.push(`${key} - ${value.description}`);
        });

        const embed = new Discord.MessageEmbed()
            .setTitle('Command List')
            .setDescription(description.join("\n"));
        await message.channel.send({ embeds: [embed]});
    }
}