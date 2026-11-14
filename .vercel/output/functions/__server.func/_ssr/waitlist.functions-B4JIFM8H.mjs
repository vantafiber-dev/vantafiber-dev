import { t as createServerRpc } from "./createServerRpc-4IU9UdN_.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { pn as boolean, vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { r as getSql } from "./db-DwzSV9wp.mjs";
// node_modules/.nitro/vite/services/ssr/assets/waitlist.functions-B4JIFM8H.js
var joinInput = object({
	email: string().email(),
	platform: string().min(1),
	region: string().min(1),
	consent: boolean()
});
function newId() {
	return `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
var listWaitlistFn_createServerFn_handler = createServerRpc({
	id: "b21bcc7f39287cdcd5a469e9a38c3dc2d5b9054f85276cba21035b26e36b597d",
	name: "listWaitlistFn",
	filename: "src/lib/vanta/waitlist.functions.ts"
}, (opts) => listWaitlistFn.__executeServer(opts));
var listWaitlistFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listWaitlistFn_createServerFn_handler, async () => {
	return await (await getSql())`select * from vanta_waitlist order by created_at desc`;
});
var joinWaitlistFn_createServerFn_handler = createServerRpc({
	id: "61365f27903624679095204a5beb5d4127119374b45d1664c6be5e09983aa0b6",
	name: "joinWaitlistFn",
	filename: "src/lib/vanta/waitlist.functions.ts"
}, (opts) => joinWaitlistFn.__executeServer(opts));
var joinWaitlistFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(joinInput).handler(joinWaitlistFn_createServerFn_handler, async ({ data }) => {
	if (!data.consent) throw new Error("Consent required.");
	const sql = await getSql();
	const id = newId();
	await sql`insert into vanta_waitlist (id, email, platform, region, consent) values (${id}, ${data.email}, ${data.platform}, ${data.region}, ${data.consent})`;
	return { id };
});
export { joinWaitlistFn_createServerFn_handler, listWaitlistFn_createServerFn_handler };
