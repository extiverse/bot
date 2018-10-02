const { Command } = require('discord.js-commando');
const { notifications } = require('../../db');

class SubscribeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'listen',
      group: 'flarum',
      memberName: 'listen',
      description: 'Subscribe to discuss events',
      userPermissions: ['ADMINISTRATOR'],
      throttling: {
        usages: 1,
        duration: 60,
      },
      guildOnly: true,
    });
  }

  run(msg) {
    if (!this.pattern)
      this.pattern = this.client.dispatcher.buildCommandPattern();
    if (!this.pattern.test(msg.content)) return;

    const subscribed = notifications.has(msg.channel.id);
    const message = subscribed
      ? 'Notifications are already enabled for this channel'
      : 'Successfully subscribed to Flarum discuss notifications';

    if (!subscribed) notifications.set(msg.channel.id, msg.author.id);

    return msg.embed({
      title: message,
    });
  }
}

module.exports = SubscribeCommand;
