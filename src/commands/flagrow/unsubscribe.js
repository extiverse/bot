const { Command } = require('discord.js-commando');
const { extensionNotifications } = require('../../db');

class UnsubscribeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unsubscribe',
      group: 'flagrow',
      memberName: 'unsubscribe',
      aliases: ['unsub'],
      description: 'Unsubscribe from extension events',
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
    const message = !subscribed
      ? 'This channel is not subscribed to notifications'
      : 'Successfully unsubscribed from extension notifications';

    if (subscribed) extensionNotifications.delete(msg.channel.id);

    return msg.embed({
      title: message,
    });
  }
}

module.exports = UnsubscribeCommand;
