import './lib/setup';

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import express from 'express';

const client = new SapphireClient({
	logger: { level: LogLevel.Debug },
	intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent]
});

async function main() {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('Logged in');
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}

	// Health check endpoint for Railway
	const app = express();
	const port = Number(process.env.HEALTHCHECK_PORT) || 3000;

	app.get('/health', (_req, res) => {
		res.status(200).json({
			status: 'OK',
			timestamp: new Date().toISOString()
		});
	});

	app.listen(port, () => {
		console.log(`Health check server running on port ${port}`);
	});
}

void main();
