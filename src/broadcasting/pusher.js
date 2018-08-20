const _ = require('lodash');
const PusherJS = require('pusher-js');
const log = require('consola').withScope('pusher');

module.exports = class Pusher {
  constructor(bot) {
    this.bot = bot;

    if (process.env.PUSHER_APP_KEY) {
      this.broadcastOn = (process.env.BROADCAST_PUSHES_TO || '').split(',');

      Pusher.log = log.info;

      const pusher = new PusherJS(process.env.PUSHER_APP_KEY, {
        cluster: process.env.PUSHER_APP_CLUSTER || 'eu'
      });

      const pusherChannel = pusher.subscribe(process.env.PUSHER_LISTEN_CHANNEL || 'System');

      pusherChannel.bind_global((e, data) => {

        const handler = _.camelCase(e.replace('App\\Events\\', '').replace('\\', ''));

        log.info(`The event ${e} was received from pusher, seeking handler ${handler}`);

        if (handler && this[handler]) {
          this[handler](data);
        }
      });
    }
  }
  newPackageReleased (extension) {
  }
}
