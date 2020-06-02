const Enmap = require('enmap');
const path = require('path');
const log = require('consola').withScope('db');

const extensionNotifications = new Enmap({
  name: 'extensionNotifications',
  dataDir: path.resolve(__dirname, '../data'),
});
const discussNotifications = new Enmap({
  name: 'discussNotifications',
  dataDir: path.resolve(__dirname, '../data'),
});

extensionNotifications.defer.then(() =>
  log.info('Loaded extension notifications')
);

discussNotifications.defer.then(() => log.info('Loaded discuss notifications'));

module.exports = { extensionNotifications, discussNotifications };
