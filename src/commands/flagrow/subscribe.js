const { Command } = require('discord.js-commando');
const { extensionNotifications } = require('../../db');

class SubscribeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'subscribe',
      group: 'flagrow',
      memberName: 'subscribe',
      aliases: ['sub'],
      description: 'Subscribe to extension events',
      userPermissions: ['ADMINISTRATOR'],
      throttling: {
        usages: 1,
        duration: 60,
      },
      guildOnly: true,
    });
  }

  run(msg) {
    const subscribed = extensionNotifications.has(msg.channel.id);
    const message = subscribed
      ? 'Notifications are already enabled for this channel'
      : 'Successfully subscribed to extension notifications';

    if (!subscribed) extensionNotifications.set(msg.channel.id, msg.author.id);

    return msg.embed({
      title: message,
    });
  }
}

module.exports = SubscribeCommand;
