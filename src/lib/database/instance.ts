import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import Database from './models/Database';

function getConnectionString() {
	const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
	return `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
}

export const db = new Kysely<Database>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: getConnectionString()
		})
	}),
	plugins: [new CamelCasePlugin()]
});
