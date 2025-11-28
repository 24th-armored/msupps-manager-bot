import { Client } from 'pg';
import { readFile } from 'fs/promises';

const schemaPath = 'scripts/db-schema.sql';

// Environment variables
const PGDATABASE = process.env.PGDATABASE || 'msupps_dev';
const PGUSER = process.env.PGUSER || 'postgres';
const PGPASSWORD = process.env.PGPASSWORD || 'postgres';
const PGHOST = process.env.PGHOST || 'localhost';
const PGPORT = process.env.PGPORT || 5432;

// Database connection helper
function getClient(database = 'postgres') {
  return new Client({
    user: PGUSER,
    password: PGPASSWORD,
    host: PGHOST,
    port: PGPORT,
    database
  });
}

async function createDatabase() {
  const sysClient = getClient();
  await sysClient.connect();

  try {
    console.log(`Creating database ${PGDATABASE}...`);
    await sysClient.query(`CREATE DATABASE ${PGDATABASE};`);
  } finally {
    await sysClient.end();
  }

  const dbClient = getClient(PGDATABASE);
  await dbClient.connect();

  try {
    const schemaSQL = await readFile(schemaPath, 'utf-8');

    console.log(`Applying schema from ${schemaPath}...`);
    await dbClient.query(schemaSQL);
  } finally {
    await dbClient.end();
  }
}

async function dropDatabase() {
  const sysClient = getClient();
  await sysClient.connect();

  try {
    console.log(`Dropping database ${PGDATABASE}...`);
    await sysClient.query(`DROP DATABASE IF EXISTS ${PGDATABASE};`);
  } finally {
    await sysClient.end();
  }
}

async function resetDatabase() {
  await dropDatabase();
  await createDatabase();
}

// Main execution
const command = process.argv[2];
if (!command) {
  console.log(`Usage: ${process.argv[1]} {create|drop|reset}`);
  process.exit(1);
}

try {
  switch (command) {
    case 'create':
      await createDatabase();
      break;
    case 'drop':
      await dropDatabase();
      break;
    case 'reset':
      await resetDatabase();
      break;
    default:
      console.log(`Unknown command: ${command}`);
      process.exit(1);
  }
  console.log('Operation completed successfully');
} catch (error) {
  console.error('Database operation failed:', error);
  process.exit(1);
}
