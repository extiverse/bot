const Redis = require('ioredis');
const log = require('consola').withScope('redis');

const REDIS_URL = process.env.REDIS_URL;
const client = 'REDIS_URL' in process.env && new Redis(REDIS_URL);

if (client) {
  client.on('error', log.error);
  client.on('connect', () => log.info('Connected'));
}

class Cache {
  constructor(service) {
    this.service = service;
  }

  get(key) {
    return client.get(this.format(key));
  }

  /**
   * Set cache value
   * @param {String} key
   * @param {Object} value
   * @param {Number} [exp=1800] time until entry expires, default 30 min
   */
  async set(key, value, exp = 1800) {
    return client && client.set(this.format(key), value, 'EX', exp);
  }

  async exists(key) {
    return client && client.exists(this.format(key));
  }

  ttl(key) {
    return client.ttl(this.format(key));
  }

  format(key) {
    return this.service + ':' + key;
  }
}

module.exports = Cache;
