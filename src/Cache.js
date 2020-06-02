const Redis = require('ioredis');
const { Raven } = require('./handlers/sentry');
const log = require('consola').withScope('redis');

const client = 'REDIS_URL' in process.env && new Redis(process.env.REDIS_URL);

if (client) {
  client.on('error', (err) => {
    if (Raven) {
      Raven.captureException(err, {
        tags: {
          service: 'redis',
        },
      });

      log.error(err);
    }
  });
  client.on('connect', () => log.info('Connected'));
}

class Cache {
  constructor(service) {
    this.service = service;
  }

  async get(key) {
    return client && client.get(this.format(key));
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

  async keys() {
    return (await client.keys(`${this.service}:*`)).map((key) =>
      key.slice(this.service.length + 1)
    );
  }

  ttl(key) {
    return client.ttl(this.format(key));
  }

  format(key) {
    return this.service + ':' + key;
  }
}

module.exports = Cache;
