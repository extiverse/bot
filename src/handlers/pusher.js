const { RichEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');
const Pusher = require('../broadcasting/Pusher');
const { notifications } = require('../db');
const log = require('consola').withScope('pusher:handler');
const Cache = require('../cache');

const cache = new Cache('pusher');

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
              .setTitle(`An error ocurred when sending an extension event`)
              .addField('Channel', `<#${id}>`)
              .addField('Error', `${err.name}: ${err.message}`)
              .setColor(0xe74c3c)
          );
      });
    });
  const wasVersionSent = async (p, version) =>
    (await cache.get(p.name)) === version;

  pusher.on('newPackageReleased', async ({ package: extension }) => {
    try {
      if (await wasVersionSent(extension, extension.highest_version)) return;

      const embed = new RichEmbed()
        .setTitle('New Extension Published')
        .setURL(extension.discussLink || extension.landingPageLink)
        .setDescription([
          `**Name:** ${extension.name}`,
          `**Description:** ${extension.description}`,
          extension.vcs && `**Source:** ${extension.vcs}`,
        ])
        .setTimestamp(extension.created_at);

      await Promise.all([
        send(embed),
        cache.set(extension.name, extension.highest_version, 60),
      ]);
    } catch (err) {
      log.error(err);
    }
  });

  pusher.on(
    'newPackageVersionReleased',
    async ({ package: extension, version }) => {
      try {
        if (version.stability === 'dev') return;
        if (await wasVersionSent(extension, version.version)) return;

        const embed = new RichEmbed()
          .setTitle('New Extension Version Released')
          .setURL(extension.discussLink || extension.landingPageLink)
          .setDescription([
            `**Name:** ${extension.name}`,
            `**Version:** ${version.version}`,
          ])
          .setTimestamp(version.created_at);

        await Promise.all([
          send(embed),
          cache.set(extension.name, version.version, 60),
        ]);
      } catch (err) {
        log.error(err);
      }
    }
  );
};
