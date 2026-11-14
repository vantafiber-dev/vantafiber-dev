import { o as __toESM } from "../_runtime.mjs";
import { t as createSsrRpc } from "./createSsrRpc-ccwnlbeC.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { un as _enum, vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/anti-cheat-DRgW7mcB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
var listAnomaliesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("07504554aa8e8e9ece589390f72af2936e68bfee58479b07ddcb794140dadc3a"));
var reportAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(reportInput).handler(createSsrRpc("2e4e91ef8a233aa9af4b964d2ca158df8aba5d3ac3fb91429277c4ef7340aa67"));
var investigateAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(idInput).handler(createSsrRpc("7949bfdc4bdfc4637a7fcedda7145a094d9f1ba501710dc51faa3e3ea91657cd"));
var dismissAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(noteInput).handler(createSsrRpc("3b500da16917c931be67a4c03a9aee6a894fde31be159e1d98cfc73f2493f8f4"));
var confirmAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(noteInput).handler(createSsrRpc("1289f95e660d11fa588df77962d0f063e4234667fd2bd3ef97cdea4d201829b9"));
function AntiCheat() {
	const [anomalies, setAnomalies] = (0, import_react.useState)([]);
	const [playerId, setPlayerId] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function refresh() {
		try {
			const rows = await listAnomaliesFn();
			setAnomalies(rows);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	async function onReport() {
		setError(null);
		if (!playerId.trim() || !type.trim()) {
			setError("Player and type required.");
			return;
		}
		try {
			await reportAnomalyFn({ data: {
				playerId: playerId.trim(),
				type: type.trim(),
				severity: "medium"
			} });
			setPlayerId("");
			setType("");
			setMessage("Anomaly recorded.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	async function onInvestigate(id) {
		try {
			await investigateAnomalyFn({ data: { id } });
			setMessage("Investigating.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	async function onDismiss(id) {
		const note = prompt("Dismiss note:");
		if (!note) return;
		try {
			await dismissAnomalyFn({ data: {
				id,
				note
			} });
			setMessage("Dismissed.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	async function onConfirm(id) {
		const note = prompt("Confirm note:");
		if (!note) return;
		try {
			await confirmAnomalyFn({ data: {
				id,
				note
			} });
			setMessage("Confirmed.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "ac-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Anti-cheat"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "ac-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Anomaly dashboard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: playerId,
						onChange: (e) => setPlayerId(e.target.value),
						placeholder: "Player ID",
						className: "rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: type,
						onChange: (e) => setType(e.target.value),
						placeholder: "Anomaly type",
						className: "rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onReport,
						className: "inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
						children: "Record"
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-sm text-red-400",
				children: error
			}) : null,
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-sm text-vanta-ash",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-2 text-sm",
				children: anomalies.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md border border-vanta-ash p-2",
					children: [
						a.player_id,
						" - ",
						a.type,
						" - ",
						a.severity,
						" - ",
						a.status,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-2",
							children: [
								a.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onInvestigate(a.id),
									className: "rounded-md border border-vanta-ash px-3 py-1",
									children: "Investigate"
								}) : null,
								a.status !== "confirmed" && a.status !== "dismissed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onDismiss(a.id),
									className: "rounded-md border border-vanta-ash px-3 py-1",
									children: "Dismiss"
								}) : null,
								a.status !== "confirmed" && a.status !== "dismissed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onConfirm(a.id),
									className: "rounded-md border border-vanta-ash px-3 py-1",
									children: "Confirm"
								}) : null
							]
						})
					]
				}, a.id))
			})
		]
	}) });
}
var SplitComponent = AntiCheat;
export { SplitComponent as component };
