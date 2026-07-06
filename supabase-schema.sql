-- ============================================
-- Freshers 2026 - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. REGISTRATIONS TABLE
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  section text not null,
  roll_no text not null,
  phone text not null,
  email text not null unique,
  payment_screenshot_url text,
  payment_verified boolean default false,
  qr_data text unique,
  email_sent boolean default false,
  created_at timestamptz default now()
);

-- 2. ATTENDANCE TABLE
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  verified_by text,
  verified_at timestamptz default now()
);

-- 3. STORAGE BUCKETS
-- Create in Supabase Dashboard > Storage:
--   - 'payment-screenshots' (public)
-- Or run:
-- select storage.create_bucket('payment-screenshots', 'public');

-- 4. INDEXES
create index if not exists idx_registrations_email on registrations(email);
create index if not exists idx_registrations_qr_data on registrations(qr_data);
create index if not exists idx_attendance_registration_id on attendance(registration_id);
