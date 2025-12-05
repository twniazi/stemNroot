/*
  # Add Canva Integration to Content Calendar

  1. Changes
    - Add `canva_design_url` column to content_calendar table
    - Add `canva_api_key` column to content_calendar table
    - Add `canva_integration_status` column to content_calendar table
    - Add `media_url` column to store exported Canva media
    
  2. Security
    - No RLS changes needed
    - API keys are stored securely in the database
*/

-- Add canva_design_url to content_calendar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_calendar' AND column_name = 'canva_design_url'
  ) THEN
    ALTER TABLE content_calendar ADD COLUMN canva_design_url text;
  END IF;
END $$;

-- Add canva_api_key to content_calendar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_calendar' AND column_name = 'canva_api_key'
  ) THEN
    ALTER TABLE content_calendar ADD COLUMN canva_api_key text;
  END IF;
END $$;

-- Add canva_integration_status to content_calendar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_calendar' AND column_name = 'canva_integration_status'
  ) THEN
    ALTER TABLE content_calendar ADD COLUMN canva_integration_status text DEFAULT 'none';
  END IF;
END $$;

-- Add media_url to content_calendar for storing exported designs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_calendar' AND column_name = 'media_url'
  ) THEN
    ALTER TABLE content_calendar ADD COLUMN media_url text;
  END IF;
END $$;
