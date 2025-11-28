const { makeKyselyHook, kyselyCamelCaseHook, kyselyTypeFilter } = require('kanel-kysely');

/** @type {import('kanel').Config} */
module.exports = {
	connection: {
		host: process.env.PGHOST,
		user: process.env.PGUSER,
		password: process.env.PGPASSWORD,
		database: process.env.PGDATABASE,
		port: Number(process.env.PGPORT)
	},
	outputPath: './src/lib/database/models',
	preDeleteOutputFolder: true,
	preRenderHooks: [makeKyselyHook(), kyselyCamelCaseHook],
	typeFilter: (typeMetadata) => {
		if (typeMetadata.kind === 'function') return false;
		return kyselyTypeFilter(typeMetadata);
	}
};
