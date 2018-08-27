const { URL } = require('url');
const { RichEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');
const Pusher = require('../broadcasting/pusher');
const { notifications } = require('../db');
const { isValidURL } = require('../util');

const log = require('consola').withScope('pusher:handler');
const FLAGROW_API = new URL(require('../api').flagrow.base);

module.exports = client => {
  const pusher = new Pusher();

  const send = (...args) =>
    Array.from(notifications.keys()).forEach(id => {
      if (!client.channels.has(id)) return;
      const channel = client.channels.get(id);
      channel
        .send(...args)
        .catch(err => {
          const user = client.users.get(notifications.get(id));
          if (user)
            return user.send(
              new RichEmbed()
                .setTitle(`An error ocurred when sending an extension event`)
                .addField('Channel', `<#${id}>`)
                .addField('Error', `${err.name}: ${err.message}`)
                .setColor(0xe74c3c)
            );
        })
        .catch(log.error);
    });

  pusher.on('newPackageReleased', ({ package: extension }) => {
    const svgpng = extension.icon.svgpng || '';
    const image = extension.icon.image || '';

    return send(
      new RichEmbed()
        .setTitle('New Extension Published')
        .setURL(extension.discussLink || extension.landingPageLink)
        .setThumbnail(
          svgpng ||
            (isValidURL(image) &&
              image.startsWith(FLAGROW_API.origin) &&
              !image.endsWith('svg') &&
              image)
        )
        .setDescription([
          `**Name:** ${extension.name}`,
          `**Description:** ${extension.description}`,
          extension.vcs && `**Source:** ${extension.vcs}`,
        ])
        .setTimestamp(extension.created_at)
    );
  });

  pusher.on('newPackageVersionReleased', ({ package: extension, version }) => {
    if (version.stability === 'dev') return;

    return send(
      new RichEmbed()
        .setTitle('New Extension Version Released')
        .setURL(extension.discussLink || extension.landingPageLink)
        .setDescription([
          `**Name:** ${extension.name}`,
          `**Version:** ${version.version}`,
        ])
        .setTimestamp(version.created_at)
    );
  });
};
