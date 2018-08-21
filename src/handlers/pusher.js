const { RichEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');
const Pusher = require('../broadcasting/Pusher');
const { notifications } = require('../db');

module.exports = client => {
  const pusher = new Pusher();

  const send = (...args) =>
    Array.from(notifications.keys()).forEach(id => {
      if (!client.channels.has(id)) return;
      const channel = client.channels.get(id);
      channel.send(...args).catch(err => {
        const user = client.users.get(notifications.get(id));
        if (user)
          user.send(
            new RichEmbed()
              .setTitle(
                `An error ocurred when sending an extension event`
              )
              .addField('Channel', `<#${id}>`)
              .addField('Error', `${err.name}: ${err.message}`)
              .setColor(0xe74c3c)
          );
      });
    });

  pusher.on('newPackageReleased', ({ package }) => {
    const embed = new RichEmbed()
      .setTitle('New Extension Published')
      .setURL(package.discussLink || package.landingPageLink)
      .setDescription([
        `**Name:** ${package.name}`,
        `**Description:** ${package.description}`,
        package.vcs && `**Source:** ${package.vcs}`
      ])
      .setTimestamp(package.updated_at);

    send(embed);
  });

  setTimeout(
    () =>
      pusher.emit('newPackageReleased', {
        package: {
          packagist_hash: 1398824876,
          name: 'reflar/level-ranks',
          description: 'Add a level/expierence bar to your flarum Forum.',
          license: null,
          type: 'flarum-extension',
          stars: 0,
          forks: 0,
          downloads: 90,
          dependents: 0,
          suggesters: 0,
          title: 'ReFlar Level Ranks',
          icon: { name: 'percent', backgroundColor: '#f4f4f4', color: '#000' },
          highest_version: '1.0',
          abandoned_for: null,
          vcs: 'https://github.com/ReFlar/level-ranks',
          created_at: '2018-08-11 21:39:58',
          updated_at: '2018-08-21 13:19:03',
          id: 436,
          bazaarId: 'reflar$level-ranks',
          lastVersion: null,
          premiumEnabled: false,
          discussLink: null,
          landingPageLink: 'http://flagrow.test/extensions/reflar/level-ranks',
          locale: null,
          versions: [],
        },
      }),
    1000
  );
};
