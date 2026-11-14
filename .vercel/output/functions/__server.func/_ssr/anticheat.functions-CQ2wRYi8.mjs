import { t as createServerRpc } from "./createServerRpc-4IU9UdN_.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { un as _enum, vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { r as getSql } from "./db-DwzSV9wp.mjs";
// node_modules/.nitro/vite/services/ssr/assets/anticheat.functions-CQ2wRYi8.js
var reportInput = object({
	playerId: string().min(1),
	type: string().min(1),
	severity: _enum([
		"low",
		"medium",
		"high",
		"critical"
	])
});
var idInput = object({ id: string().min(1) });
var noteInput = object({
	id: string().min(1),
	note: string().min(1)
});
function newId() {
	return `anom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
var listAnomaliesFn_createServerFn_handler = createServerRpc({
	id: "07504554aa8e8e9ece589390f72af2936e68bfee58479b07ddcb794140dadc3a",
	name: "listAnomaliesFn",
	filename: "src/lib/vanta/anticheat.functions.ts"
}, (opts) => listAnomaliesFn.__executeServer(opts));
var listAnomaliesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAnomaliesFn_createServerFn_handler, async () => {
	return await (await getSql())`select * from vanta_anomalies order by created_at desc`;
});
var reportAnomalyFn_createServerFn_handler = createServerRpc({
	id: "2e4e91ef8a233aa9af4b964d2ca158df8aba5d3ac3fb91429277c4ef7340aa67",
	name: "reportAnomalyFn",
	filename: "src/lib/vanta/anticheat.functions.ts"
}, (opts) => reportAnomalyFn.__executeServer(opts));
var reportAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(reportInput).handler(reportAnomalyFn_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const id = newId();
	await sql`insert into vanta_anomalies (id, player_id, type, severity) values (${id}, ${data.playerId}, ${data.type}, ${data.severity})`;
	return { id };
});
var investigateAnomalyFn_createServerFn_handler = createServerRpc({
	id: "7949bfdc4bdfc4637a7fcedda7145a094d9f1ba501710dc51faa3e3ea91657cd",
	name: "investigateAnomalyFn",
	filename: "src/lib/vanta/anticheat.functions.ts"
}, (opts) => investigateAnomalyFn.__executeServer(opts));
var investigateAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(idInput).handler(investigateAnomalyFn_createServerFn_handler, async ({ data }) => {
	if ((await (await getSql())`update vanta_anomalies set status='investigating' where id=${data.id} and status='open' returning id`).length === 0) throw new Error("Investigate failed.");
	return { ok: true };
});
var dismissAnomalyFn_createServerFn_handler = createServerRpc({
	id: "3b500da16917c931be67a4c03a9aee6a894fde31be159e1d98cfc73f2493f8f4",
	name: "dismissAnomalyFn",
	filename: "src/lib/vanta/anticheat.functions.ts"
}, (opts) => dismissAnomalyFn.__executeServer(opts));
var dismissAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(noteInput).handler(dismissAnomalyFn_createServerFn_handler, async ({ data }) => {
	if ((await (await getSql())`update vanta_anomalies set status='dismissed', notes = notes || ${JSON.stringify([data.note])}::jsonb where id=${data.id} returning id`).length === 0) throw new Error("Dismiss failed.");
	return { ok: true };
});
var confirmAnomalyFn_createServerFn_handler = createServerRpc({
	id: "1289f95e660d11fa588df77962d0f063e4234667fd2bd3ef97cdea4d201829b9",
	name: "confirmAnomalyFn",
	filename: "src/lib/vanta/anticheat.functions.ts"
}, (opts) => confirmAnomalyFn.__executeServer(opts));
var confirmAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(noteInput).handler(confirmAnomalyFn_createServerFn_handler, async ({ data }) => {
	if ((await (await getSql())`update vanta_anomalies set status='confirmed', notes = notes || ${JSON.stringify([data.note])}::jsonb where id=${data.id} returning id`).length === 0) throw new Error("Confirm failed.");
	return { ok: true };
});
export { confirmAnomalyFn_createServerFn_handler, dismissAnomalyFn_createServerFn_handler, investigateAnomalyFn_createServerFn_handler, listAnomaliesFn_createServerFn_handler, reportAnomalyFn_createServerFn_handler };
