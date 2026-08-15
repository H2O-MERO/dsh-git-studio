# AGENTS.md — dsh-git-graph 开发指南

本文件面向在本仓库中工作的 AI 代理与人类开发者，说明项目结构、开发流程与约定。

## 项目是什么

dsh-git-graph 是 DeepSeek Harness (DSH) Web GUI 的嵌入式 Git 仓库图谱可视化插件：

- **会话页「Git 图谱」标签**：注册到 `conversation.view` 插槽，iframe 内嵌独立页面（`web/index.html`）
- **服务端只读 git API**：`execFile` 固定参数执行（无 shell），仓库路径白名单 + 会话工作区发现
- **未提交改动**：图谱顶部常驻区块（`#wdPanel`，VSCode 风格分组文件列表 + 按需加载单文件 diff）+ 对话页右侧独立模块（注册到 `shell.overlay` 插槽，可拖宽、折叠态不渲染不请求）

## 目录结构

```
├── index.js          # 服务端（Host 半）：注册 /git-graph 前缀路由
├── client.js         # 客户端（浏览器半）：注册 conversation.view 标签 + shell.overlay 右侧未提交改动模块
├── web/index.html    # 图谱页面（iframe 独立页，全部逻辑内联 <script>）
├── package.json      # npm 清单（dsh.client.inject + dsh.bundle.patch）
├── dsh.plugin.json   # DSH 官方插件清单（id: dsh-external/dsh-git-graph）
├── cordis.patch.yml  # profile 挂载点（config.repo 为仓库白名单，示例路径）
├── sync-deploy.ps1   # 同步到本地 DSH 部署目录（-Dst 参数 / $env:DSH_GIT_GRAPH_DST）
├── assets/           # README 演示截图
├── README.md / README_EN.md
└── LICENSE           # MIT
```

## 服务端 API（index.js）

`GET /git-graph/api?op=<op>&repo=<path>[&...]`，op 列表：

| op | 用途 | 关键参数 |
| --- | --- | --- |
| `repos` | 会话工作区向上定位 git 根 + 白名单兜底 | `ws` |
| `graph` | 提交历史（topo 序，含 refs 装饰） | — |
| `branches` | 本地/远程/标签 refs | — |
| `workstatus` | 未提交改动分组列表（porcelain -z + numstat -z） | — |
| `workfile` | 单文件 diff / 未跟踪内容 | `file`、`staged`(`0`\|`1`\|`untracked`)、`old`(重命名旧路径) |
| `show` / `diff` / `filediff` | 提交详情 / 完整补丁 / 单文件 diff | `hash`、`file` |

## 关键约定

- **安全**：git 一律 `execFile` 固定参数数组，绝不拼接 shell；`workfile` 用 `path.resolve` + `startsWith` 防路径穿越；长输出截断（`MAX_DIFF_CHARS`）
- **客户端**：纯 JS + `React.createElement`（无 JSX/TSX 转换）；Slot 注册用 `ctx.slots.register`；`inject` 只声明实际使用的服务
- **页面**：内联脚本 `"use strict"`；API 失败统一 `{ok:false, error}`；主题变量用 `--bg/--text/...` + `html.gg-light`
- **分支过滤语义**：不勾选的分支其提交与分组头完全隐藏；`visibleSet()` 返回空集时显示空列表（禁止回落全显）；`buildRows()` 对本地与远程分支都生成可折叠分组（已完全合并进已显示提交的分支不重复生成）
- **未提交改动**：常驻图谱顶部 `#wdPanel`（`refreshWorkdir` 拉取 workstatus 并渲染面板 + 状态栏）；分组（staged 按 X 码、unstaged 按 Y 码、`??` 为未跟踪、冲突码 `U`）；`workfile` 按需加载 + 客户端缓存（`wdDiffCache`）；无改动时显示「✓ 工作区干净」；分组显隐由 `WD_SHOW` 控制（顶栏 ☑ 分组菜单），面板/分组折叠用 `WD_FOLDED` / `WD_GROUP_FOLDED`；`#wdPanel` 禁止加 `overflow:hidden`（会裁切绝对定位的分组菜单）
- **解析细节**：`porcelain -z` 重命名两条记录（`XY <新路径>` + `<旧路径>`）；`numstat -z` 重命名为 `n\tn` + 旧路径 + 新路径；Windows 路径先 `replace(/\\/g,'/')` 再比较

## 开发与验证流程

1. 修改源码（`index.js` / `client.js` / `web/index.html`）
2. 语法校验：
   - `node --check index.js client.js`
   - `web/index.html` 内联脚本：提取 `<script>…</script>` 内容后 `node --check`
3. 同步到部署目录：`.\sync-deploy.ps1 -Dst <你的部署目录>`
4. `index.js` / `client.js` 改动需重启 dsh web；`web/index.html` 刷新即生效
5. 服务端功能测试：构造场景仓库（staged / unstaged / untracked / rename / MM / 删除），用 mock `webServer` 直接调 handler 断言 JSON；页面级用临时 http server + 浏览器验证
6. 版本节奏：功能迭代 → `package.json` / `dsh.plugin.json` version 同步 → `git commit` → `git tag vX.Y`

## 注意

- 提交前检查：不要把本地绝对路径（如 `D:/...`、`C:\Users\<用户名>\...`）写进 `cordis.patch.yml` / `sync-deploy.ps1` / README —— 开源仓库使用示例路径占位
- `.gitignore` 已排除 `node_modules/`、`*.log`、`.DS_Store`、`.playwright-mcp/`（浏览器测试残留）
