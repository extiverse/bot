const API = require('./API');

module.exports = {
  flagrow: new API(
    'Flagrow',
    'https://flagrow.io/api',
    process.env.FLAGROW_TOKEN
  ),
  discuss: new API(
    'Flarum',
    'https://discuss.flarum.org/',
    process.env.FLARUM_TOKEN
  ),
};
