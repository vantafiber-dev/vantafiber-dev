import { o as __toESM } from "../_runtime.mjs";
import { t as createSsrRpc } from "./createSsrRpc-ccwnlbeC.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _n as number, vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/commerce-BzhFj2cp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var pledgeInput = object({
	tierId: string().min(1),
	amountUsd: number().positive()
});
var realmInput = object({
	tribeName: string().min(1),
	region: string().min(1)
});
var listPledgesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3a6a3d766c6dd8eec131cc9b0f2f13b83d54983f4053fedac0dbd1ae80a18108"));
var pledgeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(pledgeInput).handler(createSsrRpc("791d14eea426903fadaebd257b4a188ea8a9abdc55ac2340becc50a85b61f027"));
var listRealmRequestsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0e1e4db434a22dd5b3f6f966e3d114d1ebfefb28c1988de8d9a3c83913f9e8ac"));
var requestRealmFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(realmInput).handler(createSsrRpc("07a56302aee8ee7c04dc3874a4e48c5e9c2989cc995f3c4f59d94b4d74c0dca6"));
var TIERS = [
	{
		id: "supporter",
		name: "Supporter",
		amountUsd: 5,
		perks: ["Discord role", "Name in credits"]
	},
	{
		id: "founder",
		name: "Founder",
		amountUsd: 25,
		perks: [
			"Supporter perks",
			"Founder badge",
			"Early access"
		]
	},
	{
		id: "patron",
		name: "Patron",
		amountUsd: 100,
		perks: [
			"Founder perks",
			"Private realm invite",
			"Creator shoutout"
		]
	}
];
function Commerce() {
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [pledges, setPledges] = (0, import_react.useState)([]);
	const [realms, setRealms] = (0, import_react.useState)([]);
	async function refresh() {
		try {
			const [p, r] = await Promise.all([listPledgesFn(), listRealmRequestsFn()]);
			setPledges(p);
			setRealms(r);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	async function onPledge(tierId, amountUsd) {
		setError(null);
		try {
			await pledgeFn({ data: {
				tierId,
				amountUsd
			} });
			setMessage(`Pledged ${amountUsd} USD.`);
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	async function onRequestRealm() {
		try {
			await requestRealmFn({ data: {
				tribeName: "Tribe One",
				region: "Australia (AU)"
			} });
			setMessage("Realm request submitted.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "commerce-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Commerce"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "commerce-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Fundraising and private realms"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm text-vanta-muted",
				children: "Payment processing is owner-gated. Pledges are recorded in the database."
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
				className: "mt-8 grid gap-4 md:grid-cols-3",
				children: TIERS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold",
							children: t.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-2xl font-semibold",
							children: [t.amountUsd, " USD"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1 text-sm text-vanta-muted",
							children: t.perks.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["- ", p] }, p))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onPledge(t.id, t.amountUsd),
							className: "mt-4 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
							children: "Pledge"
						})
					]
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onRequestRealm,
					className: "inline-flex min-h-12 items-center rounded-md border border-vanta-ash px-5 font-medium",
					children: "Request a private realm"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 text-xs text-vanta-muted",
				children: [
					"Pledges: ",
					pledges.length,
					" | Realm requests: ",
					realms.length
				]
			})
		]
	}) });
}
var SplitComponent = Commerce;
export { SplitComponent as component };
