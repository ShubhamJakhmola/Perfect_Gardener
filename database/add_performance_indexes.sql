-- Additional Performance Indexes
-- Run this SQL script to add indexes for better query performance
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Posts table indexes for ordering and filtering
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);

-- Products table indexes for ordering
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Plants table indexes for common queries
CREATE INDEX IF NOT EXISTS idx_plants_created_at ON plants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plants_season ON plants(season);
CREATE INDEX IF NOT EXISTS idx_plants_data_source ON plants(data_source);

-- Composite indexes for common query patterns
-- Posts: featured posts ordered by date
CREATE INDEX IF NOT EXISTS idx_posts_featured_date ON posts(featured, date DESC) WHERE featured = true;

-- Products: category and source filtering
CREATE INDEX IF NOT EXISTS idx_products_category_source ON products(category, source) WHERE category IS NOT NULL AND source IS NOT NULL;

-- Plants: type and season filtering
CREATE INDEX IF NOT EXISTS idx_plants_type_season ON plants(plant_type, season) WHERE plant_type IS NOT NULL AND season IS NOT NULL;

