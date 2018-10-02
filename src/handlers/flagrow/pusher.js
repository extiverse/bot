const { URL } = require('url');
const { RichEmbed } = require('discord.js');
const Pusher = require('../../broadcasting/pusher');
const { report } = require('../sentry');
const { notifications } = require('../../db');
const Cache = require('../../Cache');
const { isValidURL } = require('../../util');

const log = require('consola').withScope('pusher:handler');
const FLAGROW_API = new URL(require('../../api/index').flagrow.base);
const cache = new Cache('pusher');

const handle = (err, data) => {
  report(err, data);
  log.error(err);
};
const wrap = cb => arg => (async () => cb(arg))().catch(handle);
const errorEmbed = (id, err) =>
  new RichEmbed()
    .setTitle(`An error ocurred when sending an extension event`)
    .addField('Channel', `<#${id}>`)
    .addField('Error', `${err.name}: ${err.message}`)
    .setColor(0xe74c3c);

module.exports = client => {
  const pusher = new Pusher(
      'flagrow',
      process.env.PUSHER_APP_KEY,
      process.env.PUSHER_LISTEN_CHANNEL,
      process.env.PUSHER_APP_CLUSTER || null
  );

  const send = (evt, payload, embed) =>
    Array.from(notifications.keys()).forEach(id => {
      if (!client.channels.has(id)) return;
      const channel = client.channels.get(id);
      let ogError = null;
      let data = {
        tags: {
          service: 'pusher',
        },
        extra: {
          event: evt,
          payload,
          embed,
        },
      };

      return Promise.all([
        cache.set(
          Date.now(),
          JSON.stringify({
            event: evt,
            payload,
          }),
          60 * 60 * 24 * 2
        ),
        channel
          .send(embed)
          .catch(err => {
            const user = client.users.get(notifications.get(id));
            ogError = err;

            if (err.message !== 'Missing Permissions') handle(ogError, data);

            if (user) return user.send(errorEmbed(id, err));
          })
          .catch(err => {
            // If we can't send an error message to the channel either
            if (ogError.message === 'Missing Permissions') return;

            // If we can't send an error message to the user
            if (err.message === 'Cannot send messages to this user') {
              return channel.send(errorEmbed(id, ogError || err));
            }

            return handle(err, data);
          }),
      ]);
    });

  pusher.on(
    'newPackageReleased',
    wrap(ev => {
      const extension = ev.package;
      const svgpng = extension.icon.svgpng || '';
      const image = extension.icon.image || '';

      return send(
        'newPackageReleased',
        ev,
        new RichEmbed()
          .setTitle('New Extension Published')
          .setURL(extension.discussLink || extension.landingPageLink)
          .setThumbnail(
            (isValidURL(svgpng) && svgpng) ||
              (isValidURL(image) &&
                image.startsWith(FLAGROW_API.origin) &&
                !image.endsWith('svg') &&
                image) ||
              null
          )
          .setDescription([
            `**Name:** ${extension.name}`,
            `**Description:** ${extension.description}`,
            extension.vcs && `**Source:** ${extension.vcs}`,
          ])
          .setTimestamp(extension.created_at)
      );
    })
  );
};

module.exports.cache = cache;
