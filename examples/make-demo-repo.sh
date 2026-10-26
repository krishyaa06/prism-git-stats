#!/bin/sh
# Builds a fake repo with 4 authors and ~6 months of history: sh examples/make-demo-repo.sh /tmp/demo
set -e
D=${1:-/tmp/gitstats-demo}; rm -rf "$D"; mkdir -p "$D"; cd "$D"; git init -q -b main
node -e '
const { execSync } = require("child_process"); const fs = require("fs");
const A = [["Soumya Bhandare","soumya@prism.dev",.45],["Aarav Patil","aarav@prism.dev",.25],["Riya Shah","riya@prism.dev",.2],["dependabot[bot]","bot@github.com",.1]];
const F = ["src/app.tsx","src/api/client.ts","src/components/Chat.tsx","src/hooks/useStream.ts","README.md","package.json","src/styles.css","server/index.js"];
const T = ["feat","fix","feat","refactor","docs","chore","fix","style"];
let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const end = new Date("2026-10-26T12:00:00Z").getTime();
for (let d = 182; d >= 0; d--) {
  if (d >= 12 && r() < .38) continue;
  const n = 1 + Math.floor(r() * (d < 30 ? 5 : 3));
  for (let i = 0; i < n; i++) {
    let x = r(), a = A[0]; for (const y of A) { if ((x -= y[2]) < 0) { a = y; break; } }
    const f = F[Math.floor(Math.pow(r(), 1.8) * F.length)]; const ty = a[0].startsWith("dep") ? "chore" : T[Math.floor(r() * T.length)];
    fs.mkdirSync(require("path").dirname(f), { recursive: true });
    if (fs.existsSync(f) && r() < .3) { const L = fs.readFileSync(f, "utf8").split("\n"); fs.writeFileSync(f, L.filter(() => r() > .35).join("\n")); }
    fs.appendFileSync(f, Array.from({ length: 1 + Math.floor(r() * 40) }, () => "line " + r()).join("\n") + "\n");
    const h = [10,11,14,15,16,21,22,23,0,1][Math.floor(r() * 10)];
    const date = new Date(end - d * 864e5); date.setUTCHours(h, Math.floor(r() * 60));
    execSync(`git add -A && git commit -q -m "${ty}: update ${f.split("/").pop()}"`, { env: { ...process.env, GIT_AUTHOR_NAME: a[0], GIT_AUTHOR_EMAIL: a[1], GIT_COMMITTER_NAME: a[0], GIT_COMMITTER_EMAIL: a[1], GIT_AUTHOR_DATE: date.toISOString(), GIT_COMMITTER_DATE: date.toISOString() } });
  }
}'
echo "demo repo: $D ($(git rev-list --count HEAD) commits)"
