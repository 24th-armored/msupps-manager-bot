import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, MessageFlags } from 'discord.js';
import { getCommandId } from '../lib/utils';

@ApplyOptions<Command.Options>({
	description: 'ping pong'
})
export class UserCommand extends Command {
	// Register Chat Input and Context Menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		// Create shared integration types and contexts
		// These allow the command to be used in guilds and DMs
		const integrationTypes = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
		const contexts = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

		// Register Chat Input command
		registry.registerChatInputCommand(
			{
				name: this.name,
				description: this.description,
				integrationTypes,
				contexts
			},
			{ idHints: getCommandId('PING_CHAT') }
		);

		// Register Context Menu command available from any message
		registry.registerContextMenuCommand(
			{
				name: this.name,
				type: ApplicationCommandType.Message,
				integrationTypes,
				contexts
			},
			{ idHints: getCommandId('PING_MENUCONTEXT') }
		);

		// Register Context Menu command available from any user
		registry.registerContextMenuCommand(
			{
				name: this.name,
				type: ApplicationCommandType.User,
				integrationTypes,
				contexts
			},
			{ idHints: getCommandId('PING_USERCONTEXT') }
		);
	}

	// Chat Input (slash) command
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.sendPing(interaction);
	}

	// Context Menu command
	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.sendPing(interaction);
	}

	private async sendPing(interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction) {
		const pingMessage = await interaction.reply({
			content: 'Ping?',
			withResponse: true,
			flags: MessageFlags.Ephemeral
		});

		if (!pingMessage) return;

		const botLatency = Math.round(this.container.client.ws.ping);
		const apiLatency = pingMessage.interaction.createdTimestamp - interaction.createdTimestamp;
		const content = `Pong! Bot Latency ${botLatency}ms. API Latency ${apiLatency}ms.`;

		return interaction.editReply({ content });
	}
}
