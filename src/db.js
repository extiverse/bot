const Enmap = require('enmap');
const path = require('path');
const log = require('consola').withScope('db');

const discussNotifications = new Enmap({
  name: 'discussNotifications',
  dataDir: path.resolve(__dirname, '../data'),
});

discussNotifications.defer.then(() => log.info('Loaded discuss notifications'));

module.exports = { discussNotifications };
