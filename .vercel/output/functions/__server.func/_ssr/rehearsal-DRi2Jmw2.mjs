import { o as __toESM } from "../_runtime.mjs";
import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/rehearsal-DRi2Jmw2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_STEPS = [
	{
		id: "backup",
		label: "Snapshot current server state"
	},
	{
		id: "announce",
		label: "Announce wipe window to members"
	},
	{
		id: "kick",
		label: "Kick active players"
	},
	{
		id: "wipe_save",
		label: "Wipe save files"
	},
	{
		id: "restore_config",
		label: "Restore compiled config"
	},
	{
		id: "restart",
		label: "Restart server"
	},
	{
		id: "verify",
		label: "Verify server health and config checksum"
	},
	{
		id: "reopen",
		label: "Reopen to players"
	}
];
function createWipeRehearsal() {
	return {
		id: `wipe_${Date.now()}`,
		startedAt: (/* @__PURE__ */ new Date()).toISOString(),
		steps: DEFAULT_STEPS.map((s) => ({
			...s,
			status: "pending"
		})),
		overall: "pending"
	};
}
function runWipeRehearsal(rehearsal, failAt) {
	for (const step of rehearsal.steps) {
		step.status = "running";
		if (failAt && step.id === failAt) {
			step.status = "failed";
			step.detail = "Simulated failure for rehearsal.";
			rehearsal.overall = "failed";
			rehearsal.finishedAt = (/* @__PURE__ */ new Date()).toISOString();
			return rehearsal;
		}
		step.status = "passed";
		step.detail = "Fixture mode: step completed.";
	}
	rehearsal.overall = "passed";
	rehearsal.finishedAt = (/* @__PURE__ */ new Date()).toISOString();
	return rehearsal;
}
function rehearsalSummary(r) {
	const passed = r.steps.filter((s) => s.status === "passed").length;
	const failed = r.steps.filter((s) => s.status === "failed").length;
	return `${passed}/${r.steps.length} steps passed, ${failed} failed. Overall: ${r.overall}.`;
}
function Rehearsal() {
	const [rehearsal, setRehearsal] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)(null);
	function onRun() {
		const r = runWipeRehearsal(createWipeRehearsal());
		setRehearsal(r);
		setMessage(rehearsalSummary(r));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "rehearsal-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Wipe rehearsal"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "rehearsal-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Season wipe rehearsal (fixture)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm text-vanta-muted",
				children: "Runs the full wipe sequence in fixture mode. No live server is touched."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onRun,
				className: "mt-4 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
				children: "Run rehearsal"
			}),
			rehearsal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-2 text-sm",
				children: rehearsal.steps.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md border border-vanta-ash p-2",
					children: [
						s.label,
						" - ",
						s.status
					]
				}, s.id))
			}) : null,
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-4 text-sm text-vanta-ash",
				children: message
			}) : null
		]
	}) });
}
var SplitComponent = Rehearsal;
export { SplitComponent as component };
