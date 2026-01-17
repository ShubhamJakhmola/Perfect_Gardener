import { queryDb, createResponse } from './utils/db.js';

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  try {
    const path = event.path.replace('/.netlify/functions/posts', '');

    // GET /posts - Get all posts
    // GET /posts/:slug - Get post by slug
    if (event.httpMethod === 'GET') {
      if (path && path !== '/') {
        // Get single post by slug - uses indexed slug column
        const slug = path.replace('/', '');
        const result = await queryDb(
          `SELECT id, title, slug, excerpt, content, date, read_time, category, author, image, featured, created_at, updated_at 
           FROM posts 
           WHERE slug = $1`,
          [slug],
          { isWrite: false, logSlow: false }
        );

        if (result.rows.length === 0) {
          return createResponse(404, { error: 'Post not found' });
        }

        return createResponse(200, { post: result.rows[0] });
      } else {
        // Get paginated posts list - exclude heavy content field for performance
        const queryParams = event.queryStringParameters || {};
        const page = parseInt(queryParams.page) || 1;
        const limit = Math.min(parseInt(queryParams.limit) || 6, 20); // Max 20 per page
        const offset = (page - 1) * limit;

        const result = await queryDb(
          `SELECT id, title, slug, excerpt, date, read_time, category, author, image, featured, created_at
           FROM posts
           ORDER BY created_at DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset],
          { isWrite: false, logSlow: true }
        );

        // Get total count for pagination
        const countResult = await queryDb(
          'SELECT COUNT(*) as total FROM posts',
          [],
          { logSlow: false }
        );

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        return createResponse(200, {
          posts: result.rows,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }, {
          'Cache-Control': 'public, max-age=180' // Cache for 3 minutes
        });
      }
    }

    // POST /posts - Create post
    if (event.httpMethod === 'POST' && path === '') {
      const body = JSON.parse(event.body || '{}');
      const {
        title,
        slug,
        excerpt,
        content,
        date,
        readTime,
        category,
        author,
        image,
        featured
      } = body;

      if (!title || !slug || !content) {
        return createResponse(400, { error: 'Title, slug, and content are required' });
      }

      // Validate that content is not just empty HTML
      const contentText = content.replace(/<[^>]*>/g, '').trim();
      if (!contentText || contentText === '') {
        return createResponse(400, { error: 'Post content cannot be empty' });
      }

      // Normalize slug (trim and lowercase)
      const normalizedSlug = slug.trim().toLowerCase();
      
      // Check if slug already exists (case-insensitive) - optimized query
      const existing = await queryDb(
        'SELECT id FROM posts WHERE LOWER(TRIM(slug)) = $1 LIMIT 1',
        [normalizedSlug],
        { isWrite: false, logSlow: false }
      );
      if (existing.rows.length > 0) {
        return createResponse(409, { 
          error: 'A post with this slug already exists. Please use a different slug.',
          duplicateField: 'slug'
        });
      }

      const result = await queryDb(
        `INSERT INTO posts (title, slug, excerpt, content, date, read_time, category, author, image, featured) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id, title, slug, excerpt, content, date, read_time, category, author, image, featured, created_at, updated_at`,
        [
          title.trim(),
          normalizedSlug,
          excerpt ? excerpt.trim() : null,
          content,
          date || new Date().toISOString().split('T')[0],
          readTime || null,
          category ? category.trim() : null,
          author || 'Perfect Gardener',
          image || null,
          featured || false
        ],
        { isWrite: true, logSlow: true }
      );

      return createResponse(201, {
        success: true,
        post: result.rows[0]
      });
    }

    // PUT /posts/:id - Update post
    if (event.httpMethod === 'PUT') {
      const path = event.path.replace('/.netlify/functions/posts', '');
      const pathParts = path.split('/');
      const id = pathParts[pathParts.length - 1];

      if (!id) {
        return createResponse(400, { error: 'Post ID is required' });
      }

      const body = JSON.parse(event.body || '{}');
      const {
        title,
        slug,
        excerpt,
        content,
        date,
        readTime,
        category,
        author,
        image,
        featured
      } = body;

      // Get current post to check if slug is actually changing (optimization)
      const currentPost = await queryDb(
        'SELECT slug FROM posts WHERE id = $1 LIMIT 1',
        [id],
        { isWrite: false, logSlow: false }
      );

      if (currentPost.rows.length === 0) {
        return createResponse(404, { error: 'Post not found' });
      }

      const currentSlug = currentPost.rows[0].slug?.toLowerCase().trim();
      const newSlug = slug ? slug.trim().toLowerCase() : null;

      // Only check for duplicate slug if it's actually changing
      if (slug && newSlug !== currentSlug) {
        const existing = await queryDb(
          'SELECT id FROM posts WHERE LOWER(TRIM(slug)) = $1 AND id != $2 LIMIT 1',
          [newSlug, id],
          { isWrite: false, logSlow: false }
        );
        if (existing.rows.length > 0) {
          return createResponse(409, { 
            error: 'A post with this slug already exists. Please use a different slug.',
            duplicateField: 'slug'
          });
        }
      }

      // Validate content if provided
      if (content !== undefined) {
        const contentText = content.replace(/<[^>]*>/g, '').trim();
        if (!contentText || contentText === '') {
          return createResponse(400, { error: 'Post content cannot be empty' });
        }
      }

      // Update using indexed id column (fast)
      const result = await queryDb(
        `UPDATE posts 
         SET title = COALESCE($1, title),
             slug = COALESCE($2, slug),
             excerpt = COALESCE($3, excerpt),
             content = COALESCE($4, content),
             date = COALESCE($5, date),
             read_time = COALESCE($6, read_time),
             category = COALESCE($7, category),
             author = COALESCE($8, author),
             image = COALESCE($9, image),
             featured = COALESCE($10, featured),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $11
         RETURNING id, title, slug, excerpt, content, date, read_time, category, author, image, featured, created_at, updated_at`,
        [
          title || null,
          slug || null,
          excerpt !== undefined ? excerpt : null,
          content || null,
          date || null,
          readTime || null,
          category !== undefined ? category : null,
          author || null,
          image !== undefined ? image : null,
          featured !== undefined ? featured : null,
          id
        ],
        { isWrite: true, logSlow: true }
      );

      // Return minimal response for faster network transfer
      return createResponse(200, {
        success: true,
        post: {
          id: result.rows[0].id,
          title: result.rows[0].title,
          slug: result.rows[0].slug,
          updated_at: result.rows[0].updated_at
        }
      });
    }

    // DELETE /posts/:id - Delete post
    if (event.httpMethod === 'DELETE') {
      const path = event.path.replace('/.netlify/functions/posts', '');
      const pathParts = path.split('/');
      const id = pathParts[pathParts.length - 1];

      if (!id) {
        return createResponse(400, { error: 'Post ID is required' });
      }

      const result = await queryDb(
        'DELETE FROM posts WHERE id = $1 RETURNING id', 
        [id],
        { isWrite: true, logSlow: true }
      );

      if (result.rows.length === 0) {
        return createResponse(404, { error: 'Post not found' });
      }

      return createResponse(200, { success: true, message: 'Post deleted' });
    }

    return createResponse(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Posts API error:', error);
    return createResponse(500, { error: 'Internal server error', message: error.message });
  }
};
