/**
 * Database Connection Utility
 * Shared utility for connecting to Neon PostgreSQL database
 * Optimized for serverless with connection pooling and keep-alive
 */

import pg from 'pg';
const { Pool } = pg;

// Connection pool for better performance
let pool = null;

/**
 * Get database pool (creates if doesn't exist)
 * Uses connection pooling to reduce connection overhead
 */
function getDbPool() {
  if (!pool) {
    const databaseUrl = process.env.NETLIFY_DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('NETLIFY_DATABASE_URL environment variable is not set');
    }

    // Parse connection string for pool config
    const url = new URL(databaseUrl);

    pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: {
        rejectUnauthorized: false
      },
      // Pool configuration for serverless
      max: 5, // Maximum 5 connections
      min: 0, // Minimum 0 connections
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 5000, // Connection timeout 5s
      acquireTimeoutMillis: 10000, // Acquire timeout 10s
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Execute a database query with connection pooling
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @param {Object} options - Query options { isWrite: boolean, logSlow: boolean, cacheSeconds: number }
 */
async function queryDb(text, params = [], options = {}) {
  const { isWrite = false, logSlow = true, cacheSeconds = 0 } = options;
  const pool = getDbPool();
  const startTime = Date.now();

  const client = await pool.connect();

  try {
    const result = await client.query(text, params);

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
    // Return client to pool
    client.release();
  }
}

/**
 * Helper to format API response with optional caching
 */
function createResponse(statusCode, body, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  return {
    statusCode,
    headers: {
      ...defaultHeaders,
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export {
  queryDb,
  createResponse
};
