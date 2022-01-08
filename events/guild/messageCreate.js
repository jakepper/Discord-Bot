require('dotenv').config();
const ProfileModel = require('../../models/profileSchema');

const cooldowns = new Map();

const VALID_PERMISSIONS = [
        "CREATE_INSTANT_INVITE",
        "KICK_MEMBERS",
        "BAN_MEMBERS",
        "ADMINISTRATOR",
        "MANAGE_CHANNELS",
        "MANAGE_GUILD",
        "ADD_REACTIONS",
        "VIEW_AUDIT_LOG",
        "PRIORITY_SPEAKER",
        "STREAM",
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "SEND_TTS_MESSAGES",
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "USE_EXTERNAL_EMOJIS",
        "VIEW_GUILD_INSIGHTS",
        "CONNECT",
        "SPEAK",
        "MUTE_MEMBERS",
        "DEAFEN_MEMBERS",
        "MOVE_MEMBERS",
        "USE_VAD",
        "CHANGE_NICKNAME",
        "MANAGE_NICKNAMES",
        "MANAGE_ROLES",
        "MANAGE_WEBHOOKS",
        "MANAGE_EMOJIS",
    ]

module.exports = async (Discord, client, message) => {
    const prefix = process.env.PREFIX;

    if (!message.content.startsWith(prefix) || message.author.bot || message.guild === null) return;

    let profileData;
    try {
        profileData = await ProfileModel.findOne({ userID: message.author.id });
        if (!profileData) {
            let profile = await ProfileModel.create({
                userID: message.author.id,
                serverID: message.guild.id,
                likedSongs: [],
                playlists: []
            });
            profile.save();
        }
    }
    catch(error) {
        console.log(error);
    }
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    try {
        if (command.permissions) {
            let invalidPerms = [];
            for (const perm of command.permissions) {
                if (!VALID_PERMISSIONS.includes(perm)) {
                    return console.log(`Invalid permission (${perm}) in the ${command.name}.js file`);
                }
                if (!message.member.permissions.has(perm)) {
                    invalidPerms.push(perm);
                }
            }
            if (invalidPerms.length) {
                return message.channel.send(`Missing Permissions: \`${invalidPerms}\``);
            }
        }

        if (command.cooldown) {
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

        command.execute(message, args, client, Discord, cmd, profileData);
    }
    catch (error) {
        message.reply(`There was an error trying to execute this command\n Use ${prefix}help for a list of valid commands`);
        console.log(`Input: ${cmd} ${args}`);
        console.log(error);
    }
}