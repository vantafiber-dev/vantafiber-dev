import { o as __toESM } from "../_runtime.mjs";
import { t as createSsrRpc } from "./createSsrRpc-ccwnlbeC.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _n as number, un as _enum, vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/members-ClTq04oz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createTribeInput = object({
	name: string().min(1),
	region: string().min(1),
	motto: string().min(1)
});
var joinInput = object({
	memberId: string().min(1),
	tribeId: string().min(1)
});
var leaveInput = object({ memberId: string().min(1) });
var roleInput = object({
	memberId: string().min(1),
	role: _enum([
		"member",
		"officer",
		"leader"
	])
});
var repInput = object({
	memberId: string().min(1),
	delta: number()
});
var listTribesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("37e98525797633ad1ed56752423502b87e9b7f0171f7863533b88a135bde7d62"));
var ensureMemberFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("f8a295320643ef3a1023e11abd262b5e1fa1b7c69665c941e77322fcf7a9d6b1"));
var listMembersFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("905fe6d45451e4d953b7cae908faf5c3ff10afc1dd25e0f35442b7c408b7c38f"));
var createTribeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(createTribeInput).handler(createSsrRpc("3c179d1bee23ef746e7216b658376c29dcede5a03fa27e0b7e71c19716e1b31c"));
var joinTribeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(joinInput).handler(createSsrRpc("7c045773bb5e67433fb52796c638893612763afd18f1cf34e731a5595dd28e7b"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(leaveInput).handler(createSsrRpc("5fafbaa4b98d0e9431a9e425ea8460aa0f2af29ffdebbccf62489bf6cbdd04d9"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(roleInput).handler(createSsrRpc("3f3cb3ba1f2144a64c1de85917e8b03cb4d789e2dcec1e485785b553e2007898"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(repInput).handler(createSsrRpc("e7d2e8a0f223cbeeb5f311a5edfc0d098406c3ffcef1b0964606b1c60b367aaf"));
function Members() {
	const [tribes, setTribes] = (0, import_react.useState)([]);
	const [members, setMembers] = (0, import_react.useState)([]);
	const [tribeName, setTribeName] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function refresh() {
		try {
			await ensureMemberFn();
			const [t, m] = await Promise.all([listTribesFn(), listMembersFn()]);
			setTribes(t);
			setMembers(m);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	async function onCreateTribe() {
		setError(null);
		if (!tribeName.trim()) {
			setError("Tribe name required.");
			return;
		}
		try {
			await createTribeFn({ data: {
				name: tribeName.trim(),
				region: "Australia (AU)",
				motto: "Hold the line"
			} });
			setTribeName("");
			setMessage("Tribe created.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	async function onJoin(tribeId) {
		const memberId = members[0]?.id;
		if (!memberId) return;
		try {
			await joinTribeFn({ data: {
				memberId,
				tribeId
			} });
			setMessage("Joined.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "members-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Members"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "members-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Tribes and member profiles"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: tribeName,
					onChange: (e) => setTribeName(e.target.value),
					placeholder: "New tribe name",
					className: "flex-1 rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onCreateTribe,
					className: "inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
					children: "Create"
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "panel p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold",
						children: "Tribes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 space-y-2 text-sm",
						children: [tribes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-vanta-muted",
							children: "No tribes yet."
						}) : null, tribes.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md border border-vanta-ash p-2 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								t.name,
								" - ",
								t.region
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onJoin(t.id),
								className: "rounded-md border border-vanta-ash px-3 py-1",
								children: "Join"
							})]
						}, t.id))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "panel p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold",
						children: "Members"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2 text-sm",
						children: members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md border border-vanta-ash p-2",
							children: [
								m.handle,
								" - ",
								m.role,
								" - rep ",
								m.reputation,
								" ",
								m.tribe_id ? "(in tribe)" : ""
							]
						}, m.id))
					})]
				})]
			})
		]
	}) });
}
var SplitComponent = Members;
export { SplitComponent as component };
