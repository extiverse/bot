const { Command } = require('discord.js-commando');
const { cache } = require('../../handlers/pusher');
const { RichEmbed } = require('discord.js');
const prettier = require('prettier');
const fecha = require('fecha');

const dateFormat = 'MMMM Do @ hh:mm A';

class EventsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'events',
      group: 'pusher',
      memberName: 'events',
      description: 'See pusher events',
      format: '[list|get] [date]',
      ownerOnly: true,
      guarded: true,
    });
  }

  async run(msg) {
    const [action, ...args] = msg.content
      .toLowerCase()
      .split(' ')
      .slice(1);

    if (action === 'get') {
      return this.get(msg, ...args);
    } else if (!action || action === 'list') {
      return this.list(msg);
    }
  }

  async list(msg) {
    const keys = await cache.keys();
    const dates = keys
      .map(Number)
      .sort((a, b) => b - a)
      .slice(0, 5)
      .map(
        (key, i) => `• **${key}**: ${fecha.format(new Date(key), dateFormat)}`
      );

    return msg.embed({
      title: 'Events',
      description: dates.join('\n'),
      footer: {
        text: 'Pusher',
      },
    });
  }

  async get(msg, date) {
    const data = await cache.get(date);
    if (!data) return msg.reply(this.usage(this.format));
    const parsed = JSON.parse(data);
    let formatted;

    try {
      formatted = prettier.format(JSON.stringify(parsed.payload), {
        parser: 'json',
      });
    } catch (err) {
      try {
        formatted = JSON.stringify(JSON.parse(parsed.payload), null, 2);
      } catch (err) {
        formatted = parsed.payload;
      }
    }

    return msg.embed(
      new RichEmbed()
        .setTitle(`Event: ${parsed.event}`)
        .setDescription(['```json', formatted, '```'])
        .setFooter('Pusher')
        .setTimestamp(new Date(date))
    );
  }
}

module.exports = EventsCommand;
