import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { setup } from '@skyra/env-utilities';
import * as colorette from 'colorette';

// Unless explicitly defined, set NODE_ENV as development
process.env.NODE_ENV ??= 'development';

// Read env var
setup(`.env.${process.env.NODE_ENV}.local`);

import '@sapphire/plugin-logger/register';

import './database/instance';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Enable colorette
colorette.createColors({ useColor: true });
