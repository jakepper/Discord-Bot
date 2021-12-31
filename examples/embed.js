module.exports = {
    name: 'embed',
    description: 'Embeds!',
    execute(message, args, client, Discord) {
        const embed = new Discord.MessageEmbed()
        .setColor('#aaffee')
        .setTitle('Embeds!')
        .setURL('https://discord.gg/mMRtCPCT')
        .setDescription('Basic Embed Example')
        .addFields(
            {name: 'Rule 1', value: 'Be nice'},
            {name: 'Rule 2', value: 'Be cool'},
            {name: 'Rule 3', value: 'No memees'}
        )
        .setFooter('Check out the help channel');

        message.channel.send({ embeds: [embed] });
    }
}