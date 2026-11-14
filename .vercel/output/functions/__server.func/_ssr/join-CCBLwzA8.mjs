import { o as __toESM } from "../_runtime.mjs";
import { n as VANTA, t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { t as createSsrRpc } from "./createSsrRpc-ccwnlbeC.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { pn as boolean, vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/join-CCBLwzA8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var joinInput = object({
	email: string().email(),
	platform: string().min(1),
	region: string().min(1),
	consent: boolean()
});
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b21bcc7f39287cdcd5a469e9a38c3dc2d5b9054f85276cba21035b26e36b597d"));
var joinWaitlistFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(joinInput).handler(createSsrRpc("61365f27903624679095204a5beb5d4127119374b45d1664c6be5e09983aa0b6"));
function Join() {
	const [platform, setPlatform] = (0, import_react.useState)("xbox");
	const [region, setRegion] = (0, import_react.useState)(VANTA.regions[0]?.id ?? "");
	const [email, setEmail] = (0, import_react.useState)("");
	const [agreedToRules, setAgreedToRules] = (0, import_react.useState)(false);
	const [optedInUpdates, setOptedInUpdates] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [ok, setOk] = (0, import_react.useState)(false);
	async function onSubmit(event) {
		event.preventDefault();
		setError(null);
		setOk(false);
		if (!agreedToRules) {
			setError("You must agree to the community rules.");
			return;
		}
		try {
			await joinWaitlistFn({ data: {
				email,
				platform,
				region,
				consent: agreedToRules
			} });
			setOk(true);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Join failed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteChrome, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "join-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Join Compass - Season Zero"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "join-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Get your seat in the first fight"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-base text-vanta-muted md:text-lg",
				children: "Tell us your platform and region, opt in to the waitlist, and you will receive the Season Zero briefing, raid calendar and event invites before launch. Zero account required for the prelaunch waitlist."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-8 grid gap-3 md:grid-cols-3",
				children: [
					{
						id: "step-1",
						title: "Choose platform and region",
						body: "Xbox console or Windows Microsoft Store client."
					},
					{
						id: "step-2",
						title: "Join the waitlist",
						body: "Double opt-in consent captured locally."
					},
					{
						id: "step-3",
						title: "Get invited into a tribe listing",
						body: "Matched via the member or Discord workflow."
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num text-2xl font-semibold text-vanta-ember",
							children: s.id.replace("step-", "0")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 text-lg font-semibold",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-vanta-muted",
							children: s.body
						})
					]
				}, s.id))
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		"aria-labelledby": "waitlist-title",
		className: "pb-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "waitlist-title",
					className: "text-2xl font-semibold tracking-tight md:text-3xl",
					children: "Season Zero waitlist"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-sm text-vanta-muted md:text-base",
					children: "Entries are now stored in the application database. Live email delivery is owner-gated."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-6 grid gap-4",
					onSubmit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "kicker",
								htmlFor: "vf-email",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "vf-email",
								name: "email",
								type: "email",
								autoComplete: "email",
								required: true,
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: "min-h-12 rounded-md border border-line bg-surface px-3 text-vanta-ash"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "kicker",
								children: "Platform"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-3",
								children: [{
									id: "xbox",
									label: VANTA.platform.xbox.label
								}, {
									id: "windows-store",
									label: VANTA.platform.windowsStore.label
								}].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 rounded-md border border-line px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										name: "vf-platform",
										value: p.id,
										checked: platform === p.id,
										onChange: () => setPlatform(p.id)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: p.label
									})]
								}, p.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "kicker",
								htmlFor: "vf-region",
								children: "Region"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: "vf-region",
								name: "region",
								value: region,
								onChange: (e) => setRegion(e.target.value),
								className: "min-h-12 rounded-md border border-line bg-surface px-3 text-vanta-ash",
								children: VANTA.regions.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: r.id,
									children: r.label
								}, r.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-start gap-2 text-sm text-vanta-ash",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: agreedToRules,
									onChange: (e) => setAgreedToRules(e.target.checked),
									className: "mt-1"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I agree to the community rules and community waitlist terms. I understand this is not a purchase and does not reserve in-game advantage." })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-start gap-2 text-sm text-vanta-ash",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: optedInUpdates,
									onChange: (e) => setOptedInUpdates(e.target.checked),
									className: "mt-1"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Send me launch and event updates (optional, can be withdrawn)." })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "inline-flex min-h-12 items-center justify-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
							children: "Join the waitlist"
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "text-sm text-danger",
							children: error
						}) : null,
						ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "status",
							className: "text-sm text-vanta-ash",
							children: "You are on the Season Zero waitlist. Watch your inbox for the briefing."
						}) : null
					]
				})
			]
		})
	})] });
}
var SplitComponent = Join;
export { SplitComponent as component };
