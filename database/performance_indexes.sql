-- Performance optimization indexes for Perfect Gardener
-- Run these after the main schema.sql

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plants_created_at ON plants(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_posts_featured_created ON posts(featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_created ON products(category, created_at DESC);

-- Partial indexes for active content
CREATE INDEX IF NOT EXISTS idx_posts_active ON posts(created_at DESC) WHERE featured = true;

-- Indexes for search and filtering
CREATE INDEX IF NOT EXISTS idx_plants_name_gin ON plants USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_posts_title_gin ON posts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('english', name));