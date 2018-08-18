const Commando = require('discord.js-commando');
const path = require('path');
const consola = require('consola').withScope('discord');

require('dotenv').config();

const client = new Commando.Client({
  commandPrefix: '$',
  owner: process.env.BOT_OWNER,
  disableEveryone: true,
});

client.registry
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands({
    help: false,
  })
  .registerGroups([
    ['flarum', 'Flarum Discuss'],
    ['flagrow', 'Flagrow Packages'],
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(process.env.BOT_TOKEN).then(() => {
  consola.info(`Logged in as '${client.user.tag}'`);
});
