import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'content_manager' | 'marketing_lead' | 'viewer';
          created_at: string;
          last_login: string | null;
        };
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          channel: string;
          start_date: string | null;
          end_date: string | null;
          budget: number;
          created_at: string;
        };
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          source: string | null;
          campaign_id: string | null;
          status: string;
          created_at: string;
        };
      };
      campaign_performance: {
        Row: {
          id: string;
          campaign_id: string | null;
          date: string;
          impressions: number;
          clicks: number;
          conversions: number;
          spend: number;
          revenue: number;
        };
      };
      content_calendar: {
        Row: {
          id: string;
          title: string;
          content_type: string;
          scheduled_date: string;
          status: string;
          assigned_to: string | null;
          body_text: string | null;
          media_url: string | null;
          created_at: string;
        };
      };
    };
  };
};
