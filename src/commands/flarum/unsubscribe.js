const { Command } = require('discord.js-commando');
const { discussNotifications } = require('../../db');

class UnsubscribeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'mute',
      group: 'flarum',
      memberName: 'mute',
      description: 'Unsubscribe from discuss events',
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

    const subscribed = discussNotifications.has(msg.channel.id);
    const message = !subscribed
      ? 'This channel is not subscribed to notifications'
      : 'Successfully unsubscribed from Flarum discuss notifications';

    if (subscribed) discussNotifications.delete(msg.channel.id);

    return msg.embed({
      title: message,
    });
  }
}

module.exports = UnsubscribeCommand;
