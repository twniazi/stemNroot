/*
  # Add Mailchimp Integration Columns

  1. Changes
    - Add `mailchimp_api_key` column to email_campaigns table
    - Add `mailchimp_list_id` column to email_campaigns table
    - Add `mailchimp_campaign_id` column to store Mailchimp's campaign ID after creation
    - Add `integration_status` column to track integration sync status
    
  2. Security
    - No RLS changes needed
    - API keys are stored securely in the database
*/

-- Add mailchimp_api_key to email_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'mailchimp_api_key'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN mailchimp_api_key text;
  END IF;
END $$;

-- Add mailchimp_list_id to email_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'mailchimp_list_id'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN mailchimp_list_id text;
  END IF;
END $$;

-- Add mailchimp_campaign_id to email_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'mailchimp_campaign_id'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN mailchimp_campaign_id text;
  END IF;
END $$;

-- Add integration_status to email_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_campaigns' AND column_name = 'integration_status'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN integration_status text DEFAULT 'none';
  END IF;
END $$;
