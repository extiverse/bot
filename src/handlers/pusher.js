const { RichEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');
const Pusher = require('../broadcasting/Pusher');
const { notifications } = require('../db');

module.exports = client => {
  const pusher = new Pusher();

  const send = (...args) =>
    Array.from(notifications.keys()).forEach(id => {
      if (!client.channels.has(id)) return;
      const channel = client.channels.get(id);
      channel.send(...args).catch(err => {
        const user = client.users.get(notifications.get(id));
        if (user)
          user.send(
            new RichEmbed()
              .setTitle(
                `An error ocurred when sending an extension event`
              )
              .addField('Channel', `<#${id}>`)
              .addField('Error', `${err.name}: ${err.message}`)
              .setColor(0xe74c3c)
          );
      });
    });

  pusher.on('newPackageReleased', ({ package }) => {
    const embed = new RichEmbed()
      .setTitle('New Extension Published')
      .setURL(package.discussLink || package.landingPageLink)
      .setDescription([
        `**Name:** ${package.name}`,
        `**Description:** ${package.description}`,
        package.vcs && `**Source:** ${package.vcs}`
      ])
      .setTimestamp(package.updated_at);

    send(embed);
  });
};
