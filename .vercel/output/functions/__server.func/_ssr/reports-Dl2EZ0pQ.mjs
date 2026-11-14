import { o as __toESM } from "../_runtime.mjs";
import { t as createSsrRpc } from "./createSsrRpc-ccwnlbeC.mjs";
import { i as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CgpHtsdn.mjs";
import { t as SiteChrome } from "./SiteChrome-qLpmiBH2.mjs";
import { Ht as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { vn as object, xn as string } from "../_libs/@better-auth/core+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/reports-Dl2EZ0pQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createInput = object({
	subject: string().min(1),
	body: string().min(1),
	category: string().min(1).default("report")
});
var idInput = object({ id: string().min(1) });
var evidenceInput = object({
	id: string().min(1),
	note: string().min(1)
});
var resolveInput = object({
	id: string().min(1),
	resolution: string().min(1)
});
var appealInput = object({
	id: string().min(1),
	reason: string().min(1)
});
var listReportsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d032434aca624783ed2b8a6f3fc8de75a81e18484816b9e24403f2822325ed59"));
var createReportFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(createInput).handler(createSsrRpc("fe9d76d660a99cba6483438f1f072f876bba3862cc4c8d0d186969cc60cf25a7"));
var claimReportFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(idInput).handler(createSsrRpc("6ac9d19ae92882bd9cc36ceac0ad5a4ce1a1437ebd181bb968e057c206295377"));
var addEvidenceFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(evidenceInput).handler(createSsrRpc("d42792630a2427eb51699f838544082005abf560b4fdc5f8d71ae488739d96fe"));
var resolveReportFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(resolveInput).handler(createSsrRpc("bbf207b5b3d68e1e705cece6b8e22af0090dd780cd647ffb8da221e8328ac7ae"));
var appealReportFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(appealInput).handler(createSsrRpc("a2d45abd672173ae5e0cfeb2bf190a0e5e267a9f26e27f7e25fb0041f083682e"));
function Reports() {
	const [reports, setReports] = (0, import_react.useState)([]);
	const [subject, setSubject] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function refresh() {
		try {
			const rows = await listReportsFn();
			setReports(rows);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load reports.");
		}
	}
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	async function onCreate() {
		setError(null);
		if (!subject.trim() || !body.trim()) {
			setError("Subject and body required.");
			return;
		}
		try {
			await createReportFn({ data: {
				subject: subject.trim(),
				body: body.trim(),
				category: "report"
			} });
			setSubject("");
			setBody("");
			setMessage("Report submitted.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Submission failed.");
			setMessage(null);
		}
	}
	async function onClaim(id) {
		try {
			await claimReportFn({ data: { id } });
			setMessage("Claimed.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Claim failed.");
		}
	}
	async function onEvidence(id) {
		const note = prompt("Evidence note:");
		if (!note) return;
		try {
			await addEvidenceFn({ data: {
				id,
				note
			} });
			setMessage("Evidence added.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Evidence failed.");
		}
	}
	async function onResolve(id) {
		const resolution = prompt("Resolution:");
		if (!resolution) return;
		try {
			await resolveReportFn({ data: {
				id,
				resolution
			} });
			setMessage("Resolved.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Resolve failed.");
		}
	}
	async function onAppeal(id) {
		const reason = prompt("Appeal reason:");
		if (!reason) return;
		try {
			await appealReportFn({ data: {
				id,
				reason
			} });
			setMessage("Appeal submitted.");
			await refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Appeal failed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteChrome, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "reports-title",
		className: "py-14 md:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Reports"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "reports-title",
				className: "mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl",
				children: "Report to resolution"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: subject,
						onChange: (e) => setSubject(e.target.value),
						placeholder: "Subject",
						className: "rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: body,
						onChange: (e) => setBody(e.target.value),
						placeholder: "Body",
						rows: 3,
						className: "rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onCreate,
						className: "inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt",
						children: "Submit report"
					})
				]
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-2 text-sm",
				children: reports.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md border border-vanta-ash p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: c.subject
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "kicker",
								children: c.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-vanta-muted",
							children: c.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: [
								c.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onClaim(c.id),
									className: "rounded-md border border-vanta-ash px-3 py-1",
									children: "Claim"
								}) : null,
								c.status === "claimed" || c.status === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onEvidence(c.id),
									className: "rounded-md border border-vanta-ash px-3 py-1",
									children: "Add evidence"
								}) : null,
								c.status === "claimed" || c.status === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onResolve(c.id),
									className: "rounded-md border border-vanta-ash px-3 py-1",
									children: "Resolve"
								}) : null,
								c.status === "resolved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onAppeal(c.id),
									className: "rounded-md border border-vanta-ash px-3 py-1",
									children: "Appeal"
								}) : null
							]
						}),
						c.resolution ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-vanta-muted",
							children: ["Resolution: ", c.resolution]
						}) : null,
						c.appeal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-vanta-muted",
							children: ["Appeal: ", c.appeal]
						}) : null
					]
				}, c.id))
			})
		]
	}) });
}
var SplitComponent = Reports;
export { SplitComponent as component };
