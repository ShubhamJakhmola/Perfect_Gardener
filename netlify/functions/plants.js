import { queryDb, createResponse } from './utils/db.js';

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  try {
    const path = event.path.replace('/.netlify/functions/plants', '');

    // GET /plants - Get all plants
    // GET /plants/:id - Get plant by ID
    if (event.httpMethod === 'GET') {
      if (path && path !== '/') {
        // Get single plant by ID - uses primary key index
        const id = path.replace('/', '');
        const result = await queryDb(
          `SELECT id, name, region, growing_months, season, soil_requirements, 
                  bloom_harvest_time, sunlight_needs, care_instructions, image, 
                  plant_type, data_source, created_at, updated_at
           FROM plants
           WHERE id = $1`,
          [id],
          { isWrite: false, logSlow: false }
        );

        if (result.rows.length === 0) {
          return createResponse(404, { error: 'Plant not found' });
        }

        return createResponse(200, { plant: result.rows[0] });
      } else {
        // Get paginated plants list - exclude heavy text fields for performance
        const queryParams = event.queryStringParameters || {};
        const page = parseInt(queryParams.page) || 1;
        const limit = Math.min(parseInt(queryParams.limit) || 20, 50); // Max 50 per page
        const offset = (page - 1) * limit;

        const result = await queryDb(
          `SELECT id, name, region, growing_months, season, bloom_harvest_time, sunlight_needs, image, plant_type, data_source, created_at
           FROM plants
           ORDER BY name ASC
           LIMIT $1 OFFSET $2`,
          [limit, offset],
          { isWrite: false, logSlow: true }
        );

        // Get total count for pagination
        const countResult = await queryDb(
          'SELECT COUNT(*) as total FROM plants',
          [],
          { logSlow: false }
        );

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        return createResponse(200, {
          plants: result.rows,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }, {
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        });
      }
    }

    // POST /plants - Create plant
    if (event.httpMethod === 'POST' && path === '') {
      const body = JSON.parse(event.body || '{}');
      const {
        name,
        region,
        growingMonths,
        season,
        soilRequirements,
        bloomHarvestTime,
        sunlightNeeds,
        careInstructions,
        image,
        plantType,
        dataSource
      } = body;

      if (!name) {
        return createResponse(400, { error: 'Plant name is required' });
      }

      // Normalize name (trim and case-insensitive check)
      const normalizedName = name.trim();
      
      // Check for duplicate plant name (case-insensitive) - optimized query
      const existing = await queryDb(
        'SELECT id FROM plants WHERE LOWER(TRIM(name)) = LOWER($1) LIMIT 1',
        [normalizedName],
        { isWrite: false, logSlow: false }
      );
      if (existing.rows.length > 0) {
        return createResponse(409, { 
          error: 'A plant with this name already exists. Please use a different name or update the existing plant.',
          duplicateField: 'name'
        });
      }

      const result = await queryDb(
        `INSERT INTO plants (name, region, growing_months, season, soil_requirements, 
                            bloom_harvest_time, sunlight_needs, care_instructions, image, 
                            plant_type, data_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, name, region, growing_months, season, soil_requirements, 
                   bloom_harvest_time, sunlight_needs, care_instructions, image, 
                   plant_type, data_source, created_at, updated_at`,
        [
          normalizedName,
          region ? region.trim() : null,
          growingMonths ? growingMonths.trim() : null,
          season ? season.trim() : null,
          soilRequirements ? soilRequirements.trim() : null,
          bloomHarvestTime ? bloomHarvestTime.trim() : null,
          sunlightNeeds ? sunlightNeeds.trim() : null,
          careInstructions ? careInstructions.trim() : null,
          image ? image.trim() : null,
          plantType ? plantType.trim() : null,
          dataSource || 'manual'
        ],
        { isWrite: true, logSlow: true }
      );

      return createResponse(201, {
        success: true,
        plant: result.rows[0]
      });
    }

    // PUT /plants/:id - Update plant
    if (event.httpMethod === 'PUT') {
      const path = event.path.replace('/.netlify/functions/plants', '');
      const pathParts = path.split('/');
      const id = pathParts[pathParts.length - 1];

      if (!id) {
        return createResponse(400, { error: 'Plant ID is required' });
      }

      const body = JSON.parse(event.body || '{}');
      const {
        name,
        region,
        growingMonths,
        season,
        soilRequirements,
        bloomHarvestTime,
        sunlightNeeds,
        careInstructions,
        image,
        plantType,
        dataSource
      } = body;

      // Check for duplicate name if name is being updated (case-insensitive, excluding current plant) - optimized query
      if (name) {
        const normalizedName = name.trim();
        const existing = await queryDb(
          'SELECT id FROM plants WHERE LOWER(TRIM(name)) = LOWER($1) AND id != $2 LIMIT 1',
          [normalizedName, id],
          { isWrite: false, logSlow: false }
        );
        if (existing.rows.length > 0) {
          return createResponse(409, { 
            error: 'A plant with this name already exists. Please use a different name.',
            duplicateField: 'name'
          });
        }
      }

      const result = await queryDb(
        `UPDATE plants
         SET name = COALESCE($1, name),
             region = COALESCE($2, region),
             growing_months = COALESCE($3, growing_months),
             season = COALESCE($4, season),
             soil_requirements = COALESCE($5, soil_requirements),
             bloom_harvest_time = COALESCE($6, bloom_harvest_time),
             sunlight_needs = COALESCE($7, sunlight_needs),
             care_instructions = COALESCE($8, care_instructions),
             image = COALESCE($9, image),
             plant_type = COALESCE($10, plant_type),
             data_source = COALESCE($11, data_source),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING id, name, region, growing_months, season, soil_requirements, 
                   bloom_harvest_time, sunlight_needs, care_instructions, image, 
                   plant_type, data_source, created_at, updated_at`,
        [
          name ? name.trim() : null,
          region !== undefined ? (region ? region.trim() : null) : null,
          growingMonths !== undefined ? (growingMonths ? growingMonths.trim() : null) : null,
          season !== undefined ? (season ? season.trim() : null) : null,
          soilRequirements !== undefined ? (soilRequirements ? soilRequirements.trim() : null) : null,
          bloomHarvestTime !== undefined ? (bloomHarvestTime ? bloomHarvestTime.trim() : null) : null,
          sunlightNeeds !== undefined ? (sunlightNeeds ? sunlightNeeds.trim() : null) : null,
          careInstructions !== undefined ? (careInstructions ? careInstructions.trim() : null) : null,
          image !== undefined ? (image ? image.trim() : null) : null,
          plantType !== undefined ? (plantType ? plantType.trim() : null) : null,
          dataSource !== undefined ? dataSource : null,
          id
        ],
        { isWrite: true, logSlow: true }
      );

      if (result.rows.length === 0) {
        return createResponse(404, { error: 'Plant not found' });
      }

      return createResponse(200, {
        success: true,
        plant: result.rows[0]
      });
    }

    // DELETE /plants/:id - Delete plant
    if (event.httpMethod === 'DELETE') {
      const path = event.path.replace('/.netlify/functions/plants', '');
      const pathParts = path.split('/');
      const id = pathParts[pathParts.length - 1];

      if (!id) {
        return createResponse(400, { error: 'Plant ID is required' });
      }

      const result = await queryDb(
        'DELETE FROM plants WHERE id = $1 RETURNING id', 
        [id],
        { isWrite: true, logSlow: true }
      );

      if (result.rows.length === 0) {
        return createResponse(404, { error: 'Plant not found' });
      }

      return createResponse(200, { success: true, message: 'Plant deleted' });
    }

    return createResponse(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Plants API error:', error);
    return createResponse(500, { error: 'Internal server error', message: error.message });
  }
};

