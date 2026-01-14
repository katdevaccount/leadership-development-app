-- Migration: Add padlet_url column to users table
-- This allows coaches to link each client's Padlet board

ALTER TABLE users ADD COLUMN padlet_url TEXT;

COMMENT ON COLUMN users.padlet_url IS 'Optional Padlet board URL for this client';
