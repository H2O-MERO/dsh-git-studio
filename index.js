// dsh-git-studio — server half
// Registers HTTP routes under /git-graph:
//   GET /git-graph/api?op=<op>&repo=<path>[&hash=<sha>]  -> JSON git data
//   GET /git-graph/index.html                           -> the visualizer page
// Commands are executed with execFile (no shell), fixed argument lists only.
import { execFile } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const webRoot = join(here, 'web')

const MAX_GIT_BUFFER = 32 * 1024 * 1024
const MAX_DIFF_CHARS = 240000

export const name = 'git-studio'
export const inject = ['webServer']

function runGit(repo, args, maxBuffer = MAX_GIT_BUFFER) {
  return new Promise((resolve, reject) => {
    execFile('git', ['-C', repo, ...args], { maxBuffer, windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        const detail = (stderr || err.message || '').toString().trim()
        reject(new Error(detail || 'git failed'))
        return
      }
      resolve(stdout.toString())
    })
  })
}

/** Open a local file with the OS default application (server-side, no shell). */
function openLocalFile(file) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32'
    const cmd = isWin ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open'
    const args = isWin ? ['/c', 'start', '', file] : [file]
    execFile(cmd, args, { windowsHide: true }, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

async function isGitRepo(repo) {
  try {
    const out = await runGit(repo, ['rev-parse', '--is-inside-work-tree'])
    return out.trim() === 'true'
  } catch {
    return false
  }
}

/** Walk upward from `start` until a directory containing `.git` is found. */
function findGitRoot(start) {
  let dir = String(start).replace(/\\/g, '/').replace(/\/+$/, '') || '/'
  for (let i = 0; i < 24; i++) {
    try {
      const p = join(dir, '.git')
      const st = statSync(p)
      if (st.isDirectory() || st.isFile()) return dir
    } catch { /* keep walking */ }
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
  return null
}

/** Parse `git log --format=...%x1f...%d` lines into structured commit rows. */
function parseLog(stdout) {
  const rows = []
  for (const line of stdout.split('\n')) {
    if (!line) continue
    const [hash, parents, author, email, date, subject, refs] = line.split('\x1f')
    rows.push({
      hash,
      parents: parents ? parents.split(' ') : [],
      author,
      email,
      date,
      subject,
      refs: parseRefs(refs),
    })
  }
  return rows
}

/** Parse git refs decoration like " (HEAD -> master, tag: v1, origin/dev)". */
function parseRefs(raw) {
  const refs = []
  if (!raw) return refs
  const inner = raw.replace(/^\(/, '').replace(/\)$/, '').trim()
  if (!inner) return refs
  for (const part of inner.split(',')) {
    const item = part.trim()
    if (!item) continue
    if (item.startsWith('tag: ')) {
      refs.push({ kind: 'tag', name: item.slice(5).trim() })
    } else if (item.includes(' -> ')) {
      const [, target] = item.split(' -> ')
      refs.push({ kind: 'branch', name: target.trim(), head: item.startsWith('HEAD') })
    } else {
      refs.push({ kind: 'branch', name: item })
    }
  }
  return refs
}

/**
 * Parse `git status --porcelain=v1 -z` output. Returns [{x, y, path, oldPath?}].
 * In -z mode rename/copy entries emit two records: "XY <new path>" then "<old path>".
 */
function parsePorcelainZ(buf) {
  const records = []
  const parts = buf.split('\0')
  for (let i = 0; i < parts.length; i++) {
    const rec = parts[i]
    if (!rec || rec.length < 3) continue
    const x = rec[0]
    const y = rec[1]
    const path = rec.slice(3)
    if ((x === 'R' || x === 'C') && i + 1 < parts.length && parts[i + 1]) {
      records.push({ x, y, path, oldPath: parts[i + 1] })
      i++
      continue
    }
    records.push({ x, y, path })
  }
  return records
}

/**
 * Parse `git diff --numstat -z` output into a path -> {added, deleted} map.
 * Normal entries are "added\tdeleted\t<path>"; rename entries are
 * "added\tdeleted" + "\0" + "<old>" + "\0" + "<new>" (keyed by the new path);
 * binary entries use "-" for both counts.
 */
function parseNumstatZ(buf) {
  const map = new Map()
  const parts = buf.split('\0')
  for (let i = 0; i < parts.length; i++) {
    const rec = parts[i]
    if (!rec) continue
    const fields = rec.split('\t')
    if (fields.length < 2) continue
    const added = fields[0]
    const deleted = fields[1]
    let key
    if (fields.length >= 3) {
      key = fields[2]
    } else {
      // rename: "n\tn" then "<old>" then "<new>"
      const old = i + 1 < parts.length ? parts[i + 1] : ''
      const next = i + 2 < parts.length ? parts[i + 2] : ''
      key = next || old
      i += 2
    }
    if (key) map.set(key, { added, deleted })
  }
  return map
}

export function apply(ctx, config = {}) {
  const configured = []
  if (config.repo) configured.push(String(config.repo))
  if (Array.isArray(config.repos)) configured.push(...config.repos.map(String))
  const normalize = (p) => String(p).replace(/[\\/]+$/, '')
  const allowed = [...new Set(configured.map(normalize))].filter(Boolean)
  // Workspace-discovered repos (from the repos op) are accepted for reads too.
  const recentRepos = new Set()

  ctx.webServer.register({
    kind: 'prefix',
    path: '/git-graph',
    handler: async (req, res) => {
      const sendJson = (obj, status = 200) => {
        const body = JSON.stringify(obj)
        res.writeHead(status, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        })
        res.end(body)
      }
      try {
        const url = new URL(req.url, 'http://localhost')
        const pathname = url.pathname

        if (pathname === '/git-graph/' || pathname === '/git-graph/index.html') {
          res.writeHead(200, {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'no-store',
          })
          res.end(readFileSync(join(webRoot, 'index.html')))
          return
        }

        if (pathname !== '/git-graph/api') {
          sendJson({ ok: false, error: 'not-found' }, 404)
          return
        }

        const op = url.searchParams.get('op') || 'graph'
        if (op === 'repos') {
          // The current session's workspace (ws) is preferred when a git work
          // tree is found at or above it; configured repos follow as fallbacks.
          const ws = normalize(url.searchParams.get('ws') || '')
          let wsRoot = null
          let wsIsGit = false
          let current = allowed[0] ?? null
          if (ws) {
            const root = findGitRoot(ws)
            if (root) {
              wsRoot = root
              wsIsGit = true
              current = root
            }
          }
          const repos = []
          if (wsRoot) repos.push(wsRoot)
          for (const r of allowed) if (!repos.includes(r)) repos.push(r)
          for (const r of repos) recentRepos.add(r)
          sendJson({ ok: true, repos, current, ws, wsRoot, wsIsGit })
          return
        }

        let repo = url.searchParams.get('repo') || allowed[0]
        const repoNorm = normalize(repo || '')
        if (!repoNorm || (!allowed.includes(repoNorm) && !recentRepos.has(repoNorm))) {
          sendJson({ ok: false, error: 'repo-not-allowed', repos: allowed }, 403)
          return
        }
        repo = repoNorm

        // Sanity: reject paths that are not existing git work trees.
        if (!(await isGitRepo(repo))) {
          sendJson({ ok: false, error: 'not-a-git-repo', repo }, 400)
          return
        }

        switch (op) {
          case 'graph': {
            const headOut = await runGit(repo, ['symbolic-ref', '-q', '--short', 'HEAD']).catch(() => '')
            const headName = headOut.trim() || 'HEAD'
            const log = await runGit(repo, [
              'log', '--all', '--topo-order', '--date=iso-strict',
              '--format=%H%x1f%P%x1f%an%x1f%ae%x1f%ad%x1f%s%x1f%d',
            ])
            sendJson({
              ok: true,
              repo,
              head: headName,
              commits: parseLog(log),
            })
            break
          }
          case 'branches': {
            // for-each-ref supports %09 (tab) but not %x1f (that is a log/pretty-format feature).
            const out = await runGit(repo, [
              'for-each-ref',
              '--format=%(refname)%09%(objectname)%09%(HEAD)',
              'refs/heads', 'refs/remotes', 'refs/tags',
            ])
            const branches = []
            for (const line of out.split('\n')) {
              if (!line) continue
              const [refname, sha, isHead] = line.split('\t')
              branches.push({
                refname,
                kind: refname.startsWith('refs/tags/') ? 'tag' : refname.startsWith('refs/remotes/') ? 'remote' : 'local',
                name: refname.replace(/^refs\/(heads|remotes|tags)\//, ''),
                sha,
                head: isHead === '*',
              })
            }
            sendJson({ ok: true, branches })
            break
          }
          case 'workstatus': {
            // VSCode-style working-tree overview: structured file lists grouped by
            // staged / unstaged / untracked, with per-file +/- counts (numstat).
            const branch = (await runGit(repo, ['rev-parse', '--abbrev-ref', 'HEAD']).catch(() => '')).trim() || 'HEAD'
            const statusOut = await runGit(repo, ['status', '--porcelain=v1', '-z']).catch(() => '')
            const stagedNum = await runGit(repo, ['diff', '--cached', '--numstat', '-z']).catch(() => '')
            const unstagedNum = await runGit(repo, ['diff', '--numstat', '-z']).catch(() => '')
            const stagedCounts = parseNumstatZ(stagedNum)
            const unstagedCounts = parseNumstatZ(unstagedNum)
            const staged = []
            const unstaged = []
            const untracked = []
            for (const r of parsePorcelainZ(statusOut)) {
              const num = (m) => {
                const n = m.get(r.path)
                return n ? { added: n.added === '-' ? null : parseInt(n.added, 10) || 0, deleted: n.deleted === '-' ? null : parseInt(n.deleted, 10) || 0, binary: n.added === '-' } : { added: 0, deleted: 0, binary: false }
              }
              const conflict = (r.x === 'U' || r.x === 'A' || r.x === 'D') && (r.y === 'U' || r.y === 'A' || r.y === 'D')
              if (r.x === '?' && r.y === '?') {
                untracked.push({ path: r.path })
                continue
              }
              if (conflict) {
                unstaged.push({ path: r.path, oldPath: r.oldPath || '', code: 'U', ...num(unstagedCounts) })
                continue
              }
              if (r.x !== ' ' && r.x !== '?') {
                staged.push({ path: r.path, oldPath: r.oldPath || '', code: r.x, ...num(stagedCounts) })
              }
              if (r.y !== ' ' && r.y !== '?') {
                unstaged.push({ path: r.path, oldPath: r.oldPath || '', code: r.y, ...num(unstagedCounts) })
              }
            }
            sendJson({
              ok: true,
              repo,
              branch,
              staged,
              unstaged,
              untracked,
              counts: { staged: staged.length, unstaged: unstaged.length, untracked: untracked.length },
            })
            break
          }
          case 'workfile': {
            // Per-file diff (or content for untracked files) of the working tree.
            const file = url.searchParams.get('file')
            const staged = url.searchParams.get('staged') || '0' // '0' | '1' | 'untracked'
            if (!file) {
              sendJson({ ok: false, error: 'missing-file' }, 400)
              return
            }
            const full = resolve(repo, file).replace(/\\/g, '/')
            const base = repo.replace(/\\/g, '/')
            if (full !== base && !full.startsWith(base + '/')) {
              sendJson({ ok: false, error: 'path-outside-repo' }, 400)
              return
            }
            if (staged === 'untracked') {
              let st
              try { st = statSync(full) } catch {
                sendJson({ ok: false, error: 'file-not-found', file }, 404)
                return
              }
              if (!st.isFile()) {
                sendJson({ ok: true, isDir: true, content: '' })
                return
              }
              let content = ''
              try { content = readFileSync(full, 'utf8') } catch (err) {
                sendJson({ ok: false, error: String((err && err.message) || err) }, 500)
                return
              }
              if (content.includes('\0')) {
                sendJson({ ok: true, binary: true, content: '' })
                return
              }
              const truncated = content.length > MAX_DIFF_CHARS
              sendJson({ ok: true, content: truncated ? content.slice(0, MAX_DIFF_CHARS) : content, truncated })
              return
            }
            const paths = [file]
            const old = url.searchParams.get('old')
            if (old) paths.push(old)
            const args = (staged === '1'
              ? ['diff', '--cached', '--no-color', '--', ...paths]
              : ['diff', '--no-color', '--', ...paths])
            const out = await runGit(repo, args).catch(() => '')
            const truncated = out.length > MAX_DIFF_CHARS
            sendJson({ ok: true, diff: truncated ? out.slice(0, MAX_DIFF_CHARS) : out, truncated })
            break
          }
          case 'openfile': {
            const file = url.searchParams.get('file')
            if (!file) {
              sendJson({ ok: false, error: 'missing-file' }, 400)
              return
            }
            const fullNative = resolve(repo, file)
            const full = fullNative.replace(/\\/g, '/')
            const base = repo.replace(/\\/g, '/')
            if (full !== base && !full.startsWith(base + '/')) {
              sendJson({ ok: false, error: 'path-outside-repo' }, 400)
              return
            }
            let st
            try { st = statSync(fullNative) } catch {
              sendJson({ ok: false, error: 'file-not-found', file }, 404)
              return
            }
            if (!st.isFile()) {
              sendJson({ ok: false, error: 'not-a-file' }, 400)
              return
            }
            try {
              await openLocalFile(fullNative)
              sendJson({ ok: true })
            } catch (err) {
              sendJson({ ok: false, error: String((err && err.message) || err) }, 500)
            }
            break
          }
          case 'show': {
            const hash = url.searchParams.get('hash')
            if (!hash) {
              sendJson({ ok: false, error: 'missing-hash' }, 400)
              return
            }
            const meta = await runGit(repo, ['log', '-1', `--format=%H%x1f%P%x1f%an%x1f%ae%x1f%ad%x1f%s%x1f%b`, hash]).catch(() => '')
            const parts = meta.split('\x1f')
            const sha = parts[0] || hash
            const parents = (parts[1] || '').trim()
            const author = parts[2] || ''
            const email = parts[3] || ''
            const date = parts[4] || ''
            const subject = parts[5] || ''
            const body = parts.slice(6).join('\x1f').trim()
            // stat: diff against the first parent; root commits use the empty tree.
            let stat = ''
            const firstParent = parents ? parents.split(' ')[0] : ''
            if (firstParent) {
              stat = await runGit(repo, ['diff', '--stat', firstParent, sha]).catch(() => '')
            } else {
              stat = await runGit(repo, ['show', '--stat', '--format=', sha]).catch(() => '')
            }
            sendJson({ ok: true, hash: sha, parents: parents ? parents.split(' ') : [], author, email, date, subject, body, stat: stat.trim() })
            break
          }
          case 'diff': {
            const hash = url.searchParams.get('hash')
            if (!hash) {
              sendJson({ ok: false, error: 'missing-hash' }, 400)
              return
            }
            // Full patch of one commit (git diff against its first parent; root commits diff against empty tree).
            const out = await runGit(repo, ['show', '--no-color', '--format=', hash]).catch(() => '')
            const truncated = out.length > MAX_DIFF_CHARS
            sendJson({ ok: true, diff: truncated ? out.slice(0, MAX_DIFF_CHARS) : out, truncated })
            break
          }
          case 'filediff': {
            const hash = url.searchParams.get('hash')
            const file = url.searchParams.get('file')
            if (!hash || !file) {
              sendJson({ ok: false, error: 'missing-hash-or-file' }, 400)
              return
            }
            // Diff of a single file inside one commit (against its first parent).
            let out = ''
            const parents = (await runGit(repo, ['log', '-1', '--format=%P', hash]).catch(() => '')).trim()
            if (parents) {
              out = await runGit(repo, ['diff', '--no-color', parents.split(' ')[0], hash, '--', file]).catch(() => '')
            } else {
              out = await runGit(repo, ['show', '--no-color', '--format=', hash, '--', file]).catch(() => '')
            }
            const truncated = out.length > MAX_DIFF_CHARS
            sendJson({ ok: true, file, diff: truncated ? out.slice(0, MAX_DIFF_CHARS) : out, truncated })
            break
          }
          default:
            sendJson({ ok: false, error: 'unknown-op' }, 400)
        }
      } catch (err) {
        try {
          sendJson({ ok: false, error: String((err && err.message) || err) }, 500)
        } catch {
          /* response already committed */
        }
      }
    },
  })
}
