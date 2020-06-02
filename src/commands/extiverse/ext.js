const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const { extiverse } = require('../../api');

module.exports = class ExtCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ext',
      group: 'extiverse',
      memberName: 'ext',
      description: 'Search an extension on Extiverse.com',
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
            url: `https://extiverse.com/?filter[q]=${encodeURIComponent(q)}`,
            fields: packages.map(p => {
              const {
                name,
                title,
                description,
              } = p;
              const link = `https://extiverse.com/extensions/${name}`;

              return {
                name: `${title} (${name})`,
                value: `[${
                  description ? description.slice(0, 800) : '​'
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

    const { data, ttl } = await this.request(q, 1);
    const p = data && data[0];

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
      description,
      vcs,
      downloads,
      compatibleWithLatestFlarum,
      highestVersion,
      iconUrl,
      isPremium,
      supportForum,
      plan,
      reviewsCount,
      reviewsRecommendCount,
      reviewsNotRecommendCount,
    } = p;

    const url = `https://extiverse.com/extension/${name}`;

    const embed = new RichEmbed()
      .setTitle(name)
      .setURL(url)
      .setThumbnail(iconUrl);

    if (description) {
      embed.addField('❯ Description', description.slice(0, 800));
    }

    embed.addField('❯ Compatible', compatibleWithLatestFlarum ? 'Yes' : 'No', true);

    if (highestVersion) embed.addField('❯ Version', highestVersion, true);

    if (isPremium) {
      embed.addField('❯ Premium', `${plan.price} / ${plan.interval}`, true);
      embed.addField('❯ Subscribers', plan.subscriberCount, true);
    }

    embed.addField('❯ Downloads', downloads.toLocaleString(), true);

    if (reviewsCount) embed.addField('❯ Reviews', `${reviewsRecommendCount} \\👍   /   ${reviewsNotRecommendCount} \\👎`, true)

    if (!isPremium && vcs) embed.addField('❯ Source', vcs);
    if (supportForum) embed.addField('❯ Support [Forum]', supportForum);

    return msg.embed(this.formatEmbed(embed, ttl));
  }

  request(q, size = 5) {
    const query = {
      'filter[q]': q,
      'page[size]': size,
      include: 'plan',
      sort: '-downloads',
    };

    return extiverse.get(`/extensions`, query);
  }

  formatEmbed(embed, ttl) {
    embed.author = {
      name: 'Extiverse',
      url: 'https://extiverse.com',
      icon_url: 'https://extiverse.com/favicon/favicon-96x96.png',
    };
    embed.color = 0x5f4bb6;

    if (ttl && !embed.footer)
      embed.footer = {
        text: ttl,
      };

    return embed;
  }
};
