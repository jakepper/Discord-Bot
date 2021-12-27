module.exports = async (client) => {
    const guild = client.guilds.cache.get('924088229274214440');
    setInterval(() => {
        const memberCount = guild.memberCount;
        const channel = guild.channels.cache.get('924529906677870612');
        channel.setName(`Total Members: ${memberCount.toLocaleString()}`);
        console.log('Updating Member Count');
    }, 60000 * 15);
}