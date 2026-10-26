<!-- ═════════════ HEADER ═════════════ -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:07060f,50:3DDC97,100:00D2FF&height=200&section=header&text=Prism%20Git%20Stats&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Repo%20history%20in%20one%20screen&descAlignY=58&descSize=16" width="100%" alt="Prism Git Stats" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&duration=2600&pause=800&color=3DDC97&center=true&vCenter=true&width=680&lines=gitstats;%F0%9F%94%A5+12+day+streak;Hot+files+%C2%B7+Top+authors;29%25+after+11pm+%F0%9F%A6%89" alt="Typing SVG" />
</p>

<p align="center">
  <a href="https://github.com/krishyaa06/prism-git-stats/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/krishyaa06/prism-git-stats/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/dependencies-0-3DDC97?style=for-the-badge" alt="Zero dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/krishyaa06/prism-git-stats?style=for-the-badge&color=00D2FF" alt="License" /></a>
</p>

<p align="center">
  <img src="assets/screenshots/demo.png" width="90%" alt="Prism Git Stats screenshot" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" />

## ⚡ Overview

**Prism Git Stats** (`gitstats`) reads `git log --numstat` and renders a one-screen dashboard of your project: a GitHub-style contribution heatmap, current and best streak, top authors with lines added / removed, the files that change the most (your hotspots), when you actually commit, and a breakdown of conventional-commit types. Filter by date, author or folder, or get everything as JSON.

## ✨ Features

- **Contribution heatmap** (truecolor) for the last 4–52 weeks + current / best **streak**
- **Top authors** with commits, lines added / removed and last activity (same email = same person)
- **Hot files**: most frequently changed files — great for spotting fragile code
- **When** you commit: 24-hour sparkline, peak hour + weekday, night-owl percentage
- Conventional-commit **types** breakdown (`feat`, `fix`, `chore`…)
- `--since`, `--until`, `--author`, `--path`, `--all`, `--json`. Zero dependencies, just git

## 🚀 Quick Start

```bash
# run without installing
npx github:krishyaa06/prism-git-stats 

# or install globally
npm install -g github:krishyaa06/prism-git-stats
gitstats --since "1 month ago"
```

Requires Node.js 18.17+. No dependencies.

## 🛠️ Usage

```text
gitstats [dir] [options]

  -s, --since <when>     e.g. "3 months ago", 2026-01-01
  -u, --until <when>
  -a, --author <name>    only this author
  -p, --path <path>      only this folder / file
      --all              all branches
  -n, --top <n>          rows in tables (default 5)
  -w, --weeks <n>        heatmap width (default 26)
      --json             machine-readable output
```

### Examples

```bash
gitstats --since "1 month ago"      # this month
gitstats -p src/components -n 10     # hotspots in one folder
gitstats --author soumya --json      # your own numbers, for a script
```

Want to try it on a busy repo? `sh examples/make-demo-repo.sh /tmp/demo && gitstats /tmp/demo` builds a fake 6-month history with 4 authors.

## 📁 Project Structure

```
prism-git-stats/
├── assets/
│   ├── logo.png
│   └── logo.svg
├── bin/
│   └── gitstats.js   # CLI entry
├── examples/
│   └── make-demo-repo.sh   # fake history generator
├── src/
│   ├── index.js   # git log parser + stats + heatmap
│   └── ui.js   # colours, tables
├── test/
│   └── gitstats.test.js
├── .gitignore
├── LICENSE
└── package.json
```

## 🧪 Tests

```bash
npm test
```

Tests use the built-in `node:test` runner, so there is nothing to install. CI runs them on Node 20 and 22.

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feature/my-idea`
2. Make your change and add a test in `test/`
3. Run `npm test` and open a Pull Request

## 🔷 Part of Prism Protocol

Prism Git Stats is one of the open-source tools built by [Prism Protocol](https://dc.gg/prismprotocol), a tech community where young builders learn, ship and compete together.

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/krishyaa06"><img src="https://github.com/krishyaa06.png" width="90" style="border-radius:50%" /><br><b>Soumya Bhandare</b></a><br>
      <sub>Founder @ Prism Protocol</sub>
    </td>
    <td>
      <a href="https://dc.gg/prismprotocol"><img src="https://img.shields.io/badge/Discord-Prism%20Protocol-5865F2?style=for-the-badge&logo=discord&logoColor=white" /></a><br>
      <a href="https://instagram.com/prism_protocol_"><img src="https://img.shields.io/badge/Instagram-@prism__protocol__-E4405F?style=for-the-badge&logo=instagram&logoColor=white" /></a><br>
      <a href="https://x.com/krishyaa06"><img src="https://img.shields.io/badge/X-@krishyaa06-000000?style=for-the-badge&logo=x&logoColor=white" /></a>
    </td>
  </tr>
</table>

## 📄 License

Released under the [MIT License](LICENSE).

<p align="center">
  <b>If you like this project, consider giving it a ⭐</b><br>
  <sub>"Build. Create. Compete." · Made with ⚡ by Prism Protocol</sub>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00D2FF,50:3DDC97,100:07060f&height=110&section=footer" width="100%" />
