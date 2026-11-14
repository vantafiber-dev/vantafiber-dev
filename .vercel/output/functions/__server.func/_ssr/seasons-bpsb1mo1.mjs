import { n as VANTA, t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/seasons-bpsb1mo1.js
var import_jsx_runtime = require_jsx_runtime();
function Seasons() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "season-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "kicker",
				children: ["Season briefing - ", VANTA.seasonName]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "season-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Season Zero briefing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-base text-vanta-muted md:text-lg",
				children: "One concise page with start time in the player timezone, rates summary, meaningful rule changes, carry-over policy, map availability, staff coverage and the next event. Plain-text and low-bandwidth versions are part of the delivery contract."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-semibold",
							children: "Rates summary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-vanta-muted",
							children: "Three independently balanced modes are designed for empirical comparison: high-speed true fibercraft, 100x competitive fibercraft, and premium fast-PvP hybrids. Prototype presets are configuration candidates pending Xbox ASE playtests."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-semibold",
							children: "Carry-over policy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-vanta-muted",
							children: "Achievements, event results and public recognition carry over by choice. Gameplay advantage resets according to the published wipe rules."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-semibold",
							children: "Map availability"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-vanta-muted",
							children: "Map additions are gated on demand evidence, capacity and budget. No proposed map is assumed to be day-one hosted."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-semibold",
							children: "Staff coverage"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-vanta-muted",
							children: "Event coverage is sized from actual staff availability, not assumed volunteer hours."
						})]
					})
				]
			})
		]
	}) });
}
var SplitComponent = Seasons;
export { SplitComponent as component };
