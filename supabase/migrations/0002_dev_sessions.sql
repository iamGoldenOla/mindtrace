-- SYNTHETIC DATA. NOT REAL CHILDREN.
-- MINDTRACE migration 0002: dev sign-in support on the live database.
-- profiles gains the teacher's (synthetic) email so the app can find the
-- account without calling auth.admin; dev_sessions persists cookie sessions
-- so sign-in survives across serverless invocations.
-- RLS stays enabled on every table. dev_sessions has no anon policies:
-- only the service role (server routes) may read or write it.

alter table profiles add column if not exists email text;
create unique index if not exists profiles_email_unique on profiles (email);

create table if not exists dev_sessions (
  token text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table dev_sessions enable row level security;
