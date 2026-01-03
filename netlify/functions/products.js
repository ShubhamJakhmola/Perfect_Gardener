import { queryDb, createResponse } from './utils/db.js';

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  try {
    // GET /products - Get all products
    if (event.httpMethod === 'GET') {
      const result = await queryDb(
        `SELECT id, name, price, image, images, link, category, description, source, sub_category, created_at, updated_at 
         FROM products 
         ORDER BY created_at DESC`
      );

      // Convert JSONB arrays to JavaScript arrays
      const products = result.rows.map(row => ({
        ...row,
        images: row.images || (row.image ? [row.image] : []),
        subCategory: row.sub_category
      }));

      return createResponse(200, { products });
    }

    // POST /products - Create product
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const {
        name,
        price,
        image,
        images,
        link,
        category,
        description,
        source,
        subCategory
      } = body;

      if (!name || !price) {
        return createResponse(400, { error: 'Name and price are required' });
      }

      // Normalize name (trim and case-insensitive check)
      const normalizedName = name.trim();
      
      // Check for duplicate product name (case-insensitive)
      const existing = await queryDb(
        'SELECT id FROM products WHERE LOWER(TRIM(name)) = LOWER($1)',
        [normalizedName]
      );
      if (existing.rows.length > 0) {
        return createResponse(409, { 
          error: 'A product with this name already exists. Please use a different name or update the existing product.',
          duplicateField: 'name'
        });
      }

      // Use images array if provided, otherwise use single image
      const imagesArray = images && images.length > 0 ? images : (image ? [image] : []);
      const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null;

      const result = await queryDb(
        `INSERT INTO products (name, price, image, images, link, category, description, source, sub_category) 
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9) 
         RETURNING id, name, price, image, images, link, category, description, source, sub_category, created_at, updated_at`,
        [
          normalizedName,
          price.trim(),
          primaryImage,
          JSON.stringify(imagesArray),
          link ? link.trim() : null,
          category ? category.trim() : null,
          description ? description.trim() : null,
          source ? source.trim() : null,
          subCategory ? subCategory.trim() : null
        ]
      );

      const product = result.rows[0];
      return createResponse(201, {
        success: true,
        product: {
          ...product,
          images: product.images || (product.image ? [product.image] : []),
          subCategory: product.sub_category
        }
      });
    }

    // PUT /products/:id - Update product
    if (event.httpMethod === 'PUT') {
      const path = event.path.replace('/.netlify/functions/products', '');
      const pathParts = path.split('/');
      const id = pathParts[pathParts.length - 1];

      if (!id) {
        return createResponse(400, { error: 'Product ID is required' });
      }

      const body = JSON.parse(event.body || '{}');
      const {
        name,
        price,
        image,
        images,
        link,
        category,
        description,
        source,
        subCategory
      } = body;

      // Check for duplicate name if name is being updated (case-insensitive, excluding current product)
      if (name) {
        const normalizedName = name.trim();
        const existing = await queryDb(
          'SELECT id FROM products WHERE LOWER(TRIM(name)) = LOWER($1) AND id != $2',
          [normalizedName, id]
        );
        if (existing.rows.length > 0) {
          return createResponse(409, { 
            error: 'A product with this name already exists. Please use a different name.',
            duplicateField: 'name'
          });
        }
      }

      // Use images array if provided, otherwise use single image
      const imagesArray = images && images.length > 0 ? images : (image ? [image] : []);
      const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null;

      const result = await queryDb(
        `UPDATE products 
         SET name = COALESCE($1, name),
             price = COALESCE($2, price),
             image = COALESCE($3, image),
             images = COALESCE($4::jsonb, images),
             link = COALESCE($5, link),
             category = COALESCE($6, category),
             description = COALESCE($7, description),
             source = COALESCE($8, source),
             sub_category = COALESCE($9, sub_category),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $10
         RETURNING id, name, price, image, images, link, category, description, source, sub_category, created_at, updated_at`,
        [
          name ? name.trim() : null,
          price ? price.trim() : null,
          primaryImage,
          imagesArray.length > 0 ? JSON.stringify(imagesArray) : null,
          link !== undefined ? (link ? link.trim() : null) : null,
          category !== undefined ? (category ? category.trim() : null) : null,
          description !== undefined ? (description ? description.trim() : null) : null,
          source !== undefined ? (source ? source.trim() : null) : null,
          subCategory !== undefined ? (subCategory ? subCategory.trim() : null) : null,
          id
        ]
      );

      if (result.rows.length === 0) {
        return createResponse(404, { error: 'Product not found' });
      }

      const product = result.rows[0];
      return createResponse(200, {
        success: true,
        product: {
          ...product,
          images: product.images || (product.image ? [product.image] : []),
          subCategory: product.sub_category
        }
      });
    }

    // DELETE /products/:id - Delete product
    if (event.httpMethod === 'DELETE') {
      const path = event.path.replace('/.netlify/functions/products', '');
      const pathParts = path.split('/');
      const id = pathParts[pathParts.length - 1];

      if (!id) {
        return createResponse(400, { error: 'Product ID is required' });
      }

      const result = await queryDb('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return createResponse(404, { error: 'Product not found' });
      }

      return createResponse(200, { success: true, message: 'Product deleted' });
    }

    return createResponse(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API error:', error);
    return createResponse(500, { error: 'Internal server error', message: error.message });
  }
};
