const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const assert = require('assert');
const qs = require('query-string');

assert(process.env.FLAGROW_TOKEN);

const BASE_URL = 'https://discuss.flarum.org';
const headers = {
  'User-Agent': process.env.USER_AGENT || '@flagrow/bot',
  Authorization: `Bearer ${process.env.DISCUSS_TOKEN}`,
  Accepts: 'application/json',
};

module.exports = class DiscussCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'discuss',
      group: 'flarum',
      memberName: 'discuss',
      description: 'Search discussions on Flarum Discuss',
      examples: ['$discuss search rewritebase'],
    });
  }

  async run(msg) {
    const [action, ...args] = msg.content
      .toLowerCase()
      .split(' ')
      .slice(1);

    if (!action || !args.length || !this[action]) return msg.reply(this.usage());

    return this[action](msg, ...args);
  }

  async search(msg, q) {
    const query = qs.stringify({
      'filter[q]': q,
      'page[limit]': 5,
    });

    return fetch(`${BASE_URL}/api/discussions?${query}`, { headers })
      .then(res => res.json())
      .then(json => {
        const discussions = json.data;

        return msg.embed({
          title: `Discussion search for '${q}'.`,
          url: `${BASE_URL}/?q=${encodeURIComponent(q)}`,
          color: 0x5f4bb6,
          author: {
            name: 'Flarum Discuss',
            url: 'https://discuss.flarum.org',
            icon_url: 'https://flarum.org/favicon.ico',
          },
          fields: discussions.map(d => ({
            name: d.attributes.title,
            value: `[Comments ${d.attributes.commentsCount}, participants ${
              d.attributes.participantsCount
            }](${BASE_URL}/d/${d.id})`,
          })),
          footer: !discussions.length && {
            text: 'No results found for your search.',
          },
        });
      });
  }
};
