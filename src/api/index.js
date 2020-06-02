const API = require('./API');

module.exports = {
  extiverse: new API(
    'extiverse',
    process.env.EXTIVERSE_URL || 'https://extiverse.com/api/v1',
    process.env.EXTIVERSE_TOKEN
  ),
  discuss: new API(
    'flarum',
    'https://discuss.flarum.org',
    process.env.FLARUM_TOKEN
  ),
};
