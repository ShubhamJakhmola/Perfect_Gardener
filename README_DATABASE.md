# Database Setup Guide

This guide will help you set up the Neon PostgreSQL database and configure the backend API for Perfect Gardener.

## Prerequisites

- A Neon account (sign up at https://neon.tech)
- Node.js and npm installed
- Netlify account for hosting

## Step 1: Create Neon Database

1. Go to https://neon.tech and sign up/login
2. Create a new project
3. Copy your database connection string (it should look like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)

## Step 2: Run Database Schema

1. Open the Neon SQL Editor or use any PostgreSQL client (like pgAdmin or DBeaver)
2. Copy the contents of `database/schema.sql`
3. Execute the SQL script to create the tables:
   - `users` - for admin authentication
   - `products` - for product data
   - `posts` - for blog posts

## Step 3: Create Initial Admin User

You have two options:

### Option A: Using the Script (Recommended)

1. Set your database URL as an environment variable:
   ```bash
   export NETLIFY_DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   ```

2. Run the create admin user script:
   ```bash
   node scripts/create-admin-user.js
   ```

3. Follow the prompts to enter username, email (optional), and password.

### Option B: Using SQL (Manual)

Run this SQL in your Neon database (you'll need to hash the password first):

```sql
-- First, generate a password hash using Node.js:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('your-password', 10);
-- console.log(hash);

-- Then insert the user (replace with your hash):
INSERT INTO users (username, email, password_hash)
VALUES ('admin', 'admin@example.com', '$2b$10$YourBcryptHashHere');
```

### Option C: Using the API (After Deployment)

Once your site is deployed, you can create a user via the API endpoint `POST /.netlify/functions/users` (password will be hashed automatically).

## Step 4: Configure Netlify Environment Variables

1. Go to your Netlify site dashboard
2. Navigate to Site Settings > Environment Variables
3. Add a new environment variable:
   - **Key**: `NETLIFY_DATABASE_URL`
   - **Value**: Your Neon database connection string from Step 1
4. Save the environment variable

## Step 5: Deploy

1. Commit and push your changes to your repository
2. Netlify will automatically deploy your site
3. The Netlify Functions will use the `NETLIFY_DATABASE_URL` environment variable

## API Endpoints

Once deployed, your API endpoints will be available at:

- `/.netlify/functions/users/login` - POST - Admin login
- `/.netlify/functions/users` - POST - Create user
- `/.netlify/functions/products` - GET, POST - Get all products, Create product
- `/.netlify/functions/products/:id` - PUT, DELETE - Update/Delete product
- `/.netlify/functions/posts` - GET, POST - Get all posts, Create post
- `/.netlify/functions/posts/:slug` - GET - Get post by slug
- `/.netlify/functions/posts/:id` - PUT, DELETE - Update/Delete post

## Testing Locally

To test locally, you can use Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

Make sure to set the `NETLIFY_DATABASE_URL` environment variable in your local environment or create a `.env` file (don't commit this to git).

## Troubleshooting

1. **Connection errors**: Verify your `NETLIFY_DATABASE_URL` is correct and includes `?sslmode=require`
2. **Table not found**: Make sure you've run the schema.sql script
3. **Authentication errors**: Check that your admin user exists and password hash is correct
4. **CORS errors**: The API includes CORS headers, but make sure your frontend is calling the correct endpoints

## Security Notes

- Never commit your database connection string to git
- Use environment variables for all sensitive data
- Passwords are hashed using bcrypt with 10 salt rounds
- Consider implementing rate limiting for production
- Use HTTPS in production (Netlify provides this automatically)

