const url = require('url');

module.exports = {
  async isValidURL(url) {
    if (!url || !String(url)) return;

    try {
      const parsed = url.parse(url);
      return parsed && !!parsed.hostname;
    } catch (err) {
      return false;
    }
  },
};
