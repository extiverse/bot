const PusherJS = require('pusher-js');
const EventEmitter = require('events');
const camelCase = require('lodash.camelcase');
const log = require('consola').withScope('pusher');

module.exports = class Pusher extends EventEmitter {
  constructor(name, key, channel, cluster) {
    super();

    if (key) {
      Pusher.log = (msg) => log.info(msg);

      const pusher = new PusherJS(key, {
        cluster: cluster,
      });

      const pusherChannel = pusher.subscribe(channel);

      pusherChannel.bind_global((e, data) => {
        const handler = camelCase(
          e.replace('App\\Events\\', '').replace('\\', '')
        );

        log.info(
          `[${name}]: The event ${e} was received from pusher, seeking handler ${handler}`
        );

        this.emit(handler, data);
      });
    }
  }
};
