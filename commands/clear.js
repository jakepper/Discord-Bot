module.exports = {
    name: 'clear',
    aliases: ['del', 'delete'],
    description: "Clears a specified amount of messages",
    async execute(message, args, client, Discord) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("You must have the Administrator permission in order to delete messages");
        }

        if (args[0] == 'all') {
            await message.channel.messages.fetch().then(messages => {
                message.channel.bulkDelete(messages);
            });
        }
        else if (!args[0]) {
            message.reply("Please enter the number of messages you would like to clear!");
        }
        else if (isNaN(args[0])) {
            message.reply("Please enter a real number!");
        }
        else if (args[0] > 100) {
            message.reply("You cannot delete more than 100 messages!");
        }
        else if (args[0] < 1) {
            message.reply("You must delete at least 1 message");
        }
        else {
            await message.channel.messages.fetch({limit: args[0]}).then(messages => {
                message.channel.bulkDelete(messages);
            })
        }
    }
}