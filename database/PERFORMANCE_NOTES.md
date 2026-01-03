# Database Performance Notes

## Current Architecture

The database uses a connection-per-query pattern, which is appropriate for serverless functions (Netlify Functions).

### Connection Management
- Each query creates a new connection and closes it after execution
- This is acceptable for serverless because:
  - Functions are stateless
  - Connection pooling is complex in serverless environments
  - Prevents connection leaks
  - Works well with Neon PostgreSQL connection limits

### Indexes
All necessary indexes are in place:
- `idx_posts_slug` - For slug lookups (UNIQUE constraint also exists)
- `idx_posts_category` - For category filtering
- `idx_posts_featured` - For featured post queries
- `idx_posts_created_at` - For ordering by creation date
- `idx_products_category` - For product category filtering
- `idx_products_source` - For source filtering
- `idx_plants_name` - For plant name lookups
- Composite indexes for common query patterns

### Query Optimization
- All queries use parameterized statements (prevents SQL injection, allows query plan caching)
- No N+1 query issues detected
- Queries are simple and efficient
- ORDER BY clauses use indexed columns

### Performance Recommendations
1. ✅ Indexes are in place - no additional indexes needed
2. ✅ Queries are optimized - using indexes appropriately
3. ✅ Connection management is appropriate for serverless
4. ⚠️ If experiencing lag, check:
   - Network latency to Neon database
   - Database connection limits
   - Query execution time in Neon dashboard

### Future Optimizations (if needed)
- Consider connection pooling if moving to a non-serverless environment
- Add query result caching for frequently accessed data
- Monitor slow queries using Neon's query analytics

