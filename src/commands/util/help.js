const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					key: 'command',
					prompt: '',
					type: 'command',
					default: '',
				}
			]
		});
	}

	run(msg, { command }) {
		try {
			const prefix = this.client.commandPrefix;

			if (!command) {
				const embed = new RichEmbed()
					.setColor(3447003)
					.addField('❯ Commands', `A list of available commands. For additional info on a command, type \`${prefix}help <command>\``);

				for (const group of this.client.registry.groups.values()) {
					embed.addField(`❯ ${group.id.replace(/(\b\w)/gi, lc => lc.toUpperCase())}`, `${group.commands.map(cmd => `\`${cmd.name}\``).join(', ')}`);
				}

				return msg.say(embed);
			}

			const embed = new RichEmbed()
				.setColor(3447003)
				.setTitle(`\`${prefix}${command.name}\``)
				.addField('❯ Description', command.description || '\u200b')
				.addField('❯ Usage', command.usage() || '\u200b')
				.addField('❯ Examples', command.examples ? command.examples.map(e => `\`${e}\``).join('\n') : '\u200b');

			if (command.aliases.length > 1) embed.addField('❯ Aliases', `\`${command.aliases.join('` `')}\``, true);
			if (command.description.examples && command.description.examples.length) embed.addField('❯ Examples', `\`${command.aliases[0]} ${command.description.examples.join(`\`\n\`${command.aliases[0]} `)}\``, true);

			return msg.say(embed);
		} catch (err) {
			console.error(err);
		}
	}
}

module.exports = HelpCommand;
