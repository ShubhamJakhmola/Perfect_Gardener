/**
 * Script to create an admin user in the database
 * Run this with: node scripts/create-admin-user.js
 * 
 * Make sure to set NETLIFY_DATABASE_URL environment variable first
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('Error: NETLIFY_DATABASE_URL environment variable is not set');
    console.error('Please set it before running this script:');
    console.error('  export NETLIFY_DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    const username = await question('Enter username: ');
    const email = await question('Enter email (optional, press Enter to skip): ');
    const password = await question('Enter password: ');

    if (!username || !password) {
      console.error('Username and password are required!');
      process.exit(1);
    }

    // Check if user already exists
    const existing = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existing.rows.length > 0) {
      console.error(`User "${username}" already exists!`);
      process.exit(1);
    }

    // Hash password
    console.log('Hashing password...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await client.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, created_at`,
      [username, email || null, passwordHash]
    );

    console.log('\n✅ Admin user created successfully!');
    console.log('User details:');
    console.log(`  ID: ${result.rows[0].id}`);
    console.log(`  Username: ${result.rows[0].username}`);
    console.log(`  Email: ${result.rows[0].email || 'N/A'}`);
    console.log(`  Created: ${result.rows[0].created_at}`);
    console.log('\nYou can now use these credentials to log in to the admin panel.');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await client.end();
    rl.close();
  }
}

createAdminUser();

