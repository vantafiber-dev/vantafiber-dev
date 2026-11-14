import { t as createServerRpc } from "./createServerRpc-4IU9UdN_.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { _n as number, vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { r as getSql } from "./db-DwzSV9wp.mjs";
// node_modules/.nitro/vite/services/ssr/assets/commerce.functions-D9Nfwvl5.js
var pledgeInput = object({
	tierId: string().min(1),
	amountUsd: number().positive()
});
var realmInput = object({
	tribeName: string().min(1),
	region: string().min(1)
});
function newId(p) {
	return `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
var listPledgesFn_createServerFn_handler = createServerRpc({
	id: "3a6a3d766c6dd8eec131cc9b0f2f13b83d54983f4053fedac0dbd1ae80a18108",
	name: "listPledgesFn",
	filename: "src/lib/vanta/commerce.functions.ts"
}, (opts) => listPledgesFn.__executeServer(opts));
var listPledgesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPledgesFn_createServerFn_handler, async ({ context }) => {
	return await (await getSql())`select * from vanta_pledges where player_id=${context.userId} order by created_at desc`;
});
var pledgeFn_createServerFn_handler = createServerRpc({
	id: "791d14eea426903fadaebd257b4a188ea8a9abdc55ac2340becc50a85b61f027",
	name: "pledgeFn",
	filename: "src/lib/vanta/commerce.functions.ts"
}, (opts) => pledgeFn.__executeServer(opts));
var pledgeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(pledgeInput).handler(pledgeFn_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const id = newId("pledge");
	await sql`insert into vanta_pledges (id, player_id, tier_id, amount_usd) values (${id}, ${context.userId}, ${data.tierId}, ${data.amountUsd})`;
	return { id };
});
var listRealmRequestsFn_createServerFn_handler = createServerRpc({
	id: "0e1e4db434a22dd5b3f6f966e3d114d1ebfefb28c1988de8d9a3c83913f9e8ac",
	name: "listRealmRequestsFn",
	filename: "src/lib/vanta/commerce.functions.ts"
}, (opts) => listRealmRequestsFn.__executeServer(opts));
var listRealmRequestsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listRealmRequestsFn_createServerFn_handler, async ({ context }) => {
	return await (await getSql())`select * from vanta_realm_requests where player_id=${context.userId} order by created_at desc`;
});
var requestRealmFn_createServerFn_handler = createServerRpc({
	id: "07a56302aee8ee7c04dc3874a4e48c5e9c2989cc995f3c4f59d94b4d74c0dca6",
	name: "requestRealmFn",
	filename: "src/lib/vanta/commerce.functions.ts"
}, (opts) => requestRealmFn.__executeServer(opts));
var requestRealmFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(realmInput).handler(requestRealmFn_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const id = newId("realm");
	await sql`insert into vanta_realm_requests (id, player_id, tribe_name, region) values (${id}, ${context.userId}, ${data.tribeName}, ${data.region})`;
	return { id };
});
export { listPledgesFn_createServerFn_handler, listRealmRequestsFn_createServerFn_handler, pledgeFn_createServerFn_handler, requestRealmFn_createServerFn_handler };
