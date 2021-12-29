require('dotenv').config();

const cooldowns = new Map();

module.exports = (Discord, client, message) => {
    const prefix = process.env.PREFIX;

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    try {
        if (command.hasOwnProperty('cooldown')) {
            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Discord.Collection());
            }

            const curTime = Date.now();
            const timeStamps = cooldowns.get(command.name);
            const cooldown = (command.cooldown) * 1000;

            if (timeStamps.has(message.author.id)) {
                const expiration = timeStamps.get(message.author.id) + cooldown;

                if (curTime < expiration) {
                    const timeLeft = (expiration - curTime) / 1000;

                    return message.reply(`Please wait ${timeLeft.toFixed(1)} more seconds before using the ${command.name} command`);
                }
            }

            timeStamps.set(message.author.id, curTime);
            setTimeout(() => timeStamps.delete(message.author.id), cooldown);
        }

        command.execute(message, args, client, Discord, cmd);
    }
    catch (error) {
        message.reply(`There was an error trying to execute this command\n Use ${prefix}help for a list of valid commands`);
        console.log(`Input: ${cmd} ${args}`);
        console.log(error);
    }
}