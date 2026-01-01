import { queryDb, createResponse } from './utils/db.js';

/**
 * Dynamic Sitemap Generator
 * Automatically generates sitemap.xml with all posts from the database
 * This ensures new posts are automatically included in search engine indexing
 */
export const handler = async (event) => {
  try {
    // Fetch all posts from database
    const postsResult = await queryDb(
      `SELECT slug, updated_at, created_at 
       FROM posts 
       WHERE slug IS NOT NULL 
       ORDER BY created_at DESC`
    );

    const posts = postsResult.rows || [];
    const baseUrl = 'https://perfectgardener.netlify.app';
    const currentDate = new Date().toISOString().split('T')[0];

    // Static pages (always included)
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/products', priority: '0.9', changefreq: 'weekly' },
      { url: '/posts', priority: '0.9', changefreq: 'weekly' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
      { url: '/tools', priority: '0.8', changefreq: 'monthly' },
      { url: '/tools/pot-calculator', priority: '0.7', changefreq: 'monthly' },
      { url: '/tools/bloom-calculator', priority: '0.7', changefreq: 'monthly' },
      { url: '/tools/budget-planner', priority: '0.7', changefreq: 'monthly' },
      { url: '/tools/flower-calendar', priority: '0.7', changefreq: 'monthly' },
    ];

    // Generate XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add dynamic blog posts
    posts.forEach(post => {
      const lastmod = post.updated_at 
        ? new Date(post.updated_at).toISOString().split('T')[0]
        : (post.created_at 
          ? new Date(post.created_at).toISOString().split('T')[0]
          : currentDate);
      
      sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    // Return XML with proper headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
      body: sitemap,
    };
  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Return a basic sitemap on error (fallback)
    const baseUrl = 'https://perfectgardener.netlify.app';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/posts</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
      body: fallbackSitemap,
    };
  }
};

