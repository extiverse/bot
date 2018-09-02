const SENTRY_URL = process.env.SENTRY_URL;
const Raven = SENTRY_URL && require('raven');
const log = require('consola').withScope('sentry');

if (Raven)
  Raven.config(SENTRY_URL, {
    autoBreadcrumbs: {
      http: true,
    },
    captureUnhandledRejections: true,
  }).install();

Raven.on('error', log.error.bind(log));

const report = Raven
  ? (err, data) => {
      try {
        Raven.captureException(err, data);
      } catch (e) {
        log.error(e);
      }
    }
  : () => {};

module.exports = Raven
  ? callback => Raven.context(callback.bind(this, report))
  : callback(report);
module.exports.Raven = Raven;
