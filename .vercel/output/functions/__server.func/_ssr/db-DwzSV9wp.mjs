// node_modules/.nitro/vite/services/ssr/assets/db-DwzSV9wp.js
var _0002_vanta_default = "create table if not exists vanta_reports (\n  id text primary key,\n  player_id text not null,\n  category text not null,\n  subject text not null,\n  body text not null,\n  status text not null default 'open',\n  claimed_by text,\n  evidence jsonb not null default '[]'::jsonb,\n  resolution text,\n  appeal text,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists vanta_incidents (\n  id text primary key,\n  title text not null,\n  severity text not null,\n  status text not null default 'open',\n  started_at timestamptz not null default now(),\n  resolved_at timestamptz,\n  notes jsonb not null default '[]'::jsonb\n);\n\ncreate table if not exists vanta_members (\n  id text primary key,\n  handle text not null,\n  tribe_id text,\n  role text not null default 'member',\n  joined_at timestamptz not null default now(),\n  reputation integer not null default 0\n);\n\ncreate table if not exists vanta_tribes (\n  id text primary key,\n  name text not null,\n  region text not null,\n  motto text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists vanta_waitlist (\n  id text primary key,\n  email text not null,\n  platform text not null,\n  region text not null,\n  consent boolean not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists vanta_events (\n  id text primary key,\n  slug text not null,\n  title text not null,\n  format text not null,\n  status text not null,\n  starts_at timestamptz not null,\n  ends_at timestamptz not null,\n  capacity integer not null,\n  region text not null,\n  host text not null,\n  rules_version text not null\n);\n\ncreate table if not exists vanta_event_registrations (\n  event_id text not null references vanta_events(id),\n  player_id text not null,\n  tribe_id text,\n  status text not null,\n  registered_at timestamptz not null default now(),\n  primary key (event_id, player_id)\n);\r\n\ncreate table if not exists vanta_audit (\n  id serial primary key,\n  actor text not null,\n  action text not null,\n  target text not null,\n  detail text,\n  created_at timestamptz not null default now()\n);\n\r\n\ncreate table if not exists vanta_anomalies (\n  id text primary key,\n  player_id text not null,\n  type text not null,\n  severity text not null,\n  status text not null default 'open',\n  notes jsonb not null default '[]'::jsonb,\n  created_at timestamptz not null default now()\n);\n\r\n\ninsert into vanta_events (id, slug, title, format, status, starts_at, ends_at, capacity, region, host, rules_version) values\n('evt_season_zero_raid_clock','season-zero-raid-clock','Season Zero Raid Clock - Opening Night','arena','open','2026-12-05T02:00:00Z','2026-12-05T06:00:00Z',32,'Australia (AU)','Vanta Fiber staff','season-zero-rules-v1'),\n('evt_founder_clash','founder-clash','Founder Clash - Creator Event','tribal','draft','2026-12-19T03:00:00Z','2026-12-19T09:00:00Z',16,'Europe (EU)','Vanta Fiber creators','season-zero-rules-v1')\non conflict (id) do nothing;\n\r\n\ncreate table if not exists vanta_pledges (\n  id text primary key,\n  player_id text not null,\n  tier_id text not null,\n  amount_usd integer not null,\n  status text not null default 'pending',\n  created_at timestamptz not null default now()\n);\ncreate table if not exists vanta_realm_requests (\n  id text primary key,\n  player_id text not null,\n  tribe_name text not null,\n  region text not null,\n  status text not null default 'pending',\n  created_at timestamptz not null default now()\n);\n\r\n\ncreate table if not exists vanta_lfg_posts (\n  id text primary key,\n  player_id text not null,\n  region text not null,\n  mode text not null,\n  title text not null,\n  note text not null,\n  status text not null default 'open',\n  created_at timestamptz not null default now()\n);\ncreate table if not exists vanta_tickets (\n  id text primary key,\n  player_id text not null,\n  category text not null,\n  subject text not null,\n  body text not null,\n  status text not null default 'open',\n  created_at timestamptz not null default now()\n);\n\r\n\n-- duplicate prevention\ncreate unique index if not exists vanta_event_registrations_unique on vanta_event_registrations (event_id, player_id);\ncreate unique index if not exists vanta_waitlist_email_unique on vanta_waitlist (email);\n\r\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.n);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_vanta.sql": _0002_vanta_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* The shared PGLite instance (preview only), with `migrations/*.sql` applied.
* Lets Better Auth persist to the SAME embedded DB as app data in preview (via a
* Kysely dialect). Throws when `DATABASE_URL` is set (that path uses Neon).
*/
async function getPglite() {
	if (dbSource !== "pglite") throw new Error("getPglite() is only available on the PGLite fallback (no DATABASE_URL)");
	await getSql();
	const pg = await globalRef.__pgliteInstance__;
	if (!pg) throw new Error("PGLite instance failed to initialize");
	return pg;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
export { getPglite as n, getSql as r, ensureDbReady as t };
