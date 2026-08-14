# dsh-git-graph

🌏 中文 · [English](./README_EN.md)

> 🧭 **一句话定位：DSH 生态里开箱即用的 Git 可视化工具。** 在 DeepSeek Harness 对话界面内直接嵌入 GitHub 风格的提交历史图、分支管理、代码 Diff 与 VSCode 风格未提交改动面板——AI 开发时不用再切到别的 Git 客户端。

DeepSeek Harness（DSH）Web GUI 的嵌入式 Git 仓库图谱可视化插件。

在对话界面里直接查看、浏览、管理 git 仓库：提交历史图、分支过滤、提交详情、文件 diff、工作区状态、右键 git 操作，全部内嵌在 harness 界面中，无需离开当前对话。提交图一目了然，未提交改动像 VSCode 一样分组展示，一眼看清"改了什么、谁改的、要不要提交"。

**适合谁**：用 DeepSeek Harness / DSH 做 AI 编程、Agent 开发的开发者；想在同一个界面里同时看清提交历史、分支、工作区改动的 Git 用户；需要比命令行更直观的 Git 可视化工具的开发者与团队。

> 🔍 搜索关键词：DSH 插件 · DeepSeek Harness 插件 · Git 可视化 · Git 图谱 · 提交历史图 · 分支管理 · 代码 Diff · VSCode 风格改动面板 · Git 效率工具 · AI 编程助手

> 🛠 本项目由 AI 辅助开发（AI-assisted development）。

![Git 图谱](https://img.shields.io/badge/DSH-Plugin-58a6ff)

## 📸 效果预览

<img src="assets/git-graph-demo.png" alt="Git 图谱演示" width="720">

## ✨ 功能

- **提交历史图**：GitHub 风格提交列表，分支分组折叠、分支着色（本地与远程分支各有独立分组）
- **跟随当前对话**：打开哪个对话就显示哪个对话工作区的 git 仓库，切换对话自动跟随；非 git 仓库的对话显示空态提示（不显示图谱）
- **分支过滤**：勾选 = 显示该分支 · 不勾 = 完全隐藏（全部不勾选则列表为空）
- **提交详情**：提交信息、文件变更列表、单文件 diff、两次提交对比（Ctrl+点击）
- **未提交改动（VSCode 风格，常驻图谱顶部）**：已暂存 / 更改 / 未跟踪三组文件列表、状态徽标（A/M/D/R/U/?）、每文件 +/− 行数、点击行展开单文件 diff、重命名 `旧 → 新`、未跟踪文件直接显示内容；☑ 分组开关可单独隐藏某组，面板与分组均可点击折叠
- **右键菜单**：checkout / merge / reset / cherry-pick / stash / 新建标签 等 git 操作
- **键盘快捷键**：`Ctrl+F` 搜索、`Ctrl+H` 回到 HEAD、`↑↓` 导航、`Esc` 关闭
- **明暗主题**：跟随 harness 界面自动切换，也可手动固定
- **挂载位置**：会话页内「Git 图谱」标签（位于「轨迹」标签旁）

## 📦 安装

### 1. 把插件加入 profile

编辑你的 DSH web profile 的 `package.json`，添加依赖：

```json
{
  "dependencies": {
    "dsh-git-graph": "file:./plugins/git-graph"
  }
}
```

（`plugins/git-graph` 为本插件源码所在目录，按实际路径调整。）

### 2. 挂载 bundle

在 profile 的 `cordis.patch.yml` 中加入：

```yaml
- insert:
    - id: git-graph
      name: dsh-git-graph
      config:
        repo: "C:/path/to/your/repo"
```

> `config.repo` / `config.repos` 是初始可访问仓库白名单；运行中被会话工作区发现的仓库也会自动加入可访问集合。

### 3. 安装并重启

```bash
pnpm install
# 然后重启 dsh web（或直接使用一键重启脚本）
```

打开 http://127.0.0.1:3080 ，在任意会话页内点「Git 图谱」标签（位于「轨迹」标签旁）即可查看。

## 🖱️ 使用

| 操作 | 说明 |
| --- | --- |
| 会话页「Git 图谱」标签 | 在该对话内查看图谱（跟随当前对话工作区） |
| 分支组标题 | 点击折叠 / 展开该分支 |
| ☑ 分支过滤 | 勾选 = 显示该分支，不勾 = 完全隐藏 |
| 图谱顶部「未提交改动」区块 | 已暂存/更改/未跟踪一览（含未跟踪文件），点击行展开 diff；☑ 分组可隐藏某组；点击顶栏或组标题折叠 |
| 提交行 | 点击查看详情，Ctrl+点击与另一提交对比 |
| 提交行右键 | git 操作菜单 |
| 底部状态栏「未提交改动」 | 点击滚动到顶部改动区块 |
| ↻ 刷新 | 重新加载仓库数据 |

## 🛠️ 开发

```
git-graph/
├── index.js          # 服务端：git API（graph/branches/workstatus/workfile/diff/...）
├── client.js         # 客户端插件：会话页「Git 图谱」标签
├── web/index.html    # 图谱界面（iframe 内独立页面）
├── package.json      # 插件清单（dsh.client.inject + bundle patch）
└── cordis.patch.yml  # profile 挂载点
```

修改后同步到 DSH 部署目录（`node_modules/dsh-git-graph/`）：

```powershell
.\sync-deploy.ps1
```

服务端（`index.js`）改动需重启 dsh web；页面（`web/index.html`）改动刷新即生效。

## 📄 开源协议

[MIT](./LICENSE)

## 🙏 致谢

- [DeepSeek Harness](https://github.com/deepseek-ai/) —— 插件运行平台
