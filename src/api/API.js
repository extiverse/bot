const fetch = require('node-fetch');
const qs = require('query-string');
const consola = require('consola');
const assert = require('assert');

class APIError extends Error {
  constructor(name, ...args) {
    super(...args);

    this.name = name;
  }
}

const agent = process.env.USER_AGENT || '@flagrow/bot';
const accepts = 'application/json';

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

    this.logger = consola.withScope(name.toLowerCase());
  }

  get(path, query) {
    if (query) path += `?${qs.stringify(query)}`;

    return fetch(this.base + path, {
      headers: this.headers,
    })
      .then(res => {
        if (res.status !== 200 || !res.url.includes(path))
          throw new APIError(
            this.name,
            `${res.status} ${res.statusText} @ ${res.url}`
          );
        return res.json();
      })
      .then(res => res.data);
  }
};
