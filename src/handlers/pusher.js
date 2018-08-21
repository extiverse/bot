const { RichEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');
const Pusher = require('../broadcasting/Pusher');

module.exports = client => {
  const pusher = new Pusher();
  const channels = (process.env.BROADCAST_PUSHES_TO || '')
    .split(',')
    .map(e => client.channels.get(e))
    .filter(Boolean);

  pusher.on('newPackageReleased', ({ package }) => {
    const embed = new RichEmbed()
      .setTitle('New Extension Published')
      .setURL(package.discussLink || package.landingPageLink)
      .setDescription(stripIndent`
    **Name:** ${package.name}
    **Description:** ${package.description}
    ${package.vcs && `**Source:** ${package.vcs}`}
    `);

    channels.forEach(channel => channel.send(embed));
  });
};
