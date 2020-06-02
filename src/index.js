require('dotenv').config();

require('./handlers/sentry')(sentryReport => {
  const Commando = require('discord.js-commando');
  const path = require('path');
  const consola = require('consola');
  const log = consola.withScope('discord');
  const flarum = require('./handlers/flarum/pusher');

  const client = new Commando.Client({
    commandPrefix: '$',
    owner: process.env.BOT_OWNER && process.env.BOT_OWNER.split(/, ?/),
    disableEveryone: true,
    nonCommandEditable: false,
    unknownCommandResponse: false,
  });

  client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands({
      help: false,
    })
    .registerGroups([
      ['flarum', 'Flarum Discuss'],
      ['extiverse', 'Extiverse Marketplace'],
      ['pusher', 'Pusher'],
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));

  client.on('error', ({ error, message, target, type }) => {
    if (sentryReport)
      sentryReport(error, {
        tags: {
          service: 'discord',
        },
        extra: {
          message,
          target,
          type,
        },
      });

    log.error(error);
  });

  client.on('warn', log.warn.bind(log));

  client.on('commandError', (command, err, msg) => {
    if (sentryReport)
      sentryReport(err, {
        user: {
          name: msg.author.tag,
        },
        tags: {
          service: 'discord',
        },
        extra: {
          command: command.constructor.name,
          message: msg.content,
        },
      });

    consola.withScope(`discord:${command.name}`).error(err);
  });

  client.login(process.env.BOT_TOKEN).then(() => {
    log.info(`Logged in as '${client.user.tag}'`);

    flarum(client);
  });
});
