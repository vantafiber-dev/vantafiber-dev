import { n as VANTA, t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CalendarClock, i as ScrollText, r as ShieldCheck, t as Users } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/routes-C0s8U8KQ.js
var import_jsx_runtime = require_jsx_runtime();
var DIFFERENTIATORS = [
	{
		id: "raid-clock",
		icon: CalendarClock,
		title: "Raid Clock",
		body: "One player-local timeline for season start, raid windows where enforceable, maintenance and wipes."
	},
	{
		id: "tribe-grid",
		icon: Users,
		title: "Tribe Starting Grid",
		body: "Opt-in, size- and time-window-matched listings with moderated recruitment and a first-session checklist."
	},
	{
		id: "rule-lab",
		icon: ScrollText,
		title: "Rule Lab",
		body: "Versioned proposals show expected effects on build time, raid cost, defence and console performance."
	},
	{
		id: "season-passport",
		icon: ShieldCheck,
		title: "Season Passport",
		body: "Carry over achievements, event results and public recognition by choice, with advantage resetting per wipe rules."
	}
];
var JOIN_STEPS = [
	{
		id: "step-1",
		title: "Choose platform and region",
		body: "Tell us you are on Xbox or the Windows Microsoft Store client and pick your region."
	},
	{
		id: "step-2",
		title: "Join the waitlist",
		body: "Opt in with consent. You get the Season Zero briefing, raid calendar and event invites."
	},
	{
		id: "step-3",
		title: "Get invited into a tribe listing",
		body: "Matched through the member or Discord workflow with a first-session checklist."
	}
];
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteChrome, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-labelledby": "hero-title",
			className: "py-14 md:py-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Xbox - Microsoft Store - ARK: Survival Evolved"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "hero-title",
					className: "mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl",
					children: "Build fast. Fight fair."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 max-w-2xl text-base text-vanta-muted md:text-lg",
					children: [VANTA.tagline, " The free-first fibercraft PvP community for Xbox consoles and the compatible Windows Microsoft Store client. Season Zero builds the community, the rules and the readiness proof before the first public server goes live."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/join",
						className: "inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
						children: "Join the waitlist"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/join",
						className: "inline-flex min-h-12 items-center rounded-md border border-line px-5 text-vanta-ash",
						children: "How to join"
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			"aria-labelledby": "status-title",
			className: "pb-14",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-3",
				children: [
					{
						label: "Season",
						value: VANTA.seasonName,
						note: "Prelaunch community build"
					},
					{
						label: "Server",
						value: "Awaiting host capacity",
						note: "Readiness board engaged"
					},
					{
						label: "Platform",
						value: "Xbox + Windows Store",
						note: "ASE PvP target"
					}
				].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker",
							children: c.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-lg font-semibold",
							children: c.value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-vanta-muted",
							children: c.note
						})
					]
				}, c.label))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-labelledby": "diff-title",
			className: "pb-14",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "diff-title",
				className: "text-2xl font-semibold tracking-tight md:text-3xl",
				children: "Why players switch to Vanta Fiber"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-2",
				children: DIFFERENTIATORS.map((d) => {
					const Icon = d.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "panel p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-6 text-vanta-ember",
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 text-lg font-semibold",
								children: d.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-vanta-muted",
								children: d.body
							})
						]
					}, d.id);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-labelledby": "join-title",
			className: "pb-14",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "join-title",
				className: "text-2xl font-semibold tracking-tight md:text-3xl",
				children: "Join in three steps"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-6 grid gap-3",
				children: JOIN_STEPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "panel flex gap-4 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "num text-2xl font-semibold text-vanta-ember",
						children: s.id.replace("step-", "0")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold",
						children: s.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-vanta-muted",
						children: s.body
					})] })]
				}, s.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			"aria-labelledby": "ready-title",
			className: "pb-14",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "ready-title",
						className: "text-2xl font-semibold tracking-tight md:text-3xl",
						children: "Season Zero readiness board"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-3xl text-sm text-vanta-muted md:text-base",
						children: "The launch gate is evidence, not optimism. Public readiness stages, funding verification, hosting readiness, staff coverage and player demand all have to clear their own bars before a launch date is announced."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/status",
						className: "mt-6 inline-flex min-h-12 items-center rounded-md border border-line px-5 text-vanta-ash",
						children: "View status and readiness"
					})
				]
			})
		})
	] });
}
var SplitComponent = Home;
export { SplitComponent as component };
