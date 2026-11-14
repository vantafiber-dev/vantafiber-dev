create table if not exists vanta_reports (
  id text primary key,
  player_id text not null,
  category text not null,
  subject text not null,
  body text not null,
  status text not null default 'open',
  claimed_by text,
  evidence jsonb not null default '[]'::jsonb,
  resolution text,
  appeal text,
  created_at timestamptz not null default now()
);

create table if not exists vanta_incidents (
  id text primary key,
  title text not null,
  severity text not null,
  status text not null default 'open',
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  notes jsonb not null default '[]'::jsonb
);

create table if not exists vanta_members (
  id text primary key,
  handle text not null,
  tribe_id text,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  reputation integer not null default 0
);

create table if not exists vanta_tribes (
  id text primary key,
  name text not null,
  region text not null,
  motto text not null,
  created_at timestamptz not null default now()
);

create table if not exists vanta_waitlist (
  id text primary key,
  email text not null,
  platform text not null,
  region text not null,
  consent boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists vanta_events (
  id text primary key,
  slug text not null,
  title text not null,
  format text not null,
  status text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null,
  region text not null,
  host text not null,
  rules_version text not null
);

create table if not exists vanta_event_registrations (
  event_id text not null references vanta_events(id),
  player_id text not null,
  tribe_id text,
  status text not null,
  registered_at timestamptz not null default now(),
  primary key (event_id, player_id)
);

create table if not exists vanta_audit (
  id serial primary key,
  actor text not null,
  action text not null,
  target text not null,
  detail text,
  created_at timestamptz not null default now()
);


create table if not exists vanta_anomalies (
  id text primary key,
  player_id text not null,
  type text not null,
  severity text not null,
  status text not null default 'open',
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);


insert into vanta_events (id, slug, title, format, status, starts_at, ends_at, capacity, region, host, rules_version) values
('evt_season_zero_raid_clock','season-zero-raid-clock','Season Zero Raid Clock - Opening Night','arena','open','2026-12-05T02:00:00Z','2026-12-05T06:00:00Z',32,'Australia (AU)','Vanta Fiber staff','season-zero-rules-v1'),
('evt_founder_clash','founder-clash','Founder Clash - Creator Event','tribal','draft','2026-12-19T03:00:00Z','2026-12-19T09:00:00Z',16,'Europe (EU)','Vanta Fiber creators','season-zero-rules-v1')
on conflict (id) do nothing;


create table if not exists vanta_pledges (
  id text primary key,
  player_id text not null,
  tier_id text not null,
  amount_usd integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create table if not exists vanta_realm_requests (
  id text primary key,
  player_id text not null,
  tribe_name text not null,
  region text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);


create table if not exists vanta_lfg_posts (
  id text primary key,
  player_id text not null,
  region text not null,
  mode text not null,
  title text not null,
  note text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create table if not exists vanta_tickets (
  id text primary key,
  player_id text not null,
  category text not null,
  subject text not null,
  body text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);


-- duplicate prevention
create unique index if not exists vanta_event_registrations_unique on vanta_event_registrations (event_id, player_id);
create unique index if not exists vanta_waitlist_email_unique on vanta_waitlist (email);

