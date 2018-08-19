const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const qs = require('query-string');
const { flagrow } = require('../../api');

module.exports = class ExtCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ext',
      group: 'flagrow',
      memberName: 'ext',
      description: 'Search an extension on Flagrow.io',
      format: '<search|get> <query>',
      examples: ['$ext search upload', '$ext get reactions'],
    });
  }

  async run(msg) {
    const [action, ...args] = msg.content
      .toLowerCase()
      .split(' ')
      .slice(1);

    if (!action || !args.length || !this[action])
      return msg.reply(this.usage(this.format));

    return this[action](msg, args.join(' '));
  }

  async search(msg, q) {
    await msg.channel.startTyping();

    return this.request(q).then(async packages => {
      await msg.channel.stopTyping();

      return msg.embed(
        this.formatEmbed({
          title: `Extension search for '${q}'.`,
          url: `https://flagrow.io/packages?q=${encodeURIComponent(q)}`,
          fields: packages.map(p => ({
            name: p.attributes.name,
            value: `[${p.attributes.description.slice(0, 800)}](${p.attributes
              .discussLink || p.attributes.landingPageLink})`,
          })),
          footer: !packages.length && {
            text: 'No results found for your search.',
          },
        })
      );
    });
  }

  async get(msg, q) {
    await msg.channel.startTyping();

    return this.request(q, 1).then(async packages => {
      const p = packages[0];

      await msg.channel.stopTyping();

      if (!p)
        return msg.embed(
          this.formatEmbed({
            footer: {
              text: 'Package not found',
            },
          })
        );

      const {
        name,
        discussLink,
        landingPageLink,
        description,
        vcs,
        downloads,
        stars,
        forks,
        highest_version,
      } = p.attributes;

      const embed = new RichEmbed()
        .setTitle(name)
        .setURL(discussLink || landingPageLink)
        .addField('❯ Description', description.slice(0, 800));

      if (vcs) embed.addField('❯ Source', vcs);

      embed.addField('❯ Downloads', downloads.toLocaleString(), true);

      if (stars) embed.addField('❯ Stars', stars.toLocaleString(), true);
      if (forks) forks.addField('❯ Forks', forks.toLocaleString(), true);

      embed.addField('❯ Latest Version', highest_version);

      return msg.embed(this.formatEmbed(embed));
    });
  }

  request(q, size = 5) {
    const query = {
      'filter[q]': q,
      'page[size]': size,
      sort: '-downloads',
    };

    return flagrow.get(`/packages?${qs.stringify(query)}`);
  }

  formatEmbed(embed) {
    embed.author = {
      name: 'Flagrow',
      url: 'https://flagrow.io',
      icon_url: 'https://flagrow.io/img/icons/favicon.ico',
    };
    embed.color = 0x5f4bb6;

    return embed;
  }
};
