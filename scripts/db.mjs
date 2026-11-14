import pg from "pg";

const { Pool } = pg;
let pool = null;

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function getPool() {
  if (!isDbConfigured()) return null;
  if (pool) return pool;
  pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  pool.on("error", (e) => console.error("[db] pool error", e));
  return pool;
}

export async function query(text, params = []) {
  const p = await getPool();
  if (!p) throw new Error("DATABASE_URL not configured");
  const res = await p.query(text, params);
  return res.rows;
}

export async function migrate() {
  const p = await getPool();
  if (!p) { console.warn("[db] no DATABASE_URL; using file fallback"); return; }
  const statements = [
    `create table if not exists vanta_tickets (id text primary key, guild_id text not null, user_id text not null, subject text not null, status text not null default 'open', created_at timestamptz not null default now(), updated_at timestamptz not null default now())`,
    `create table if not exists vanta_reports (id text primary key, guild_id text not null, user_id text not null, subject text not null, status text not null default 'open', created_at timestamptz not null default now())`,
    `create table if not exists vanta_setup_jobs (id text primary key, guild_id text not null, owner_id text not null, status text not null default 'pending', expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), result text)`,
    `create table if not exists vanta_welcome_messages (guild_id text primary key, message_id text not null, channel_id text not null, updated_at timestamptz not null default now())`,
    `create table if not exists vanta_audit (id serial primary key, guild_id text, actor text, action text, target text, detail text, created_at timestamptz not null default now())
    ,
`,
  ];
  for (const stmt of statements) {
    await p.query(stmt);
  }
  await p.query(`create table if not exists vanta_events (id text primary key, slug text not null, title text not null, format text not null, status text not null, starts_at timestamptz not null, ends_at timestamptz not null, capacity integer not null, region text not null, host text not null, rules_version text not null)`);
  console.log("[db] migrations applied");
}

export async function closeDb() {
  if (pool) await pool.end();
}
