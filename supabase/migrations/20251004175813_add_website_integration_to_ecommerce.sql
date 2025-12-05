/*
  # Add Website Integration to E-commerce

  1. Changes
    - Add `website_url` column to products table to store stemnroot.com product page URL
    - Add `website_product_id` column to products table to store external product ID
    - Add `website_sync_status` column to products table to track sync status
    - Add `order_source` column to orders table to track where the order came from
    - Add `website_order_id` column to orders table to store external order ID
    - Add `order_date` column to orders table (if missing)
    
  2. Security
    - No RLS changes needed
*/

-- Add website_url to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'website_url'
  ) THEN
    ALTER TABLE products ADD COLUMN website_url text;
  END IF;
END $$;

-- Add website_product_id to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'website_product_id'
  ) THEN
    ALTER TABLE products ADD COLUMN website_product_id text;
  END IF;
END $$;

-- Add website_sync_status to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'website_sync_status'
  ) THEN
    ALTER TABLE products ADD COLUMN website_sync_status text DEFAULT 'not_synced';
  END IF;
END $$;

-- Add order_source to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_source'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_source text DEFAULT 'manual';
  END IF;
END $$;

-- Add website_order_id to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'website_order_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN website_order_id text;
  END IF;
END $$;

-- Add order_date to orders if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_date timestamptz DEFAULT now();
  END IF;
END $$;

-- Add notes column to orders for additional details
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN notes text;
  END IF;
END $$;
