const SENTRY_URL = process.env.SENTRY_URL;
const Raven = SENTRY_URL && require('raven');

if (Raven) Raven.config(SENTRY_URL).install();

module.exports = Raven
  ? callback => Raven.context(callback.bind(this, Raven))
  : callback();
module.exports.Raven = Raven;
