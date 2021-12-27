module.exports = {
    name: 'mod',
    description: "sends message if user has correct role",
    execute(message, args, client, Discord) {

        // let role = message.guild.roles.cache.find(r => r.name === 'Mod');

        if (message.member.roles.cache.has('924195589816741949')) {
            message.channel.send('You have the correct role');
        }
        else {
            message.channel.send('You do not have the correct permissions, let me change that for you :)');
            message.member.roles.add('924195589816741949')
        }
    }
}