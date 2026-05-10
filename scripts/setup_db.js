
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Attempting to initialize bbi_reports table via RPC/SQL...');
  
  // Note: Most Supabase anon keys cannot run arbitrary SQL unless an RPC is already defined.
  // This is a "Best Effort" attempt to create the table structure.
  
  const sql = `
    create table if not exists bbi_reports (
      id uuid primary key default uuid_generate_v4(),
      candidate_name text,
      role_title text,
      industry text,
      overall_score float,
      fit_signal text,
      executive_summary text,
      got_consistency_score float,
      integrity_warnings integer default 0,
      full_report_json jsonb,
      manager_review_rating int,
      manager_review_notes text,
      created_at timestamp with time zone default now(),
      reviewed_at timestamp with time zone
    );

    alter table bbi_reports enable row level security;

    do $$
    begin
      if not exists (select 1 from pg_policies where policyname = 'Public Access') then
        create policy "Public Access" on bbi_reports for all using (true);
      end if;
    end
    $$;
  `;

  console.log('---------------------------------------------------------');
  console.log('MANUAL ACTION REQUIRED');
  console.log('---------------------------------------------------------');
  console.log('I cannot run raw SQL through the "anon" key for security reasons.');
  console.log('Please go to: https://supabase.com/dashboard/project/lcckfagyldrbaohwmboj/sql/new');
  console.log('And paste the following code:');
  console.log('\n' + sql + '\n');
  console.log('---------------------------------------------------------');
}

setupDatabase();
