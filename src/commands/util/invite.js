const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

class InviteLink extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      group: 'util',
      memberName: 'invite',
      description: 'Displays an invite link for the bot.',
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 60,
      },
      guarded: true,
    });
  }

  run(msg, args) {
    return msg.embed(
      new RichEmbed()
        .addField('Invite Link', 'https://flagrow.io/bot/invite')
        .addField('Official Server', 'https://extiverse.com/discord')
        .setColor(0x84f139)
        .setThumbnail(
          'https://extiverse.com/favicon/apple-icon-180x180.png'
        )
        .setFooter(`© ${new Date().getFullYear()} Extiverse`)
    );
  }
}

module.exports = InviteLink;
