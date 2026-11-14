import { o as __toESM } from "../_runtime.mjs";
import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/config-CXfCAs7v.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function validateConfig(t) {
	const errors = [];
	if (!t.serverName.trim()) errors.push("Server name is required.");
	if (!t.map.trim()) errors.push("Map is required.");
	if (t.difficulty < 0 || t.difficulty > 10) errors.push("Difficulty must be between 0 and 10.");
	if (t.gatherMultiplier <= 0) errors.push("Gather multiplier must be positive.");
	if (t.xpMultiplier <= 0) errors.push("XP multiplier must be positive.");
	if (t.tamingMultiplier <= 0) errors.push("Taming multiplier must be positive.");
	if (t.maxPlayers < 1 || t.maxPlayers > 70) errors.push("Max players must be between 1 and 70.");
	if (t.tribeSlots < 1) errors.push("Tribe slots must be at least 1.");
	if (t.dayCycleSpeed <= 0) errors.push("Day cycle speed must be positive.");
	if (t.nightCycleSpeed <= 0) errors.push("Night cycle speed must be positive.");
	return errors.length === 0 ? { ok: true } : {
		ok: false,
		errors
	};
}
function simpleChecksum(s) {
	let h = 0;
	for (let i = 0; i < s.length; i += 1) h = h * 31 + s.charCodeAt(i) >>> 0;
	return h.toString(16).padStart(8, "0");
}
function compileConfig(t) {
	const warnings = [];
	if (t.maxPlayers > 50) warnings.push("High player count may impact Xbox performance.");
	if (t.gatherMultiplier > 5) warnings.push("High gather multiplier may trivialize progression.");
	if (t.difficulty >= 8) warnings.push("High difficulty may frustrate new players.");
	const lines = [];
	lines.push("[ServerSettings]");
	lines.push(`ServerName=${t.serverName}`);
	lines.push(`MaxPlayers=${t.maxPlayers}`);
	lines.push(`ServerPVE=${t.mode === "pve" ? "True" : "False"}`);
	lines.push(`AllowCrossplay=${t.crossplay ? "True" : "False"}`);
	lines.push(`DifficultyOffset=${t.difficulty}`);
	lines.push(`XPMultiplier=${t.xpMultiplier}`);
	lines.push(`TamingSpeedMultiplier=${t.tamingMultiplier}`);
	lines.push(`HarvestAmountMultiplier=${t.gatherMultiplier}`);
	lines.push(`DayCycleSpeedScale=${t.dayCycleSpeed}`);
	lines.push(`NightTimeSpeedScale=${t.nightCycleSpeed}`);
	lines.push(`TribeSlots=${t.tribeSlots}`);
	lines.push("");
	lines.push("[SessionSettings]");
	lines.push(`SessionName=${t.serverName}`);
	lines.push(`MapName=${t.map}`);
	lines.push("");
	const ini = lines.join("\n");
	return {
		ini,
		checksum: simpleChecksum(ini),
		warnings
	};
}
var defaultConfigTemplate = {
	serverName: "Vanta Fiber - Season Zero",
	map: "TheIsland",
	mode: "pve",
	difficulty: 4,
	gatherMultiplier: 2,
	xpMultiplier: 2,
	tamingMultiplier: 3,
	maxPlayers: 40,
	crossplay: true,
	tribeSlots: 70,
	dayCycleSpeed: 1,
	nightCycleSpeed: 1
};
var providers = [{
	id: "nitrado",
	name: "Nitrado (Xbox ASE)",
	status: "owner_gated",
	capabilities: [
		{
			id: "deploy",
			label: "Deploy server",
			status: "owner_gated"
		},
		{
			id: "restart",
			label: "Restart",
			status: "owner_gated"
		},
		{
			id: "wipe",
			label: "Wipe",
			status: "owner_gated"
		},
		{
			id: "backup",
			label: "Backup",
			status: "owner_gated"
		}
	],
	deploy: async () => ({
		ok: false,
		message: "Owner-gated: Nitrado credentials not configured."
	}),
	statusCheck: async () => ({
		ok: false,
		message: "Owner-gated: Nitrado credentials not configured."
	})
}];
function Configurator() {
	const [template] = (0, import_react.useState)(defaultConfigTemplate);
	const validation = validateConfig(template);
	const compiled = validation.ok ? compileConfig(template) : null;
	const [message, setMessage] = (0, import_react.useState)(null);
	async function onDeploy() {
		const result = await providers[0].deploy(compiled?.ini ?? "");
		setMessage(result.message);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "config-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Config compiler"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "config-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Server configuration preview"
			}),
			validation.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-6 max-h-96 overflow-auto rounded-md border border-vanta-ash bg-vanta-slate p-4 text-xs",
					children: compiled?.ini
				}),
				compiled?.warnings.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-1 text-sm text-vanta-ash",
					children: compiled.warnings.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["- ", w] }, i))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-vanta-muted",
					children: ["Checksum: ", compiled?.checksum]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onDeploy,
					className: "mt-4 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
					children: "Deploy (owner-gated)"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-1 text-sm text-vanta-ash",
				children: !validation.ok ? validation.errors.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["- ", e] }, i)) : null
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-4 text-sm text-vanta-ash",
				children: message
			}) : null
		]
	}) });
}
var SplitComponent = Configurator;
export { SplitComponent as component };
