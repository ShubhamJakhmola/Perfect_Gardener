-- Migration: Create Plants Table
-- Run this SQL script in your Neon database SQL Editor
-- This will create the plants table and all necessary indexes and triggers

-- Plants table for plant dataset management
CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  region VARCHAR(255),
  growing_months VARCHAR(255),
  season VARCHAR(255),
  soil_requirements TEXT,
  bloom_harvest_time VARCHAR(255),
  sunlight_needs VARCHAR(255),
  care_instructions TEXT,
  image TEXT,
  plant_type VARCHAR(100), -- 'flower', 'vegetable', 'herb', 'fruit', etc.
  data_source VARCHAR(100), -- 'manual', 'imported_csv', 'imported_xlsx', 'imported_json'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for plants table
CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name);
CREATE INDEX IF NOT EXISTS idx_plants_region ON plants(region);
CREATE INDEX IF NOT EXISTS idx_plants_type ON plants(plant_type);

-- Trigger for plants table (make sure update_updated_at_column function exists)
-- If the function doesn't exist, run this first:
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Then create the trigger
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

