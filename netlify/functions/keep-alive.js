/**
 * Database Keep-Alive Function
 * Prevents Neon from sleeping by sending periodic lightweight pings
 * Uses randomized intervals to mimic human usage patterns
 */

import { queryDb } from './utils/db.js';

export const handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Lightweight ping query
    await queryDb('SELECT 1', [], { logSlow: false });

    const timestamp = new Date().toISOString();

    console.log(`Database keep-alive ping successful at ${timestamp}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        status: 'ok',
        message: 'Database connection active',
        timestamp
      })
    };
  } catch (error) {
    console.error('Database keep-alive ping failed:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Database ping failed',
        message: error.message
      })
    };
  }
};