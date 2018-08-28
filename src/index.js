require('dotenv').config();

require('./handlers/sentry')(Raven => {
  const Commando = require('discord.js-commando');
  const path = require('path');
  const consola = require('consola');
  const log = consola.withScope('discord');
  const pusher = require('./handlers/pusher');

  const client = new Commando.Client({
    commandPrefix: '$',
    owner: process.env.BOT_OWNER,
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
      ['flagrow', 'Flagrow Marketplace'],
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));

  client.on('commandError', (command, err, msg, args) => {
    if (Raven) {
      try {
        Raven.captureException(err, {
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
      } catch (err) {
        console.error(err);
      }
    }

    consola.withScope(`discord:${command.name}`).error(err);
  });

  client.login(process.env.BOT_TOKEN).then(() => {
    log.info(`Logged in as '${client.user.tag}'`);

    pusher(client);
  });
});
