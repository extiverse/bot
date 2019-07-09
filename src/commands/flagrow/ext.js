const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
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
      throttling: {
        usages: 10,
        duration: 60,
      },
    });
  }

  async run(msg) {
    const [action, ...args] = msg.content
      .toLowerCase()
      .split(' ')
      .slice(1);

    if (!action || !args.length || !this[action])
      return msg.reply(this.usage(this.format));

    return this[action](msg, args.join(' ').trim());
  }

  async search(msg, q) {
    await msg.channel.startTyping();

    return this.request(q).then(async ({ data: packages, ttl }) => {
      await msg.channel.stopTyping();

      return msg.embed(
        this.formatEmbed(
          {
            title: `Extension search for '${q}'.`,
            url: `https://flagrow.io/extensions?q=${encodeURIComponent(q)}`,
            fields: packages.map(p => {
              const {
                name,
                description,
                discussLink,
                landingPageLink,
              } = p.attributes;
              const link = discussLink || landingPageLink;

              return {
                name,
                value: `[${
                  description ? description.slice(0, 800) : link
                }](${link})`,
              };
            }),
            footer: !packages.length && {
              text: 'No results found for your search.',
            },
          },
          ttl
        )
      );
    });
  }

  async get(msg, q) {
    await msg.channel.startTyping();

    return this.request(q, 1).then(async ({ data: packages, ttl }) => {
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
        icon,
        downloads,
        stars,
        forks,
        highest_version,
      } = p.attributes;

      const embed = new RichEmbed()
        .setTitle(name)
        .setURL(landingPageLink)
        .setThumbnail(icon.svgpng || icon.image)
        .addField('❯ Description', description ? description.slice(0, 800) : '')
        .addField('❯ Downloads', downloads.toLocaleString(), true);

      if (stars) embed.addField('❯ Stars', stars.toLocaleString(), true);
      if (forks) embed.addField('❯ Forks', forks.toLocaleString(), true);
      if (highest_version) embed.addField('❯ Latest Version', highest_version);

      if (vcs) embed.addField('❯ Source', vcs);
      if (discussLink) embed.addField('❯ Discuss', discussLink);

      return msg.embed(this.formatEmbed(embed, ttl));
    });
  }

  request(q, size = 5) {
    const query = {
      'filter[q]': q,
      'page[size]': size,
      sort: '-downloads',
    };

    return flagrow.get(`/packages`, query);
  }

  formatEmbed(embed, ttl) {
    embed.author = {
      name: 'Flagrow',
      url: 'https://flagrow.io',
      icon_url: 'https://flagrow.io/img/icons/favicon.ico',
    };
    embed.color = 0x5f4bb6;

    if (ttl && !embed.footer)
      embed.footer = {
        text: ttl,
      };

    return embed;
  }
};
