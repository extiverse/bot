const fetch = require('node-fetch');
const qs = require('query-string');
const consola = require('consola');
const assert = require('assert');

class APIError extends Error {
  constructor(...args) {
    super(...args);

    this.name = 'APIError';
  }
}

const agent= process.env.USER_AGENT || '@flagrow/bot';
const accepts = 'application/json';


module.exports = class API {
  constructor(name, base, token) {
    this.name = name;
    this.base = base;
    
    if (!base.endsWith('/')) this.base += '/';

    this.headers = {
      'User-Agent': agent,
      Accepts: accepts
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
        if (res.status !== 200) return Promise.reject(`${res.status} ${res.statusText} ${res.url}`);
        return res.json();
      })
      .then(res => res.data)
      .catch(err => {
        this.logger.error(err);
        throw new APIError(
          `An error occurred with the ${
            this.name
          } API. More details can be found in the console.`
        );
      });
  }
};
