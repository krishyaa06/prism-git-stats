#!/usr/bin/env node
"use strict";
const path = require("node:path");
const { parseArgs } = require("node:util");
const { gitLog, parseLog, stats, heatmap } = require("../src");
const { c, header, table, bar, plural, useColor } = require("../src/ui");
const pkg = require("../package.json");

const HELP = `${header("gitstats", "your repo's story in one screen")}

${c.bold("Usage")}
  gitstats [dir] [options]

${c.bold("Options")}
  -s, --since <when>     e.g. "3 months ago", 2026-01-01
  -u, --until <when>
  -a, --author <name>    only this author
  -p, --path <path>      only this folder / file
      --all              all branches
  -n, --top <n>          rows in tables (default 5)
  -w, --weeks <n>        heatmap width (default 26)
      --json             machine-readable output
  -v, --version / -h, --help`;

let a;
try { a = parseArgs({ allowPositionals: true, options: { since: { type: "string", short: "s" }, until: { type: "string", short: "u" }, author: { type: "string", short: "a" }, path: { type: "string", short: "p" }, all: { type: "boolean" }, top: { type: "string", short: "n", default: "5" }, weeks: { type: "string", short: "w", default: "26" }, json: { type: "boolean" }, now: { type: "string" }, version: { type: "boolean", short: "v" }, help: { type: "boolean", short: "h" } } }); }
catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }
const o = a.values;
if (o.help) { console.log(HELP); process.exit(0); }
if (o.version) { console.log(pkg.version); process.exit(0); }
const cwd = path.resolve(a.positionals[0] || ".");
const now = o.now ? new Date(o.now) : new Date();
let s;
try { s = stats(parseLog(gitLog(cwd, o)), { now }); }
catch (e) { console.error(c.red(`✖ ${/not a git repository/i.test(String(e.stderr)) ? "Not a git repository: " + cwd : String(e.stderr || e.message).trim().split("\n")[0]}`)); process.exit(2); }
if (o.json) { console.log(JSON.stringify({ ...s, days: Object.fromEntries(s.days) }, null, 2)); process.exit(0); }

const top = Math.max(1, +o.top || 5), n = (x) => x.toLocaleString("en-US");
const ago = (d) => { const days = Math.floor((now - d) / 864e5); return days < 1 ? "today" : days < 2 ? "yesterday" : days < 60 ? `${days}d ago` : `${Math.floor(days / 30)}mo ago`; };
console.log(header("gitstats", path.basename(cwd) + (o.since ? ` · since ${o.since}` : "")));
if (!s.commits) { console.log(`\n${c.dim("No commits found.")}`); process.exit(0); }

const span = Math.max(1, Math.round((s.last - s.first) / 864e5));
console.log(`\n  ${c.bold(n(s.commits))} ${c.dim("commits")}   ${c.green("+" + n(s.add))} ${c.red("−" + n(s.del))}   ${c.bold(s.authors.length)} ${c.dim(s.authors.length === 1 ? "author" : "authors")}   ${c.bold(s.activeDays)} ${c.dim(`active days of ${span}`)}   ${c.accent("🔥 " + s.currentStreak)} ${c.dim(`day streak (best ${s.longestStreak})`)}`);

// heatmap
const { grid, max } = heatmap(s.days, { weeks: Math.min(52, Math.max(4, +o.weeks || 26)), now });
const shade = (v) => { if (!v) return c.gray("·"); const f = v / max; const [r, g, b] = f > 0.75 ? [61, 220, 151] : f > 0.5 ? [46, 170, 120] : f > 0.25 ? [34, 120, 90] : [26, 80, 64]; return useColor ? `\x1b[38;2;${r};${g};${b}m■\x1b[39m` : f > 0.5 ? "█" : "▪"; };
const months = []; let lastM = -1;
grid[0].forEach((cell, i) => { const m = new Date(cell.date).getUTCMonth(); months[i] = m !== lastM && new Date(cell.date).getUTCDate() <= 7 ? "JanFebMarAprMayJunJulAugSepOctNovDec".slice(m * 3, m * 3 + 3) : null; if (months[i]) lastM = m; });
let mline = "      "; for (let i = 0; i < months.length; i++) { if (months[i] && mline.length <= 6 + i * 2) mline = mline.padEnd(6 + i * 2) + months[i]; }
console.log(`\n${c.dim(mline)}`);
["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d, i) => console.log(`  ${c.dim(i % 2 ? d : "   ")} ${grid[i].map((cell) => shade(cell.n)).join(" ")}`));

// authors
console.log(`\n${c.bold("Top authors")}`);
const amax = s.authors[0].commits;
console.log(table(s.authors.slice(0, top).map((x) => [c.bold(x.name), String(x.commits), bar(x.commits / amax, 16), c.green("+" + n(x.add)), c.red("−" + n(x.del)), c.dim(ago(x.last))]), { head: ["AUTHOR", "COMMITS", "", "ADDED", "REMOVED", "LAST"], align: ["l", "r", "l", "r", "r"] }));
if (s.authors.length > top) console.log(c.dim(`  … ${s.authors.length - top} more`));

// hot files
console.log(`\n${c.bold("Hot files")} ${c.dim("(most changed)")}`);
console.log(table(s.hotFiles.slice(0, top).map((f) => [f.file, String(f.changes), c.green("+" + n(f.add)), c.red("−" + n(f.del))]), { head: ["FILE", "CHANGES", "ADDED", "REMOVED"], align: ["l", "r", "r", "r"] }));

// when
const peakH = s.hours.indexOf(Math.max(...s.hours)), peakD = s.weekdays.indexOf(Math.max(...s.weekdays));
const night = s.hours.slice(0, 5).reduce((x, y) => x + y, 0) + s.hours[23];
const spark = (arr) => { const m = Math.max(...arr) || 1; return arr.map((v) => "▁▂▃▄▅▆▇█"[Math.min(7, Math.round((v / m) * 7))]).join(""); };
console.log(`\n${c.bold("When")}      ${c.accent(spark(s.hours))}  ${c.dim("00h → 23h")}`);
console.log(`  ${c.dim("peak")} ${c.bold(String(peakH).padStart(2, "0") + ":00")} ${c.dim("on")} ${c.bold(["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"][peakD])}${night ? c.dim(` · ${Math.round((night / s.commits) * 100)}% after 11pm 🦉`) : ""}`);
const ty = Object.entries(s.types).sort((x, y) => y[1] - x[1]).slice(0, 6);
if (ty.length > 1 || ty[0][0] !== "other") console.log(`  ${c.dim("types")} ${ty.map(([k, v]) => `${c.cyan(k)} ${v}`).join(c.dim(" · "))}`);
