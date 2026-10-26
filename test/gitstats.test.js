const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execSync, spawnSync } = require("node:child_process");
const { parseLog, stats, heatmap, gitLog } = require("../src");
const bin = path.join(__dirname, "../bin/gitstats.js");

function repo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "gs-"));
  execSync("git init -q -b main", { cwd: d });
  const commit = (who, date, file, lines, msg) => {
    fs.appendFileSync(path.join(d, file), "x\n".repeat(lines));
    execSync(`git add -A && git commit -q -m "${msg}"`, { cwd: d, env: { ...process.env, GIT_AUTHOR_NAME: who, GIT_AUTHOR_EMAIL: who + "@x.dev", GIT_COMMITTER_NAME: who, GIT_COMMITTER_EMAIL: who + "@x.dev", GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } });
  };
  commit("ana", "2026-10-20T10:00:00Z", "a.js", 5, "feat: a");
  commit("ana", "2026-10-21T10:00:00Z", "a.js", 3, "fix: a");
  commit("ben", "2026-10-22T10:00:00Z", "b.js", 2, "docs: b");
  commit("ana", "2026-10-25T10:00:00Z", "a.js", 1, "wip");
  return d;
}
test("parse + stats", () => {
  const d = repo();
  const s = stats(parseLog(gitLog(d)), { now: new Date("2026-10-26T12:00:00Z") });
  assert.equal(s.commits, 4); assert.equal(s.add, 11);
  assert.deepEqual(s.authors.map((a) => [a.name, a.commits]), [["ana", 3], ["ben", 1]]);
  assert.equal(s.hotFiles[0].file, "a.js"); assert.equal(s.hotFiles[0].changes, 3);
  assert.equal(s.longestStreak, 3); assert.equal(s.currentStreak, 1);
  assert.deepEqual(s.types, { feat: 1, fix: 1, docs: 1, other: 1 });
  assert.equal(stats(parseLog(gitLog(d, { author: "ben" }))).commits, 1);
});
test("heatmap shape", () => {
  const h = heatmap(new Map([["2026-10-26", 2]]), { weeks: 4, now: new Date("2026-10-26T12:00:00Z") });
  assert.equal(h.grid.length, 7); assert.equal(h.grid[1].at(-1).n, 2); assert.ok(h.grid[0].length >= 4);
});
test("cli", () => {
  const d = repo();
  const r = spawnSync("node", [bin, d, "--now", "2026-10-26"], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /Top authors/); assert.match(r.stdout, /ana/);
  assert.equal(JSON.parse(spawnSync("node", [bin, d, "--json"], { encoding: "utf8" }).stdout).commits, 4);
  assert.equal(spawnSync("node", [bin, os.tmpdir()]).status, 2);
});
