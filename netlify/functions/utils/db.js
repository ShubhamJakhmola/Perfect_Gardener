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
 * Optimized for faster connection handling
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @param {Object} options - Query options { isWrite: boolean, logSlow: boolean }
 */
async function queryDb(text, params = [], options = {}) {
  const { isWrite = false, logSlow = true } = options;
  const client = getDbClient();
  const startTime = Date.now();
  
  try {
    // Connect with timeout to prevent hanging (only for connection, not queries)
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    
    // Execute query - NO timeout for write operations to prevent false failures
    // Only log slow queries instead of killing them
    let result;
    if (isWrite) {
      // Write operations: no timeout, just execute
      result = await client.query(text, params);
    } else {
      // Read operations: can have timeout for safety
      result = await Promise.race([
        client.query(text, params),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 15000)
        )
      ]);
    }
    
    // Log slow queries for monitoring
    const duration = Date.now() - startTime;
    if (logSlow && duration > 1000) {
      console.warn(`Slow query detected (${duration}ms):`, text.substring(0, 100));
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Database query error (${duration}ms):`, error.message, text.substring(0, 100));
    throw error;
  } finally {
    // Ensure connection is closed
    try {
      await client.end();
    } catch (closeError) {
      // Ignore close errors - connection may already be closed
      console.warn('Error closing database connection:', closeError);
    }
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
