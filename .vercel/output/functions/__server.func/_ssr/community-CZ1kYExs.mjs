import { o as __toESM } from "../_runtime.mjs";
import { t as createSsrRpc } from "./createSsrRpc-ccwnlbeC.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/community-CZ1kYExs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lfgInput = object({
	region: string().min(1),
	mode: string().min(1),
	title: string().min(1),
	note: string().min(1)
});
var ticketInput = object({
	category: string().min(1),
	subject: string().min(1),
	body: string().min(1)
});
var idInput = object({ id: string().min(1) });
var listLfgFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("cb3387baa86a84cf12c1d4ec3d04e898afb3c13d6be3a86af5ab118270803f18"));
var createLfgFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(lfgInput).handler(createSsrRpc("32ee273f4797324763d25ac978942e72db12ebc02bd32b0fdf6dccf997716386"));
var closeLfgFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(idInput).handler(createSsrRpc("496372f9e35c21cacabaf4d56ddd2040ef7b946483cc472406803fc32d37943c"));
var listTicketsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("241bdab38cf064d9b8d59f91abe25dad97a60cb45a24892d187ea920f7265505"));
var createTicketFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(ticketInput).handler(createSsrRpc("e999b495cd926bbf8aea30ae07e4e39d71e68e5f65b79287044ac29b1f9b2a81"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(idInput).handler(createSsrRpc("cb588b8e445d66a526e2b17351f3e33a61b649e3e47292d5a0bd4817d0b3c5ac"));
function Community() {
	const [lfgs, setLfgs] = (0, import_react.useState)([]);
	const [tickets, setTickets] = (0, import_react.useState)([]);
	const [lfgTitle, setLfgTitle] = (0, import_react.useState)("");
	const [ticketSubject, setTicketSubject] = (0, import_react.useState)("");
	const [ticketBody, setTicketBody] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function refresh() {
		try {
			const [l, t] = await Promise.all([listLfgFn(), listTicketsFn()]);
			setLfgs(l);
			setTickets(t);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	async function onCreatePost() {
		setError(null);
		if (!lfgTitle.trim()) {
			setError("Title required.");
			return;
		}
		try {
			await createLfgFn({ data: {
				region: "Australia (AU)",
				mode: "pvp",
				title: lfgTitle.trim(),
				note: "fixture"
			} });
			setLfgTitle("");
			setMessage("Post created.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	async function onClose(id) {
		try {
			await closeLfgFn({ data: { id } });
			setMessage("Closed.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	async function onCreateTicket() {
		setError(null);
		if (!ticketSubject.trim() || !ticketBody.trim()) {
			setError("Subject and body required.");
			return;
		}
		try {
			await createTicketFn({ data: {
				category: "support",
				subject: ticketSubject.trim(),
				body: ticketBody.trim()
			} });
			setTicketSubject("");
			setTicketBody("");
			setMessage("Ticket created.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "community-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Community"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "community-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "LFG board and support tickets"
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
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold",
							children: "New LFG post"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: lfgTitle,
							onChange: (e) => setLfgTitle(e.target.value),
							placeholder: "Title",
							className: "mt-3 w-full rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onCreatePost,
							className: "mt-3 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
							children: "Post"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2 text-sm",
							children: lfgs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md border border-vanta-ash p-2 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									p.title,
									" - ",
									p.status,
									" (",
									p.region,
									")"
								] }), p.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onClose(p.id),
									className: "rounded-md border border-vanta-ash px-3 py-1",
									children: "Close"
								}) : null]
							}, p.id))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold",
							children: "New support ticket"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: ticketSubject,
							onChange: (e) => setTicketSubject(e.target.value),
							placeholder: "Subject",
							className: "mt-3 w-full rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: ticketBody,
							onChange: (e) => setTicketBody(e.target.value),
							placeholder: "Body",
							rows: 3,
							className: "mt-2 w-full rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onCreateTicket,
							className: "mt-3 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
							children: "Submit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2 text-sm",
							children: tickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md border border-vanta-ash p-2",
								children: [
									t.subject,
									" - ",
									t.status
								]
							}, t.id))
						})
					]
				})]
			})
		]
	}) });
}
var SplitComponent = Community;
export { SplitComponent as component };
