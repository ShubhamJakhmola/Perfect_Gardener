/**
 * Database Connection Utility
 * Shared utility for connecting to Neon PostgreSQL database
 */

import pg from 'pg';
const { Client } = pg;

/**
 * Get a database client connection
 * Uses NETLIFY_DATABASE_URL environment variable
 */
function getDbClient() {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('NETLIFY_DATABASE_URL environment variable is not set');
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  return client;
}

/**
 * Execute a database query with error handling
 */
async function queryDb(text, params = []) {
  const client = getDbClient();
  
  try {
    await client.connect();
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Helper to format API response
 */
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export {
  getDbClient,
  queryDb,
  createResponse
};
