import { o as __toESM } from "../_runtime.mjs";
import { t as createSsrRpc } from "./createSsrRpc-ccwnlbeC.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/events-AbuY6J3y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var regInput = object({
	eventId: string().min(1),
	tribeId: string().optional()
});
var listEventsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("9bce5c1746786e96cd65a2ccc3dea34a8d02260938d7ceab6aca9eee3d70353e"));
var registerEventFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(regInput).handler(createSsrRpc("09bf5744fc8fb3148270f210c886d77898ad619f202797f2435b94e5667d7f59"));
var checkInEventFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ eventId: string().min(1) })).handler(createSsrRpc("c1ef43089d96cd4f0106dd7404fbaec6259b7cde5bc0f55cf51e935d2e5f8dc1"));
function Events() {
	const [events, setEvents] = (0, import_react.useState)([]);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function refresh() {
		try {
			const rows = await listEventsFn();
			setEvents(rows);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	async function onRegister(id) {
		try {
			const r = await registerEventFn({ data: { eventId: id } });
			setMessage(r.status === "registered" ? "Registered." : "Waitlisted.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	async function onCheckIn(id) {
		try {
			await checkInEventFn({ data: { eventId: id } });
			setMessage("Checked in.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "events-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Events"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "events-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Events and raid clock"
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-3",
				children: events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg font-semibold",
								children: e.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "kicker",
								children: e.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-vanta-muted",
							children: [
								e.format,
								" - capacity ",
								e.capacity,
								" - region ",
								e.region,
								" - rules ",
								e.rules_version
							]
						}),
						e.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onRegister(e.id),
								className: "inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
								children: "Register"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onCheckIn(e.id),
								className: "inline-flex min-h-12 items-center rounded-md border border-vanta-ash px-5 font-medium",
								children: "Check in"
							})]
						}) : null
					]
				}, e.id))
			})
		]
	}) });
}
var SplitComponent = Events;
export { SplitComponent as component };
