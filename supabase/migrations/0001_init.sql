-- SYNTHETIC DATA. NOT REAL CHILDREN.
-- MINDTRACE initial schema. See DATABASE.md. Every table has RLS enabled.

create extension if not exists pgcrypto;

create type app_role as enum ('teacher','parent','specialist','admin');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  role app_role not null default 'teacher',
  created_at timestamptz not null default now()
);

create table learners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  pseudonym text,
  stage text,
  preferred_language text not null default 'en',
  assessment_language text not null default 'en',
  accessibility_prefs jsonb not null default '{}',
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table learner_access (
  user_id uuid not null references profiles(id) on delete cascade,
  learner_id uuid not null references learners(id) on delete cascade,
  access_role text not null check (access_role in ('owner','contributor','viewer')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (user_id, learner_id)
);

create table observations (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learners(id) on delete cascade,
  author_id uuid not null references profiles(id),
  observed_on date not null default current_date,
  category text,
  context text,
  behaviour text not null,
  frequency text,
  source text not null check (source in ('teacher_report','parent_report','observed','assessment')),
  created_at timestamptz not null default now()
);

create table assessment_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  skill text not null,
  form text,
  language text not null default 'en',
  level text,
  instructions jsonb not null,
  scoring jsonb not null,
  target jsonb not null,
  validation_status text not null default 'unvalidated',
  version int not null default 1
);

