import { t as createServerRpc } from "./createServerRpc-4IU9UdN_.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { _n as number, un as _enum, vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { r as getSql } from "./db-DwzSV9wp.mjs";
// node_modules/.nitro/vite/services/ssr/assets/members.functions-C8kWyZM8.js
var createTribeInput = object({
	name: string().min(1),
	region: string().min(1),
	motto: string().min(1)
});
var joinInput = object({
	memberId: string().min(1),
	tribeId: string().min(1)
});
var leaveInput = object({ memberId: string().min(1) });
var roleInput = object({
	memberId: string().min(1),
	role: _enum([
		"member",
		"officer",
		"leader"
	])
});
var repInput = object({
	memberId: string().min(1),
	delta: number()
});
function newId(prefix) {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
var listTribesFn_createServerFn_handler = createServerRpc({
	id: "37e98525797633ad1ed56752423502b87e9b7f0171f7863533b88a135bde7d62",
	name: "listTribesFn",
	filename: "src/lib/vanta/members.functions.ts"
}, (opts) => listTribesFn.__executeServer(opts));
var listTribesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listTribesFn_createServerFn_handler, async () => {
	return await (await getSql())`select * from vanta_tribes order by created_at desc`;
});
var ensureMemberFn_createServerFn_handler = createServerRpc({
	id: "f8a295320643ef3a1023e11abd262b5e1fa1b7c69665c941e77322fcf7a9d6b1",
	name: "ensureMemberFn",
	filename: "src/lib/vanta/members.functions.ts"
}, (opts) => ensureMemberFn.__executeServer(opts));
var ensureMemberFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(ensureMemberFn_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	if ((await sql`select id from vanta_members where id=${context.userId}`).length === 0) await sql`insert into vanta_members (id, handle) values (${context.userId}, ${context.userId})`;
	return { id: context.userId };
});
var listMembersFn_createServerFn_handler = createServerRpc({
	id: "905fe6d45451e4d953b7cae908faf5c3ff10afc1dd25e0f35442b7c408b7c38f",
	name: "listMembersFn",
	filename: "src/lib/vanta/members.functions.ts"
}, (opts) => listMembersFn.__executeServer(opts));
var listMembersFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMembersFn_createServerFn_handler, async () => {
	return await (await getSql())`select * from vanta_members order by joined_at desc`;
});
var createTribeFn_createServerFn_handler = createServerRpc({
	id: "3c179d1bee23ef746e7216b658376c29dcede5a03fa27e0b7e71c19716e1b31c",
	name: "createTribeFn",
	filename: "src/lib/vanta/members.functions.ts"
}, (opts) => createTribeFn.__executeServer(opts));
var createTribeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(createTribeInput).handler(createTribeFn_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const id = newId("tribe");
	await sql`insert into vanta_tribes (id, name, region, motto) values (${id}, ${data.name}, ${data.region}, ${data.motto})`;
	return { id };
});
var joinTribeFn_createServerFn_handler = createServerRpc({
	id: "7c045773bb5e67433fb52796c638893612763afd18f1cf34e731a5595dd28e7b",
	name: "joinTribeFn",
	filename: "src/lib/vanta/members.functions.ts"
}, (opts) => joinTribeFn.__executeServer(opts));
var joinTribeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(joinInput).handler(joinTribeFn_createServerFn_handler, async ({ data }) => {
	if ((await (await getSql())`update vanta_members set tribe_id=${data.tribeId}, role='member' where id=${data.memberId} returning id`).length === 0) throw new Error("Join failed.");
	return { ok: true };
});
var leaveTribeFn_createServerFn_handler = createServerRpc({
	id: "5fafbaa4b98d0e9431a9e425ea8460aa0f2af29ffdebbccf62489bf6cbdd04d9",
	name: "leaveTribeFn",
	filename: "src/lib/vanta/members.functions.ts"
}, (opts) => leaveTribeFn.__executeServer(opts));
var leaveTribeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(leaveInput).handler(leaveTribeFn_createServerFn_handler, async ({ data }) => {
	if ((await (await getSql())`update vanta_members set tribe_id=null, role='member' where id=${data.memberId} returning id`).length === 0) throw new Error("Leave failed.");
	return { ok: true };
});
var setRoleFn_createServerFn_handler = createServerRpc({
	id: "3f3cb3ba1f2144a64c1de85917e8b03cb4d789e2dcec1e485785b553e2007898",
	name: "setRoleFn",
	filename: "src/lib/vanta/members.functions.ts"
}, (opts) => setRoleFn.__executeServer(opts));
var setRoleFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(roleInput).handler(setRoleFn_createServerFn_handler, async ({ data }) => {
	if ((await (await getSql())`update vanta_members set role=${data.role} where id=${data.memberId} returning id`).length === 0) throw new Error("Set role failed.");
	return { ok: true };
});
var reputationFn_createServerFn_handler = createServerRpc({
	id: "e7d2e8a0f223cbeeb5f311a5edfc0d098406c3ffcef1b0964606b1c60b367aaf",
	name: "reputationFn",
	filename: "src/lib/vanta/members.functions.ts"
}, (opts) => reputationFn.__executeServer(opts));
var reputationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(repInput).handler(reputationFn_createServerFn_handler, async ({ data }) => {
	const rows = await (await getSql())`update vanta_members set reputation = reputation + ${data.delta} where id=${data.memberId} returning reputation`;
	if (rows.length === 0) throw new Error("Reputation failed.");
	return { reputation: rows[0].reputation };
});
export { createTribeFn_createServerFn_handler, ensureMemberFn_createServerFn_handler, joinTribeFn_createServerFn_handler, leaveTribeFn_createServerFn_handler, listMembersFn_createServerFn_handler, listTribesFn_createServerFn_handler, reputationFn_createServerFn_handler, setRoleFn_createServerFn_handler };
