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
        // Get single post by slug
        const slug = path.replace('/', '');
        const result = await queryDb(
          `SELECT id, title, slug, excerpt, content, date, read_time, category, author, image, featured, created_at, updated_at 
           FROM posts 
           WHERE slug = $1`,
          [slug]
        );

        if (result.rows.length === 0) {
          return createResponse(404, { error: 'Post not found' });
        }

        return createResponse(200, { post: result.rows[0] });
      } else {
        // Get all posts
        const result = await queryDb(
          `SELECT id, title, slug, excerpt, content, date, read_time, category, author, image, featured, created_at, updated_at 
           FROM posts 
           ORDER BY created_at DESC`
        );

        return createResponse(200, { posts: result.rows });
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

      // Check if slug already exists
      const existing = await queryDb('SELECT id FROM posts WHERE slug = $1', [slug]);
      if (existing.rows.length > 0) {
        return createResponse(409, { error: 'Post with this slug already exists' });
      }

      const result = await queryDb(
        `INSERT INTO posts (title, slug, excerpt, content, date, read_time, category, author, image, featured) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id, title, slug, excerpt, content, date, read_time, category, author, image, featured, created_at, updated_at`,
        [
          title,
          slug,
          excerpt || null,
          content,
          date || new Date().toISOString().split('T')[0],
          readTime || null,
          category || null,
          author || 'Perfect Gardener',
          image || null,
          featured || false
        ]
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

      // Check if slug is being changed and conflicts with another post
      if (slug) {
        const existing = await queryDb(
          'SELECT id FROM posts WHERE slug = $1 AND id != $2',
          [slug, id]
        );
        if (existing.rows.length > 0) {
          return createResponse(409, { error: 'Post with this slug already exists' });
        }
      }

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
        ]
      );

      if (result.rows.length === 0) {
        return createResponse(404, { error: 'Post not found' });
      }

      return createResponse(200, {
        success: true,
        post: result.rows[0]
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

      const result = await queryDb('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);

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
