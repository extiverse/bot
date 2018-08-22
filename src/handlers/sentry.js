const SENTRY_URL = process.env.SENTRY_URL;
const Raven = SENTRY_URL && require('raven');

if (Raven) Raven.config(SENTRY_URL).install();

module.exports = callback => Raven.context(callback.bind(this, Raven));
module.exports.Raven = Raven;
