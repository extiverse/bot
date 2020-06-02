const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      group: 'util',
      memberName: 'help',
      aliases: ['commands'],
      description:
        'Displays a list of available commands, or detailed information for a specified command.',
      details:
        "The command may be part of a command name or a whole command name. If it isn't specified, all available commands will be listed.",
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 5,
        duration: 60,
      },
      guarded: true,
      args: [
        {
          key: 'command',
          prompt: 'Which command would you like to view the help for?',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  run(msg, args) {
    const groups = this.client.registry.groups;
    const command =
      args.command &&
      this.client.registry.findCommands(args.command, false, msg)[0];

    const prefix = this.client.commandPrefix;

    if (!command) {
      const embed = new RichEmbed()
        .setColor(3447003)
        .addField(
          '❯ Commands',
          `A list of available commands. For additional info on a command, type \`${prefix}help <command>\``
        );

      for (const [, group] of groups.filter((grp) =>
        grp.commands.some((cmd) => cmd.isUsable(msg))
      )) {
        embed.addField(
          `❯ ${group.name.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())}`,
          `${group.commands
            .filter((cmd) => cmd.isUsable(msg))
            .map((cmd) => `\`${cmd.name}\``)
            .join(', ')}`
        );
      }

      return msg.say(embed);
    }

    const embed = new RichEmbed()
      .setColor(3447003)
      .setTitle(`\`${prefix}${command.name} ${command.format || ''}\``)
      .addField('❯ Description', command.description || '\u200b')
      .addField('❯ Usage', command.usage() || '\u200b');

    if (command.examples)
      embed.addField(
        '❯ Examples',
        command.examples
          ? command.examples.map((e) => `\`${e}\``).join('\n')
          : '\u200b'
      );

    if (command.aliases.length > 1)
      embed.addField('❯ Aliases', `\`${command.aliases.join('` `')}\``, true);
    if (command.description.examples && command.description.examples.length)
      embed.addField(
        '❯ Examples',
        `\`${command.aliases[0]} ${command.description.examples.join(
          `\`\n\`${command.aliases[0]} `
        )}\``,
        true
      );

    return msg.say(embed);
  }
}

module.exports = HelpCommand;
