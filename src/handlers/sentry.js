const SENTRY_URL = process.env.SENTRY_URL;
const Raven = SENTRY_URL && require('raven');
const git = require('git-rev-sync');
const log = require('consola').withScope('sentry');

if (Raven) {
  Raven.config(SENTRY_URL, {
    autoBreadcrumbs: {
      http: true,
    },
    release: git.long(),
  }).install();
  Raven.on('error', log.error.bind(log));
}

const report = Raven
  ? (err, data) => {
      try {
        Raven.captureException(err, data);
      } catch (e) {
        log.error(e);
      }
    }
  : () => {};

process.on('unhandledRejection', (err) => report(err));

module.exports = Raven
  ? (callback) => Raven.context(() => callback(report))
  : (callback) => callback(report);
module.exports.Raven = Raven;
module.exports.report = report;
