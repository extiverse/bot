const fetch = require('node-fetch');
const qs = require('query-string');
const consola = require('consola');
const moment = require('moment');
const Cache = require('../cache');

class APIError extends Error {
  constructor(name, ...args) {
    super(...args);

    this.name = name;
  }
}

const agent = process.env.USER_AGENT || '@flagrow/bot';
const accepts = 'application/json';
const ttl = 30 * 60;
const formatTtl = itemTtl =>
  `Last updated ${moment()
    .subtract(ttl - itemTtl, 'seconds')
    .fromNow()}`;

module.exports = class API {
  constructor(name, base, token) {
    this.name = name;
    this.base = base;

    this.headers = {
      'User-Agent': agent,
      Accepts: accepts,
    };

    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    }

    this.logger = consola.withScope(name);

    this.cache = new Cache(name);
  }

  async get(path, query) {
    if (query) path += `?${qs.stringify(query)}`;

    if (await this.cache.exists(path)) {
      const itemTtl = await this.cache.ttl(path);
      const data = JSON.parse(await this.cache.get(path));

      return [data, formatTtl(itemTtl)];
    }

    const res = await fetch(this.base + path, {
      headers: this.headers,
    });

    if (res.status !== 200 || !res.url.includes(path))
      throw new APIError(
        this.name,
        `${res.status} ${res.statusText} @ ${res.url}`
      );

    const data = (await res.json()).data;

    await this.cache.set(path, JSON.stringify(data), ttl);

    return [data, formatTtl(ttl)];
  }
};
