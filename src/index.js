"use strict";
const { execFileSync } = require("node:child_process");
const SEP = "\x1e", FS = "\x1f";
function gitLog(cwd, { since, until, author, path: p, all = false, noMerges = true } = {}) {
  const args = ["log", `--format=${SEP}%H${FS}%an${FS}%ae${FS}%at${FS}%s`, "--numstat", "--no-color", "--no-renames"];
  if (noMerges) args.push("--no-merges"); if (all) args.push("--all");
  if (since) args.push(`--since=${since}`); if (until) args.push(`--until=${until}`); if (author) args.push(`--author=${author}`);
  if (p) args.push("--", p);
  return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 256 << 20, stdio: ["ignore", "pipe", "pipe"] });
}
function parseLog(txt) {
  const commits = [];
  for (const chunk of txt.split(SEP)) {
    if (!chunk.trim()) continue;
    const [head, ...rest] = chunk.split("\n");
    const [hash, name, email, at, subject] = head.split(FS);
    const files = [];
    for (const l of rest) { const m = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(l); if (m) files.push({ add: m[1] === "-" ? 0 : +m[1], del: m[2] === "-" ? 0 : +m[2], file: m[3], binary: m[1] === "-" }); }
    commits.push({ hash, name, email, date: new Date(+at * 1000), subject: subject || "", files });
  }
  return commits;
}
const dayKey = (d) => d.toISOString().slice(0, 10);
function stats(commits, { now = new Date(), mailmap = true } = {}) {
  const authors = new Map(), files = new Map(), days = new Map(), hours = Array(24).fill(0), weekdays = Array(7).fill(0), types = {};
  let add = 0, del = 0;
  const id = (c) => (mailmap ? c.email.toLowerCase().replace(/^\d+\+/, "") : c.name);
  for (const c of commits) {
    const k = id(c);
    const a = authors.get(k) || { name: c.name, email: c.email, commits: 0, add: 0, del: 0, first: c.date, last: c.date };
    a.commits++; if (c.date < a.first) a.first = c.date; if (c.date > a.last) { a.last = c.date; a.name = c.name; }
    for (const f of c.files) { a.add += f.add; a.del += f.del; add += f.add; del += f.del; const x = files.get(f.file) || { file: f.file, changes: 0, add: 0, del: 0 }; x.changes++; x.add += f.add; x.del += f.del; files.set(f.file, x); }
    authors.set(k, a);
    days.set(dayKey(c.date), (days.get(dayKey(c.date)) || 0) + 1);
    hours[c.date.getHours()]++; weekdays[c.date.getDay()]++;
    const t = /^(\w+)(\(.+?\))?!?:/.exec(c.subject); const ty = t ? t[1].toLowerCase() : "other"; types[ty] = (types[ty] || 0) + 1;
  }
  // streaks
  const sorted = [...days.keys()].sort();
  let longest = 0, run = 0, prev = null;
  for (const d of sorted) { run = prev && (new Date(d) - new Date(prev)) === 864e5 ? run + 1 : 1; longest = Math.max(longest, run); prev = d; }
  let current = 0; const cur = new Date(dayKey(now));
  if (!days.has(dayKey(cur))) cur.setUTCDate(cur.getUTCDate() - 1);
  while (days.has(dayKey(cur))) { current++; cur.setUTCDate(cur.getUTCDate() - 1); }
  const first = commits.length ? commits.reduce((m, c) => (c.date < m ? c.date : m), commits[0].date) : null;
  const last = commits.length ? commits.reduce((m, c) => (c.date > m ? c.date : m), commits[0].date) : null;
  return {
    commits: commits.length, add, del, first, last, activeDays: days.size, longestStreak: longest, currentStreak: current,
    authors: [...authors.values()].sort((x, y) => y.commits - x.commits),
    hotFiles: [...files.values()].sort((x, y) => y.changes - x.changes || (y.add + y.del) - (x.add + x.del)),
    days, hours, weekdays, types,
  };
}
/** 7 x N weeks grid ending today (GitHub-style). */
function heatmap(days, { weeks = 26, now = new Date() } = {}) {
  const end = new Date(dayKey(now)); const start = new Date(end); start.setUTCDate(end.getUTCDate() - (weeks * 7 - 1) - end.getUTCDay());
  const grid = Array.from({ length: 7 }, () => []); const max = Math.max(1, ...days.values());
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) grid[d.getUTCDay()].push({ date: dayKey(d), n: days.get(dayKey(d)) || 0 });
  return { grid, max, start };
}
module.exports = { gitLog, parseLog, stats, heatmap, dayKey };
