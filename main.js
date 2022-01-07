const Discord = require('discord.js');
require('dotenv').config();
const mongoose = require('mongoose');
// DiscordBotDB

const client = new Discord.Client({ 
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES, 
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.queue = new Map();

['command-handler', 'event-handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});

mongoose.connect(process.env.MONGODB_SRV, {
    useNewURLParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to the database.');
}).catch(error => {
    console.log(error);
});

client.login(process.env.TOKEN);