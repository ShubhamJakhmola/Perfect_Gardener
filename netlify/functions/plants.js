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
        // Get single plant by ID
        const id = path.replace('/', '');
        const result = await queryDb(
          `SELECT id, name, region, growing_months, season, soil_requirements, 
                  bloom_harvest_time, sunlight_needs, care_instructions, image, 
                  plant_type, data_source, created_at, updated_at
           FROM plants
           WHERE id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return createResponse(404, { error: 'Plant not found' });
        }

        return createResponse(200, { plant: result.rows[0] });
      } else {
        // Get all plants
        const result = await queryDb(
          `SELECT id, name, region, growing_months, season, soil_requirements, 
                  bloom_harvest_time, sunlight_needs, care_instructions, image, 
                  plant_type, data_source, created_at, updated_at
           FROM plants
           ORDER BY name ASC`
        );

        return createResponse(200, { plants: result.rows });
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

      const result = await queryDb(
        `INSERT INTO plants (name, region, growing_months, season, soil_requirements, 
                            bloom_harvest_time, sunlight_needs, care_instructions, image, 
                            plant_type, data_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, name, region, growing_months, season, soil_requirements, 
                   bloom_harvest_time, sunlight_needs, care_instructions, image, 
                   plant_type, data_source, created_at, updated_at`,
        [
          name,
          region || null,
          growingMonths || null,
          season || null,
          soilRequirements || null,
          bloomHarvestTime || null,
          sunlightNeeds || null,
          careInstructions || null,
          image || null,
          plantType || null,
          dataSource || 'manual'
        ]
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
          name || null,
          region !== undefined ? region : null,
          growingMonths !== undefined ? growingMonths : null,
          season !== undefined ? season : null,
          soilRequirements !== undefined ? soilRequirements : null,
          bloomHarvestTime !== undefined ? bloomHarvestTime : null,
          sunlightNeeds !== undefined ? sunlightNeeds : null,
          careInstructions !== undefined ? careInstructions : null,
          image !== undefined ? image : null,
          plantType !== undefined ? plantType : null,
          dataSource !== undefined ? dataSource : null,
          id
        ]
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

      const result = await queryDb('DELETE FROM plants WHERE id = $1 RETURNING id', [id]);

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

