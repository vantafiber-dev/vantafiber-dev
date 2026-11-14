import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/fair-play-Bg_tSMKl.js
var import_jsx_runtime = require_jsx_runtime();
var DETECTION_FAMILIES = [
	"Duplication and impossible inventory growth",
	"Mesh and base-geometry violations",
	"Unusual player stat changes and spawn kit anomalies",
	"Abnormal tribe activity and alliance transfers",
	"Account linkage and ban-evasion risk signals",
	"Crash and restart anomalies",
	"Transaction abuse (bot credits, duplicate redemptions)",
	"Discord attack patterns (raid joins, phishing links)",
	"Data integrity (save checksums, versioned backups)",
	"Server hardening (DDoS mitigation, credential rotation)"
];
var DETECTION_FAMILY_NOTES = {
	"Duplication and impossible inventory growth": "Requires authorised world-save or normalised event evidence; not client-side scanning.",
	"Mesh and base-geometry violations": "Uses authorised save evidence and admin review rather than coordinate-only bans."
};
function FairPlay() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "fair-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Fair Play - Trust Centre"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "fair-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Fair play is a feature, not a slogan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-base text-vanta-muted md:text-lg",
				children: "The Fair Play Ledger aggregates anti-cheat enforcement transparency with anonymous case numbers, a real appeals process, false-positive monitoring and a visible admin conflict-of-interest policy."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-3 md:grid-cols-2",
				children: DETECTION_FAMILIES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold",
						children: f
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-vanta-muted",
						children: DETECTION_FAMILY_NOTES[f] ?? "Reviewed case handling required."
					})]
				}, f))
			})
		]
	}) });
}
var SplitComponent = FairPlay;
export { SplitComponent as component };
