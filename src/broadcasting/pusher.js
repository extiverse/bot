const PusherJS = require('pusher-js');
const EventEmitter = require('events');
const camelCase = require('lodash.camelcase');
const log = require('consola').withScope('pusher');

module.exports = class Pusher extends EventEmitter {
  constructor() {
    super();

    if (process.env.PUSHER_APP_KEY) {
      Pusher.log = msg => log.info(msg);

      const pusher = new PusherJS(process.env.PUSHER_APP_KEY, {
        cluster: process.env.PUSHER_APP_CLUSTER || 'eu',
      });

      const pusherChannel = pusher.subscribe(
        process.env.PUSHER_LISTEN_CHANNEL || 'System'
      );

      pusherChannel.bind_global((e, data) => {
        const handler = camelCase(
          e.replace('App\\Events\\', '').replace('\\', '')
        );

        log.info(
          `The event ${e} was received from pusher, seeking handler ${handler}`
        );

        this.emit(handler, data);
      });
    }
  }
};
