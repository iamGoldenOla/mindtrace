# DATABASE.md

Postgres on Supabase. Every table has **row-level security enabled**. Migrations live in `/supabase/migrations`. Do not change the schema after Day 3 without asking (see `AGENTS.md`).

## 1. Principles

- Internal UUIDs and learner `code`; no personal details in URLs, logs or prompts.
- Access to a learner comes from `learner_access`, not from role alone.
- Evidence rows are immutable once an attempt is `completed` (corrections go in `transcript_corrected`).
- Reports, runs and comparisons store version identifiers so results are reproducible.
- Source of each observation is always recorded: `teacher_report`, `parent_report`, `observed`, `assessment`.
- No column stores a diagnosis or condition label.

## 2. Schema

```sql
create extension if not exists pgcrypto;

create type app_role as enum ('teacher','parent','specialist','admin');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  email text,                              -- synthetic teacher email; unique, see 0002
  role app_role not null default 'teacher',
  created_at timestamptz not null default now()
);

create table learners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                 -- e.g. L-0001, no personal data
  pseudonym text,
  stage text,                                -- e.g. 'Year 2', 'Grade 2'
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
  category text,                             -- reading, instructions, maths, attention, sensory, communication, other
  context text,
  behaviour text not null,
  frequency text,
  source text not null check (source in ('teacher_report','parent_report','observed','assessment')),
  created_at timestamptz not null default now()
);

create table assessment_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                 -- 'read-aloud-a'
  name text not null,
  skill text not null,                       -- 'oral_reading', 'sound_match', 'word_build'
  form text,                                 -- 'A','B','C' matched forms
  language text not null default 'en',
  level text,
  instructions jsonb not null,
  scoring jsonb not null,
  target jsonb not null,                     -- passage text or item list
  validation_status text not null default 'unvalidated',
  version int not null default 1
);

create table support_strategies (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid not null,            -- FK added below
  catalog_key text not null,                 -- key in content/supports.json
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
  asr_status text,                           -- 'ok','failed','empty'
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
  evidence_id text not null,                 -- stable ID, e.g. 'E-a1b2-w07'
  item_ref text not null,                    -- word index or item id
  target text,
  observed text,
  outcome text not null,                     -- match, substitution, omission, insertion, selfcorrect, insufficient
  error_category text,                       -- see ASSESSMENT_SPEC.md
  hints_used int not null default 0,
  support_used text[] not null default '{}',
  response_ms int,
  unique (attempt_id, evidence_id)
);

create table investigations (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learners(id) on delete cascade,
  concern text not null,
  status text not null default 'open' check (status in ('open','report_ready','support_active','closed')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table support_strategies
  add constraint fk_strategy_investigation foreign key (investigation_id) references investigations(id) on delete cascade;

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
  verification jsonb not null,               -- {passed: bool, unsupported_claims: [], banned_language: []}
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
  comparison jsonb,                          -- from lib/reading/compare.ts
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

-- Migration 0002 (dev sign-in on the live database): profiles.email plus
-- the dev_sessions table for cookie sessions. See
-- supabase/migrations/0002_dev_sessions.sql.
create unique index profiles_email_unique on profiles (email);

create table dev_sessions (
  token text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
```

## 3. Row-level security

```sql
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
alter table dev_sessions enable row level security;
-- dev_sessions has no anon policies by design: only the service role
-- (server routes) may read or write sessions.

create or replace function public.can_access_learner(l uuid, need_write boolean default false)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from learner_access a
    where a.learner_id = l and a.user_id = auth.uid() and a.revoked_at is null
      and (not need_write or a.access_role in ('owner','contributor'))
  );
$$;

-- learners
create policy learners_read on learners for select using (can_access_learner(id));
create policy learners_insert on learners for insert with check (created_by = auth.uid());
create policy learners_update on learners for update using (can_access_learner(id, true));
create policy learners_delete on learners for delete using (
  exists (select 1 from learner_access a where a.learner_id = id and a.user_id = auth.uid() and a.access_role = 'owner' and a.revoked_at is null));

-- learner_access: users see their own grants
create policy access_self on learner_access for select using (user_id = auth.uid());

-- observations, attempts, investigations: same pattern
create policy obs_read  on observations for select using (can_access_learner(learner_id));
create policy obs_write on observations for insert with check (can_access_learner(learner_id, true) and author_id = auth.uid());
create policy att_read  on attempts for select using (can_access_learner(learner_id));
create policy att_write on attempts for insert with check (can_access_learner(learner_id, true) and created_by = auth.uid());
create policy att_upd   on attempts for update using (can_access_learner(learner_id, true));
create policy inv_read  on investigations for select using (can_access_learner(learner_id));
create policy inv_write on investigations for insert with check (can_access_learner(learner_id, true) and created_by = auth.uid());

-- responses, strategies, reports, followups: through their parent
create policy resp_read on responses for select using (
  exists (select 1 from attempts t where t.id = attempt_id and can_access_learner(t.learner_id)));
create policy rep_read on ai_reports for select using (
  exists (select 1 from investigations i where i.id = investigation_id and can_access_learner(i.learner_id)));
create policy strat_read on support_strategies for select using (
  exists (select 1 from investigations i where i.id = investigation_id and can_access_learner(i.learner_id)));
create policy fu_read on followups for select using (
  exists (select 1 from support_strategies s join investigations i on i.id = s.investigation_id
          where s.id = support_strategy_id and can_access_learner(i.learner_id)));

-- resources and definitions: readable by any signed-in user; only 'reviewed' resources shown in the app
create policy res_read on resources for select using (auth.role() = 'authenticated');
create policy def_read on assessment_definitions for select using (auth.role() = 'authenticated');
```

Complete the write policies for `responses`, `ai_reports`, `support_strategies` and `followups` in the same pattern. Writes to `ai_runs`, `audit_events` and `ai_reports` happen through server routes using the service role; no client write policy exists for those tables.

### Required RLS tests (`tests/rls.test.ts`)

1. User A cannot read User B's learner, observations, attempts, reports.
2. A `viewer` cannot insert observations.
3. A revoked grant stops access immediately.
4. A parent role with a `viewer` grant can read approved reports only (P1).
5. Deleting a learner removes all child rows and writes an audit event.

## 4. Seed data (synthetic only)

Create `supabase/seed.sql` and `content/` fixtures:

- Two teacher users (`teacher.a@example.test`, `teacher.b@example.test`), used to prove isolation.
- Four synthetic learners with codes `L-0001` to `L-0004`:
  - **L-0001:** reading evidence with several vowel-sound substitutions and omitted word endings (hero demo).
  - **L-0002:** a multilingual learner whose errors follow home-language patterns (tests the "language familiarity" explanation).
  - **L-0003:** accurate reading but a very short transcript (tests insufficient evidence).
  - **L-0004:** no improvement after a support (tests honest "no observed change").
- Assessment definitions for Forms A, B, C.
- Reviewed resources (see `RESOURCES.md`).

Mark every fixture file with a header comment: `SYNTHETIC DATA. NOT REAL CHILDREN.`

## 5. Deletion and retention

- Deleting a learner cascades to observations, attempts, responses, investigations, reports, strategies and follow-ups.
- `audit_events` retains only: actor, action, record type, record ID, timestamp. No content.
- Demo environment resets nightly to the seed.
