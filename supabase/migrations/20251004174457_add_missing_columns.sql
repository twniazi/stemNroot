/*
  # Add Missing Database Columns

  1. Changes
    - Add `preview_text` column to email_campaigns table
    - Add `company` and `notes` columns to leads table
    - Add `status` column to campaigns table
    - Add `platform` column to content_calendar table
    - Add missing calculated columns for email campaigns (open_rate, click_rate, unsubscribe_count)
    
  2. Security
    - No RLS changes needed
*/

-- Add preview_text to email_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'preview_text'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN preview_text text;
  END IF;
END $$;

-- Add calculated rate columns to email_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'open_rate'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN open_rate numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'click_rate'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN click_rate numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'unsubscribe_count'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN unsubscribe_count integer DEFAULT 0;
  END IF;
END $$;

-- Add company to leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'company'
  ) THEN
    ALTER TABLE leads ADD COLUMN company text;
  END IF;
END $$;

-- Add notes to leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'notes'
  ) THEN
    ALTER TABLE leads ADD COLUMN notes text;
  END IF;
END $$;

-- Add status to campaigns (as text since enum might not match)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'status'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN status text DEFAULT 'draft';
  END IF;
END $$;

-- Add platform to content_calendar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_calendar' AND column_name = 'platform'
  ) THEN
    ALTER TABLE content_calendar ADD COLUMN platform text DEFAULT 'Website';
  END IF;
END $$;
