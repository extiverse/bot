const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');
const path = require('path');
const log = require('consola').withScope('db');

const notifications = new Enmap({
  provider: new EnmapSQLite({
    name: 'notifications',
    dataDir: path.resolve(__dirname, '../data'),
  }),
});

notifications.defer.then(() => log.info('Loaded notifications'));

module.exports = { notifications };
