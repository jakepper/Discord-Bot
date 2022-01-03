const util = require('minecraft-server-util');

module.exports = {
    name: 'mcserver',
    aliases: ['mc', 'mcstatus', 'mccheck', 'minecraft'],
    cooldown: 6,
    description: "Get status information about a minecraft server",
    usage: "mcserver <IP Address> [port]",
    args: "<IP Address> : REQUIRED - Minecraft servers IP address\n[port] : OPTIONAL (default=25565) - Minecraft servers port number ",
    execute(message, args, client, Discord, cmd, profileData) {
        if (!args[0]) return message.channel.send('Please enter a minecraft server ip');
        
        const port = args[1] ? parseInt(args[1]) : 25565;

        util.status(args[0], port)
        .then(response => {
            const embed = new Discord.MessageEmbed()
            .setColor('#ffffff')
            .setTitle('Minecraft Server Status')
            .addFields(
                {name: 'Status', value: 'ONLINE'},
                {name: 'Server IP', value: args[0]},
                {name: 'Online Players', value: response.players.online.toString()},
                {name: 'Version', value: response.version.name}
            );

            message.channel.send({embeds: [embed]});
        })
        .catch(error => {
            message.channel.send('Error: Server is offline');
            console.error(error);
        });
    }
}