const { URL } = require('url');
const { RichEmbed } = require('discord.js');
const Pusher = require('../../broadcasting/pusher');
const { report } = require('../sentry');
const { discussNotifications } = require('../../db');
const Cache = require('../../Cache');
const { discuss } = require('../../api');

const log = require('consola').withScope('pusher:handler');
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
    .setColor(0xe7672e);

module.exports = client => {
  const pusher = new Pusher(
    'flarum',
    process.env.FLARUM_PUSHER_APP_KEY,
    process.env.FLARUM_PUSHER_LISTEN_CHANNEL,
    process.env.FLARUM_PUSHER_APP_CLUSTER || null
  );

  const send = (evt, payload, embed) =>
    Array.from(discussNotifications.keys()).forEach(id => {
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
            const user = client.users.get(discussNotifications.get(id));
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
    'newPost',
    wrap(ev => {
      const postId = ev.postId;

      discuss
        .get(`/api/posts/${postId}?include=discussion,user`)
        .then(async ({ data: post, included, ttl }) => {
          const discussion = included.find(include => {
            return (
              include.type === post.relationships.discussion.data.type &&
              include.id === post.relationships.discussion.data.id
            );
          });
          const user = included.find(include => {
            return (
              include.type === post.relationships.user.data.type &&
              include.id === post.relationships.user.data.id
            );
          });

          return send(
            'newPost',
            ev,
            new RichEmbed()
              .setTitle(`New post on ${discussion.attributes.title}`)
              .setURL(
                `${discuss.base}/d/${discussion.id}-${
                  discussion.attributes.slug
                }/${post.attributes.number}`
              )
              .setDescription(
                post.attributes.contentHtml
                  .replace(/<(?:.|\n)*?>/gm, '')
                  .substring(0, 2048)
              )
              // this is b8 compatible, we can change this soon
              .setTimestamp(post.attributes.time || post.attributes.created_at)
              .setAuthor(
                user.attributes.displayName,
                user.attributes.avatarUrl,
                `${discuss.base}/u/${user.id}`
              )
              .setColor(0xe7672e)
              .setFooter(`${discuss.base}`)
          );
        });
    })
  );
};

module.exports.cache = cache;
