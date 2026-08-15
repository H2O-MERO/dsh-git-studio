window.__ModuleLoader__.load({
	id: "dsh-git-graph",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");

		//#region styles
		const css = [
			/* frame shared by the conversation view */
			".gg-frame{flex:1;width:100%;border:0;display:block;background:#0d1117;min-height:0}",
			/* conversation view (tab next to 轨迹) */
			".gg-view{height:100%;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base, #0d1117)}",
			".gg-view .gg-frame{flex:1}",
			/* ===== workdir module: docked right side of the conversation page ===== */
			".gg-wd-panel{position:absolute;top:0;bottom:0;pointer-events:auto;display:flex;flex-direction:column;",
			"background:var(--dsw-alias-bg-module-platform, #12171f);border-left:1px solid var(--dsw-alias-border-l2, #2a3542);",
			"box-shadow:var(--dsw-shadow-lv2, 0 8px 30px rgba(0,0,0,.4));",
			"font:12px/1.5 -apple-system, \"Segoe UI\", \"Microsoft YaHei\", sans-serif;color:var(--dsw-alias-label-primary, #e8edf2)}",
			".gg-wd-head{display:flex;align-items:center;gap:8px;padding:8px 10px;flex:none;user-select:none;",
			"border-bottom:1px solid var(--dsw-alias-border-l2, #2a3542);background:var(--dsw-alias-bg-layer-2, #1a212b);position:relative}",
			".gg-wd-title{font-weight:700;font-size:12.5px;color:var(--dsw-alias-label-primary, #e8edf2);white-space:nowrap}",
			".gg-wd-counts{font-size:11px;color:var(--dsw-alias-label-secondary, #9aa7b4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".gg-wd-sp{flex:1;min-width:4px}",
			".gg-wd-btn{border:1px solid var(--dsw-alias-border-l2, #2a3542);background:var(--dsw-alias-bg-layer-1, #12171f);",
			"color:var(--dsw-alias-label-primary, #e8edf2);border-radius:6px;height:24px;min-width:24px;padding:0 8px;cursor:pointer;font-size:12px}",
			".gg-wd-btn:hover{border-color:var(--dsw-alias-label-tertiary, #6d7a88);background:var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.05))}",
			".gg-wd-menuwrap{position:relative}",
			".gg-wd-menu{display:none;position:absolute;top:30px;right:0;z-index:40;min-width:150px;background:var(--dsw-specific-menu, var(--dsw-alias-bg-layer-2, #1a212b));",
			"border:1px solid var(--dsw-alias-border-l2, #2a3542);border-radius:8px;padding:5px;box-shadow:var(--dsw-shadow-lv3, 0 10px 34px rgba(0,0,0,.45))}",
			".gg-wd-menu.show{display:block}",
			".gg-wd-menu label{display:flex;align-items:center;gap:7px;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:12px;white-space:nowrap}",
			".gg-wd-menu label:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.05))}",
			".gg-wd-menu input{accent-color:var(--dsw-alias-state-business-primary, #58a6ff);cursor:pointer}",
			".gg-wd-body{flex:1;overflow:auto;padding:6px 0 12px}",
			".gg-wd-body::-webkit-scrollbar{width:10px}",
			".gg-wd-body::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2, #2a3542);border-radius:6px;border:2px solid transparent;background-clip:content-box}",
			".gg-wd-clean{padding:8px 12px;font-size:12px;color:var(--dsw-alias-state-success-primary, #3fb950)}",
			".gg-wd-err{padding:8px 12px;font-size:12px;color:var(--dsw-alias-state-error-primary, #f85149);white-space:pre-wrap;word-break:break-word}",
			".gg-wd-empty{padding:8px 12px;font-size:12px;color:var(--dsw-alias-label-tertiary, #6d7a88)}",
			".gg-wd-group-head{display:flex;align-items:center;gap:8px;padding:8px 12px 3px;font-size:11px;font-weight:700;",
			"color:var(--dsw-alias-label-secondary, #9aa7b4);text-transform:uppercase;letter-spacing:.3px;cursor:pointer;user-select:none}",
			".gg-wd-group-head:hover{color:var(--dsw-alias-label-primary, #e8edf2)}",
			".gg-wd-caret{font-size:9px;transition:transform .15s ease;color:var(--dsw-alias-label-tertiary, #6d7a88)}",
			".gg-wd-group.open .gg-wd-caret{transform:rotate(90deg)}",
			".gg-wd-file{display:flex;align-items:center;gap:8px;padding:3px 12px 3px 18px;cursor:pointer;border-radius:6px}",
			".gg-wd-file:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.05))}",
			".gg-wd-file.open{background:var(--dsw-alias-bg-layer-2, #1a212b)}",
			".gg-wd-badge{flex:none;width:18px;height:18px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;",
			"font-size:10px;font-weight:800;font-family:var(--dsw-font-mono, Consolas, monospace)}",
			".gg-wd-badge.A{background:rgba(63,185,80,.18);color:var(--dsw-alias-state-success-primary, #3fb950)}",
			".gg-wd-badge.M{background:rgba(240,136,62,.16);color:var(--dsw-alias-state-warn-primary, #f0883e)}",
			".gg-wd-badge.D{background:rgba(248,81,73,.16);color:var(--dsw-alias-state-error-primary, #f85149)}",
			".gg-wd-badge.R{background:rgba(188,140,255,.16);color:#bc8cff}",
			".gg-wd-badge.U{background:rgba(210,153,34,.16);color:var(--dsw-alias-state-warn-primary, #d29922)}",
			".gg-wd-badge.q{background:rgba(154,167,180,.16);color:var(--dsw-alias-label-secondary, #9aa7b4)}",
			".gg-wd-path{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--dsw-font-mono, Consolas, monospace);",
			"font-size:12px;color:var(--dsw-alias-label-primary, #e8edf2)}",
			".gg-wd-old{color:var(--dsw-alias-label-tertiary, #6d7a88);text-decoration:line-through}",
			".gg-wd-num{flex:none;font-size:11px;font-family:var(--dsw-font-mono, Consolas, monospace);color:var(--dsw-alias-label-secondary, #9aa7b4)}",
			".gg-wd-num .add{color:var(--dsw-alias-state-success-primary, #3fb950)}",
			".gg-wd-num .del{color:var(--dsw-alias-state-error-primary, #f85149)}",
			".gg-wd-diff{margin:6px 10px 4px 44px;border:1px solid var(--dsw-alias-border-l2, #2a3542);border-radius:8px;overflow:hidden;background:var(--dsw-alias-bg-base, #0d1117)}",
			".gg-wd-diff pre{margin:0;padding:10px 12px;overflow:auto;font:11.5px/1.6 var(--dsw-font-mono, Consolas, monospace);",
			"color:var(--dsw-alias-label-primary, #e8edf2);white-space:pre;max-height:420px}",
			/* left-edge resize handle */
			".gg-wd-handle{position:absolute;top:0;bottom:0;left:-3px;width:7px;cursor:col-resize;z-index:2}",
			".gg-wd-handle:hover{background:var(--dsw-alias-state-business-primary, rgba(88,166,255,.5))}",
			/* collapsed rail (no content rendered / no data loaded while folded) */
			".gg-wd-rail{position:absolute;pointer-events:auto;width:26px;padding:10px 0;border:1px solid var(--dsw-alias-border-l2, #2a3542);border-right:0;",
			"border-radius:8px 0 0 8px;background:var(--dsw-alias-bg-module-platform, #12171f);color:var(--dsw-alias-label-secondary, #9aa7b4);",
			"box-shadow:var(--dsw-shadow-lv2, 0 8px 30px rgba(0,0,0,.4));cursor:pointer;user-select:none;",
			"display:flex;align-items:center;justify-content:center}",
			".gg-wd-rail:hover{color:var(--dsw-alias-label-primary, #e8edf2)}",
			".gg-wd-rail span{writing-mode:vertical-rl;font-size:11px;letter-spacing:2px;white-space:nowrap}"
		].join("");
		const tagId = "dsh-git-graph/style";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-git-graph";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion

		const graphSrc = (sid) => "/git-graph/index.html" + (sid ? "?sid=" + encodeURIComponent(sid) : "");

		/** Conversation view tab: the graph embedded in the session pane (next to 轨迹). */
		function GitGraphView(props) {
			const sid = props.sessionId || "";
			return react_jsx_runtime.jsx("div", {
				className: "gg-view",
				children: react_jsx_runtime.jsx("iframe", {
					className: "gg-frame",
					src: graphSrc(sid),
					title: "Git 图谱"
				})
			});
		}

		/* ===================== workdir module (right side of the conversation page) ===================== */

		const WD_MIN = 240, WD_MAX = 560, WD_DEFAULT = 360;
		const clampWidth = (px) => Math.min(WD_MAX, Math.max(WD_MIN, Math.round(px)));

		function prefGet(key, fallback) {
			try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch { return fallback; }
		}
		function prefSet(key, value) {
			try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
		}

		async function api(op, extra = {}) {
			const p = new URLSearchParams({ op, ...extra });
			const res = await fetch("/git-graph/api?" + p.toString());
			return res.json();
		}

		/** One file row: badge, path, +/- counts; click expands the on-demand diff (cached). */
		function WorkdirFile(props) {
			const item = props.item;
			const staged = props.staged;
			const repo = props.repo;
			const cache = props.cache;
			const key = staged + "\u0000" + item.path;
			const [open, setOpen] = react.useState(false);
			const [text, setText] = react.useState(null);

			react.useEffect(() => {
				if (!open) return;
				const cached = cache.current.get(key);
				if (cached) { setText(cached); return; }
				let dead = false;
				(async () => {
					try {
						const res = await api("workfile", {
							repo,
							file: item.path,
							staged,
							...(item.oldPath ? { old: item.oldPath } : {})
						});
						let t;
						if (!res.ok) {
							t = "加载失败: " + (res.error || "?");
						} else if (res.isDir) {
							t = "（未跟踪目录）";
						} else if (res.binary) {
							t = "（二进制文件，不显示内容）";
						} else if (res.content !== undefined) {
							t = res.content.trim() ? res.content : "（空文件）";
							if (res.truncated) t = "（内容过长已截断）\n" + t;
						} else {
							t = res.diff || "（无差异）";
							if (res.truncated) t = "（diff 过长已截断）\n" + t;
						}
						cache.current.set(key, t);
						if (!dead) setText(t);
					} catch (err) {
						if (!dead) setText("加载失败: " + (err && err.message ? err.message : String(err)));
					}
				})();
				return () => { dead = true; };
			}, [open, key, repo, cache]);

			const row = react_jsx_runtime.jsxs("div", {
				className: "gg-wd-file" + (open ? " open" : ""),
				onClick: () => setOpen((o) => !o),
				children: [
					react_jsx_runtime.jsx("span", { className: "gg-wd-badge " + (item.code === "?" ? "q" : item.code), children: item.code === "?" ? "?" : item.code }),
					react_jsx_runtime.jsx("span", {
						className: "gg-wd-path",
						title: (item.oldPath ? item.oldPath + " → " : "") + item.path,
						children: item.oldPath
							? react_jsx_runtime.jsxs(react_jsx_runtime.Fragment, { children: [item.path, react_jsx_runtime.jsx("span", { className: "gg-wd-old", children: "  ← " + item.oldPath })] })
							: item.path
					}),
					item.code !== "?" && item.binary
						? react_jsx_runtime.jsx("span", { className: "gg-wd-num", children: "二进制" })
						: item.code !== "?"
							? react_jsx_runtime.jsxs("span", { className: "gg-wd-num", children: [react_jsx_runtime.jsx("span", { className: "add", children: "+" + (item.added ?? 0) }), "  ", react_jsx_runtime.jsx("span", { className: "del", children: "−" + (item.deleted ?? 0) })] })
							: null
				]
			});
			if (!open) return row;
			return react_jsx_runtime.jsxs(react_jsx_runtime.Fragment, { children: [
				row,
				react_jsx_runtime.jsx("div", { className: "gg-wd-diff", children: react_jsx_runtime.jsx("pre", { children: text === null ? "加载中…" : text }) })
			] });
		}

		/**
		 * Panel content. Mounted only while the module is unfolded, so a folded
		 * module renders nothing and issues no requests (performance requirement).
		 * Reloads whenever the current session's workspace (cwd) changes.
		 */
		function WorkdirContent(props) {
			const cwd = props.cwd;
			const onFold = props.onFold;
			const [repo, setRepo] = react.useState(null);
			const [isGit, setIsGit] = react.useState(true);
			const [data, setData] = react.useState(null);      // workstatus payload
			const [error, setError] = react.useState(null);
			const [loading, setLoading] = react.useState(false);
			const [show, setShow] = react.useState({ staged: true, unstaged: true, untracked: true });
			const [groupFolded, setGroupFolded] = react.useState(() => new Set());
			const [menuOpen, setMenuOpen] = react.useState(false);
			const diffCache = react.useRef(new Map());
			const loadSeq = react.useRef(0);

			const load = react.useCallback(async () => {
				const seq = ++loadSeq.current;
				setLoading(true);
				setError(null);
				try {
					const repos = await api("repos", cwd ? { ws: cwd } : {});
					if (seq !== loadSeq.current) return;
					if (!repos.ok || !repos.repos.length) {
						setError("未配置仓库：请在 cordis.patch.yml 的 git-graph config.repo 中填写仓库路径");
						return;
					}
					const r = repos.wsRoot || repos.current || repos.repos[0];
					setRepo(r);
					if (cwd && !repos.wsIsGit) {
						setIsGit(false);
						return;
					}
					setIsGit(true);
					const st = await api("workstatus", { repo: r });
					if (seq !== loadSeq.current) return;
					if (!st.ok) { setError(st.error || "加载失败"); return; }
					setData(st);
				} catch (err) {
					if (seq !== loadSeq.current) return;
					setError(err && err.message ? err.message : String(err));
				} finally {
					if (seq === loadSeq.current) setLoading(false);
				}
			}, [cwd]);

			react.useEffect(() => {
				setData(null);
				setIsGit(true);
				load();
			}, [load]);

			// close the ☑ 分组 menu on outside mousedown
			react.useEffect(() => {
				if (!menuOpen) return;
				const close = (ev) => { if (!ev.target.closest(".gg-wd-menuwrap")) setMenuOpen(false); };
				window.addEventListener("mousedown", close);
				return () => window.removeEventListener("mousedown", close);
			}, [menuOpen]);

			const toggleGroup = (key) => {
				setGroupFolded((prev) => {
					const next = new Set(prev);
					if (next.has(key)) next.delete(key);
					else next.add(key);
					return next;
				});
			};

			let body = null;
			if (loading && !data) {
				body = react_jsx_runtime.jsx("div", { className: "gg-wd-empty", children: "加载工作区状态…" });
			} else if (error) {
				body = react_jsx_runtime.jsxs("div", { className: "gg-wd-err", children: [
					error,
					react_jsx_runtime.jsx("div", { style: { marginTop: 8 }, children: react_jsx_runtime.jsx("button", { type: "button", className: "gg-wd-btn", onClick: load, children: "重试" }) })
				] });
			} else if (!isGit) {
				body = react_jsx_runtime.jsx("div", { className: "gg-wd-empty", children: "当前对话区域不是 Git 仓库" });
			} else if (data) {
				const total = data.counts.staged + data.counts.unstaged + data.counts.untracked;
				const groups = [
					{ key: "staged", title: "已暂存", items: data.staged, staged: "1" },
					{ key: "unstaged", title: "更改", items: data.unstaged, staged: "0" },
					{ key: "untracked", title: "未跟踪", items: data.untracked.map((f) => ({ path: f.path, code: "?" })), staged: "untracked" }
				];
				const rows = [];
				if (!total) {
					rows.push(react_jsx_runtime.jsx("div", { className: "gg-wd-clean", children: "✓ 工作区干净" }));
				}
				for (const g of groups) {
					if (!show[g.key] || !g.items.length) continue;
					const folded = groupFolded.has(g.key);
					rows.push(react_jsx_runtime.jsx("div", {
						className: "gg-wd-group" + (folded ? "" : " open"),
						children: react_jsx_runtime.jsxs("div", {
							className: "gg-wd-group-head",
							onClick: () => toggleGroup(g.key),
							children: [
								react_jsx_runtime.jsx("span", { className: "gg-wd-caret", children: "▶" }),
								g.title,
								react_jsx_runtime.jsx("span", { style: { fontWeight: 400, letterSpacing: 0 }, children: "(" + g.items.length + ")" })
							]
						})
					}));
					if (folded) continue; // folded groups render nothing (perf)
					for (const it of g.items) {
						rows.push(react_jsx_runtime.jsx(WorkdirFile, { item: it, staged: g.staged, repo, cache: diffCache }));
					}
				}
				body = rows;
			}

			return react_jsx_runtime.jsxs("div", { className: "gg-wd-panel", style: { right: props.detailsOffset, width: props.width }, children: [
				react_jsx_runtime.jsx("div", { className: "gg-wd-handle", title: "拖拽调整宽度", onPointerDown: props.onHandleDown }),
				react_jsx_runtime.jsxs("div", { className: "gg-wd-head", children: [
					react_jsx_runtime.jsx("span", { className: "gg-wd-title", children: "未提交改动" }),
					data ? react_jsx_runtime.jsx("span", { className: "gg-wd-counts", children: "已暂存 " + data.counts.staged + " · 更改 " + data.counts.unstaged + " · 未跟踪 " + data.counts.untracked }) : null,
					react_jsx_runtime.jsx("span", { className: "gg-wd-sp" }),
					react_jsx_runtime.jsxs("span", { className: "gg-wd-menuwrap", children: [
						react_jsx_runtime.jsx("button", { type: "button", className: "gg-wd-btn", title: "选择显示哪些分组", onClick: () => setMenuOpen((o) => !o), children: "☑ 分组" }),
						react_jsx_runtime.jsxs("div", { className: "gg-wd-menu" + (menuOpen ? " show" : ""), children: [
							["staged", "已暂存"], ["unstaged", "更改"], ["untracked", "未跟踪"]
						].map((entry) => react_jsx_runtime.jsxs("label", {
							children: [
								react_jsx_runtime.jsx("input", { type: "checkbox", checked: show[entry[0]], onChange: () => setShow((prev) => ({ ...prev, [entry[0]]: !prev[entry[0]] }) ) }),
								entry[1]
							]
						})) })
					] }),
					react_jsx_runtime.jsx("button", { type: "button", className: "gg-wd-btn", title: "重新加载未提交改动", onClick: load, children: "↻" }),
					react_jsx_runtime.jsx("button", { type: "button", className: "gg-wd-btn", title: "折叠到右侧", onClick: onFold, children: "▶" })
				] }),
				react_jsx_runtime.jsx("div", { className: "gg-wd-body", children: body })
			] });
		}

		/**
		 * Right-side "未提交改动" module, hosted in the shell.overlay layer.
		 * - Resizable via the left-edge handle (width persisted).
		 * - Collapses to a slim rail; while collapsed the content component is not
		 *   mounted, so nothing renders and no API requests fire.
		 * - Avoids the host details panel by offsetting its right edge when the
		 *   details column is open.
		 */
		function WorkdirPanel(props) {
			const useSessions = props.useSessions;
			const sessionId = useSessions((s) => s.current);
			const cwd = useSessions((s) => (s.current === undefined ? undefined : s.byId[s.current]?.cwd));
			const [userFolded, setUserFolded] = react.useState(() => prefGet("gg-wd-folded", "0") === "1");
			const [width, setWidth] = react.useState(() => clampWidth(parseInt(prefGet("gg-wd-width", ""), 10) || WD_DEFAULT));
			const [detailsOffset, setDetailsOffset] = react.useState(0);
			const panelRef = react.useRef(null);
			const widthRef = react.useRef(width);
			widthRef.current = width;

			// measure the host details column so the module sits left of it when open
			react.useLayoutEffect(() => {
				const layer = document.querySelector("[data-shell-overlay]");
				const frame = layer ? layer.parentElement : null;
				if (!frame) return;
				const measure = () => {
					// the last grid track is the details column ("... minmax(0, 1fr) 360px")
					const parts = getComputedStyle(frame).gridTemplateColumns.split(" ").filter(Boolean);
					const d = parseFloat(parts[parts.length - 1] || "0");
					setDetailsOffset(Number.isFinite(d) ? d : 0);
				};
				measure();
				const mo = new MutationObserver(measure);
				mo.observe(frame, { attributes: true, attributeFilter: ["style", "data-details-collapsed"] });
				return () => mo.disconnect();
			}, []);

			const toggleFold = react.useCallback(() => {
				setUserFolded((f) => {
					const next = !f;
					prefSet("gg-wd-folded", next ? "1" : "0");
					return next;
				});
			}, []);

			const onHandleDown = react.useCallback((e) => {
				e.preventDefault();
				const startX = e.clientX;
				const startW = widthRef.current;
				const move = (ev) => {
					const w = clampWidth(startW + (startX - ev.clientX));
					widthRef.current = w;
					if (panelRef.current) panelRef.current.style.width = w + "px";
				};
				const up = () => {
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", up);
					setWidth(widthRef.current);
					prefSet("gg-wd-width", String(widthRef.current));
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
			}, []);

			if (sessionId === undefined || cwd === undefined) return null;
			if (userFolded) {
				return react_jsx_runtime.jsx("div", {
					className: "gg-wd-rail",
					style: { right: detailsOffset, top: 120 },
					title: "展开未提交改动",
					onClick: toggleFold,
					children: react_jsx_runtime.jsx("span", { children: "未提交改动" })
				});
			}
			return react_jsx_runtime.jsx(WorkdirContent, {
				cwd,
				width,
				detailsOffset,
				onFold: toggleFold,
				onHandleDown,
				panelRef
			});
		}

		/** Required service: the slot registry. */
		const inject = ["slots"];

		/** Client plugin body: the "Git 图谱" tab plus the right-side workdir module. */
		function apply(ctx) {
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "git-graph",
				order: 20,
				label: () => "Git 图谱"
			}, GitGraphView));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "git-graph-workdir",
				order: 50
			}, WorkdirPanel));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