create table investigations (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learners(id) on delete cascade,
  concern text not null,
  status text not null default 'open' check (status in ('open','report_ready','support_active','closed')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table support_strategies (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references investigations(id) on delete cascade,
  catalog_key text not null,
  description text not null,
  target text,
  rationale text,
  start_date date not null default current_date,
  status text not null default 'active' check (status in ('active','paused','ended')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table attempts (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learners(id) on delete cascade,
  definition_id uuid not null references assessment_definitions(id),
  language text not null,
  condition text not null check (condition in ('baseline','support','followup')),
  support_strategy_id uuid references support_strategies(id),
  status text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  asr_status text,
  transcript text,
  transcript_corrected text,
  evidence_version text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_by uuid not null references profiles(id)
);

create table responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references attempts(id) on delete cascade,
  evidence_id text not null,
  item_ref text not null,
  target text,
  observed text,
  outcome text not null,
  error_category text,
  hints_used int not null default 0,
  support_used text[] not null default '{}',
  response_ms int,
  unique (attempt_id, evidence_id)
);

create table investigation_attempts (
  investigation_id uuid references investigations(id) on delete cascade,
  attempt_id uuid references attempts(id) on delete cascade,
  primary key (investigation_id, attempt_id)
);

create table ai_runs (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid references investigations(id) on delete cascade,
  kind text not null check (kind in ('investigate','verify','image','asr','followup')),
  provider text not null,
  model text not null,
  prompt_version text,
  schema_version text,
  input_hash text,
  status text not null check (status in ('ok','failed','rejected')),
  error text,
  latency_ms int,
  tokens_in int,
  tokens_out int,
  created_at timestamptz not null default now()
);

create table ai_reports (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references investigations(id) on delete cascade,
  ai_run_id uuid references ai_runs(id),
  report jsonb not null,
  verification jsonb not null,
  review_status text not null default 'pending_teacher_review'
    check (review_status in ('pending_teacher_review','approved','edited','rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table followups (
  id uuid primary key default gen_random_uuid(),
  support_strategy_id uuid not null references support_strategies(id) on delete cascade,
  baseline_attempt_id uuid not null references attempts(id),
  followup_attempt_id uuid references attempts(id),
  comparison jsonb,
  teacher_notes text,
  decision text check (decision in ('continue','change','review','refer')),
  created_at timestamptz not null default now()
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  publisher text not null,
  url text not null,
  type text not null check (type in ('video','guide','article','training','tool')),
  language text not null default 'en',
  topics text[] not null default '{}',
  audience text[] not null default '{}',
  summary text not null,
  practical_action text not null,
  review_status text not null default 'unreviewed' check (review_status in ('unreviewed','reviewed','rejected')),
  reviewed_on date,
  region text[] not null default '{}'
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  record_type text not null,
  record_id uuid,
  created_at timestamptz not null default now()
);

create index on observations (learner_id, observed_on desc);
create index on attempts (learner_id, started_at desc);
create index on responses (attempt_id);
create index on investigations (learner_id);

-- Row-level security: enabled on every table.

alter table profiles enable row level security;
alter table learners enable row level security;
alter table learner_access enable row level security;
alter table observations enable row level security;
alter table attempts enable row level security;
alter table responses enable row level security;
alter table investigations enable row level security;
alter table investigation_attempts enable row level security;
alter table support_strategies enable row level security;
alter table followups enable row level security;
alter table ai_runs enable row level security;
alter table ai_reports enable row level security;
alter table resources enable row level security;
alter table assessment_definitions enable row level security;
alter table audit_events enable row level security;

create or replace function public.can_access_learner(l uuid, need_write boolean default false)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from learner_access a
    where a.learner_id = l and a.user_id = auth.uid() and a.revoked_at is null
      and (not need_write or a.access_role in ('owner','contributor'))
  );
$$;

create policy learners_read on learners for select using (can_access_learner(id));
create policy learners_insert on learners for insert with check (created_by = auth.uid());
create policy learners_update on learners for update using (can_access_learner(id, true));
create policy learners_delete on learners for delete using (
  exists (select 1 from learner_access a where a.learner_id = id and a.user_id = auth.uid() and a.access_role = 'owner' and a.revoked_at is null));

create policy access_self on learner_access for select using (user_id = auth.uid());

create policy obs_read  on observations for select using (can_access_learner(learner_id));
create policy obs_write on observations for insert with check (can_access_learner(learner_id, true) and author_id = auth.uid());
create policy att_read  on attempts for select using (can_access_learner(learner_id));
create policy att_write on attempts for insert with check (can_access_learner(learner_id, true) and created_by = auth.uid());
create policy att_upd   on attempts for update using (can_access_learner(learner_id, true));
create policy inv_read  on investigations for select using (can_access_learner(learner_id));
create policy inv_write on investigations for insert with check (can_access_learner(learner_id, true) and created_by = auth.uid());
create policy inv_upd on investigations for update using (can_access_learner(learner_id, true));

create policy resp_read on responses for select using (
  exists (select 1 from attempts t where t.id = attempt_id and can_access_learner(t.learner_id)));
create policy resp_write on responses for insert with check (
  exists (select 1 from attempts t where t.id = attempt_id and can_access_learner(t.learner_id, true)));

create policy rep_read on ai_reports for select using (
  exists (select 1 from investigations i where i.id = investigation_id and can_access_learner(i.learner_id)));

create policy strat_read on support_strategies for select using (
  exists (select 1 from investigations i where i.id = investigation_id and can_access_learner(i.learner_id)));
create policy strat_write on support_strategies for insert with check (
  exists (select 1 from investigations i where i.id = investigation_id and can_access_learner(i.learner_id, true))
  and created_by = auth.uid());
create policy strat_upd on support_strategies for update using (
  exists (select 1 from investigations i where i.id = investigation_id and can_access_learner(i.learner_id, true)));

create policy fu_read on followups for select using (
  exists (select 1 from support_strategies s join investigations i on i.id = s.investigation_id
          where s.id = support_strategy_id and can_access_learner(i.learner_id)));
create policy fu_write on followups for insert with check (
  exists (select 1 from support_strategies s join investigations i on i.id = s.investigation_id
          where s.id = support_strategy_id and can_access_learner(i.learner_id, true)));
create policy fu_upd on followups for update using (
  exists (select 1 from support_strategies s join investigations i on i.id = s.investigation_id
          where s.id = support_strategy_id and can_access_learner(i.learner_id, true)));

create policy ia_read on investigation_attempts for select using (
  exists (select 1 from investigations i where i.id = investigation_id and can_access_learner(i.learner_id)));

create policy airun_read on ai_runs for select using (
  investigation_id is null or exists (select 1 from investigations i where i.id = investigation_id and can_access_learner(i.learner_id)));

create policy res_read on resources for select using (auth.role() = 'authenticated');
create policy def_read on assessment_definitions for select using (auth.role() = 'authenticated');
