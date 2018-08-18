const { Command } = require('discord.js-commando');
const qs = require('query-string');
const { flagrow } = require('../../api');

module.exports = class ExtCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ext',
      group: 'flagrow',
      memberName: 'ext',
      description: 'Search an extension on Flagrow.io',
      examples: ['$ext search flagrow/upload'],
    });
  }

  async run(msg) {
    const [action, ...args] = msg.content
      .toLowerCase()
      .split(' ')
      .slice(1);

    if (!action || !args.length || !this[action])
      return msg.reply(this.usage('search <query>'));

    return this[action](msg, args.join(' '));
  }

  async search(msg, q) {
    const query = {
      'filter[q]': q,
      'page[size]': 5,
      sort: '-downloads',
    };
    const path = `/packages?${qs.stringify(query)}`;

    await msg.channel.startTyping();

    return flagrow.get(path).then(async packages => {
      await msg.channel.stopTyping();

      return msg.embed({
        title: `Extension search for '${q}'.`,
        url: `https://flagrow.io${path}`,
        color: 0x5f4bb6,
        author: {
          name: 'Flagrow',
          url: 'https://flagrow.io',
          icon_url: 'https://flagrow.io/img/icons/favicon.ico',
        },
        fields: packages.map(p => ({
          name: p.attributes.name,
          value: `[${p.attributes.description.slice(0, 800)}](${p.attributes
            .landingPageLink || p.attributes.discussLink})`,
        })),
        footer: !packages.length && {
          text: 'No results found for your search.',
        },
      });
    });
  }
};
