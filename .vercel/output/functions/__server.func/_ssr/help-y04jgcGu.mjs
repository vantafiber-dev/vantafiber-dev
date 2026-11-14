import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/help-y04jgcGu.js
var import_jsx_runtime = require_jsx_runtime();
var HELP_TOPICS = [
	{
		id: "how-to-join",
		title: "How to join",
		body: "Pick your platform (Xbox console or Windows Microsoft Store), join the waitlist, receive the Season Zero briefing, and get invited into a tribe listing through the member or Discord workflow."
	},
	{
		id: "report",
		title: "Report cheating or misconduct",
		body: "Use the in-game or Discord report path. Reports are triaged with evidence, never punished automatically."
	},
	{
		id: "appeal",
		title: "Appeal a moderation action",
		body: "Appeals go through a human reviewer with an independent appeals queue. Severe enforcement never relies on automated sign-off."
	},
	{
		id: "ticket",
		title: "Open or follow a support ticket",
		body: "Staff-handled tickets carry case owners, evidence handling and clear closure expectations."
	}
];
function Help() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "help-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Help centre"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "help-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Help, reports and appeals"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-base text-vanta-muted md:text-lg",
				children: "Support routes are staff-handled with case ownership, evidence handling and clear closure. Automated signals may prioritise review; missing telemetry is never treated as proof of innocence or guilt."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-3 md:grid-cols-2",
				children: HELP_TOPICS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold",
						children: h.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-vanta-muted",
						children: h.body
					})]
				}, h.id))
			})
		]
	}) });
}
var SplitComponent = Help;
export { SplitComponent as component };
