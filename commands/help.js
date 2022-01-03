require('dotenv').config();

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: "Lists valid commands",
    usage: "help",
    args: "NA",
    execute(message, args, client, Discord, cmd, profileData) {
        let embed = new Discord.MessageEmbed()
            .setTitle('Command List')
            .setFooter(`Use ${process.env.PREFIX}usage <command> for more details`);
        client.commands.forEach((value, key) => {
            embed.addField(key, value.description);
        });

        return message.channel.send({ embeds: [embed]});
    }
}