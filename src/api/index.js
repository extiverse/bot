const API = require('./API');

module.exports = {
  flagrow: new API(
    'flagrow',
    process.env.FLAGROW_URL || 'https://flagrow.io/api',
    process.env.FLAGROW_TOKEN
  ),
  discuss: new API(
    'flarum',
    'https://discuss.flarum.org',
    process.env.FLARUM_TOKEN
  ),
};
