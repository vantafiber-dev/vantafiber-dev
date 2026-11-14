import { o as __toESM } from "../_runtime.mjs";
import { t as createSsrRpc } from "./createSsrRpc-ccwnlbeC.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { un as _enum, vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/incidents-Br2I1ru6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var openInput = object({
	title: string().min(1),
	severity: _enum([
		"low",
		"medium",
		"high",
		"critical"
	])
});
object({ id: string().min(1) });
var noteInput = object({
	id: string().min(1),
	note: string().min(1)
});
var listIncidentsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3e0267ea90f34cc1337f887a78337e1acd77945bd21eb8124278183b1024988d"));
var openIncidentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(openInput).handler(createSsrRpc("b000890ee7ab75bed70ac9fd1a0e351b7fb4d660473e7dc9ab76289cef59ecdc"));
var mitigateIncidentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(noteInput).handler(createSsrRpc("a1a394d840eadbfd5a101d51dfd65950fe697f3b26933c298aea36fcb38a075d"));
var resolveIncidentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(noteInput).handler(createSsrRpc("47bf9a766635e875e2534c089c550fa7f90a18cf472844d10c02d994a3a263d0"));
function Incidents() {
	const [incidents, setIncidents] = (0, import_react.useState)([]);
	const [title, setTitle] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function refresh() {
		try {
			const rows = await listIncidentsFn();
			setIncidents(rows);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load.");
		}
	}
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	async function onOpen() {
		setError(null);
		if (!title.trim()) {
			setError("Title required.");
			return;
		}
		try {
			await openIncidentFn({ data: {
				title: title.trim(),
				severity: "medium"
			} });
			setTitle("");
			setMessage("Incident opened.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Open failed.");
		}
	}
	async function onMitigate(id) {
		const note = prompt("Mitigation note:");
		if (!note) return;
		try {
			await mitigateIncidentFn({ data: {
				id,
				note
			} });
			setMessage("Mitigating.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	async function onResolve(id) {
		const note = prompt("Resolution note:");
		if (!note) return;
		try {
			await resolveIncidentFn({ data: {
				id,
				note
			} });
			setMessage("Resolved.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "inc-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Incidents"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "inc-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Incident history"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: title,
					onChange: (e) => setTitle(e.target.value),
					placeholder: "Incident title",
					className: "flex-1 rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onOpen,
					className: "inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
					children: "Open"
				})]
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
				children: incidents.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md border border-vanta-ash p-2",
					children: [
						i.title,
						" - ",
						i.severity,
						" - ",
						i.status,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-2",
							children: [i.status !== "resolved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onMitigate(i.id),
								className: "rounded-md border border-vanta-ash px-3 py-1",
								children: "Mitigate"
							}) : null, i.status !== "resolved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onResolve(i.id),
								className: "rounded-md border border-vanta-ash px-3 py-1",
								children: "Resolve"
							}) : null]
						})
					]
				}, i.id))
			})
		]
	}) });
}
var SplitComponent = Incidents;
export { SplitComponent as component };
