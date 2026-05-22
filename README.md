# v-desktop

**Desktop actuarial workbench. Powered by v-star.**

Stop wrestling with Excel. Stop praying your VBA doesn't crash on the big file. v-desktop puts a full actuarial toolkit in a native desktop app — present values, annuities, mortality tables, reserves, Monte Carlo simulations, risk metrics, and census processing — all running on the v-star engine.

![Wails build](https://github.com/lubasinkal/v-desktop/actions/workflows/build.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-green)
![Latest release](https://img.shields.io/github/v/release/lubasinkal/v-desktop)

[![Windows](https://img.shields.io/badge/Windows-download-blue?logo=windows)](https://github.com/lubasinkal/v-desktop/releases/latest)
[![macOS](https://img.shields.io/badge/macOS-download-black?logo=apple)](https://github.com/lubasinkal/v-desktop/releases/latest)
[![Linux](https://img.shields.io/badge/Linux-download-orange?logo=linux)](https://github.com/lubasinkal/v-desktop/releases/latest)

Grab the latest build from [Releases](https://github.com/lubasinkal/v-desktop/releases/latest).

| Platform | File to download |
|----------|-----------------|
| Windows | `windows-v-desktop-installer.exe` (installer) or `windows-v-desktop.exe` (portable) |
| macOS | `macos-v-desktop` |
| Linux | `linux-v-desktop` |

---

## The Pitch

Every actuarial tool I've used is either slow (Excel), opaque (proprietary), or both. So I built v-desktop:

- **9 tools** in one tabbed app: PV, annuities, mortality, reserves, Monte Carlo, risk, census, rates
- **Dark terminal theme** — looks good, easier on the eyes during late-night runs
- **Real actuarial math** — backed by [v-star](https://github.com/lubasinkal/v-star), which does 380M PV calculations per second
- **Cross-platform** — Windows, macOS, Linux, one binary
- **No cloud** — everything runs locally on your machine

---

## Tools

| Tab | What it does |
|-----|-------------|
| **Dashboard** | Quick calculators: PV, life annuity, Monte Carlo |
| **PV & Duration** | Present value (standard & v*), bulk PV, Macaulay/Modified duration, convexity |
| **Annuities** | 10 annuity types: whole-life, term, deferred, NSP, endowment, approximations |
| **Mortality** | Browse CSO 2017 tables, query qx/px/ex, chart curves, load custom CSVs |
| **Reserves** | Net premium, gross premium, prospective, retrospective |
| **Monte Carlo** | GBM & Vasicek simulations with path visualization and distribution charts |
| **Risk** | VaR (95%/99%), CTE (95%/99%), confidence intervals, standard error |
| **Census** | CSV census processing — sequential or parallel with configurable workers |
| **Rates** | Rate converter (effective/nominal/force) and annuity-certain |

---

## Built With

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Wails v2](https://wails.io/) — Go + native WebView |
| Actuarial engine | [v-star](https://github.com/lubasinkal/v-star) v0.7.0 |
| Frontend | Vanilla JS, CSS3, HTML |
| Charts | [Chart.js](https://www.chartjs.org/) v4.5.1 |
| Bundler | [Vite](https://vitejs.dev/) v3 |
| Mortality tables | CSO 2017 Male & Female (embedded, 0–120) |

---

## Quick Start

```bash
# Prerequisites: Go 1.26+, Node 20+
# Install Wails CLI
go install github.com/wailsapp/wails/v2/cmd/wails@v2.12.0

# Clone and run
git clone https://github.com/lubasinkal/v-desktop.git
cd v-desktop
wails dev
```

This opens the app in a native window with hot-reload on frontend changes.

### Build a Release Binary

```bash
wails build
# Output: build/bin/v-desktop (or v-desktop.exe on Windows)
```

Or use the [GitHub Actions workflow](.github/workflows/build.yml) — tag a commit and it builds Linux, Windows (with NSIS installer), and macOS automatically.

---

## Screenshots

*Coming soon — the app has 9 tabs. Open an issue if you want to see specific ones.*

---

## Who It's For

| Person | Why v-desktop |
|--------|--------------|
| **Actuarial student** | Check your manual calculations against a real engine. Learn by doing. |
| **Actuary** | Quick ad-hoc calculations without spinning up Excel or R. |
| **Analyst** | Process census CSVs, run simulations, get risk metrics — all from one app. |
| **Developer** | Example of a production Wails + v-star app. Steal the patterns. |

---

## Project Structure

```
v-desktop/
  main.go              -- Entry point, Wails bootstrap, embeds mortality tables
  app.go               -- App struct, wires 7 service backends, 29+ bound methods
  wails.json           -- Wails project config (1280×900 window)
  pkg/
    models/            -- Shared request/response structs
    services/          -- 7 services: rates, mortality, annuities, reserves, risk, stochastic, census
  frontend/
    src/
      main.js          -- SPA entry, tab registration
      app.css          -- Dark theme (500+ lines)
      lib/             -- Tab navigation, Chart.js helpers
      components/      -- 9 tab component modules
  tables/              -- Embedded CSO 2017 mortality CSV files
  .github/workflows/   -- CI: multi-platform build + GitHub Release on tag
```

---

## Roadmap

- [ ] In-app CSV census results export
- [ ] Scenario comparison side-by-side
- [ ] More mortality table sources (SOC, pension tables)
- [ ] v-star API for custom scripting

---

## License

MIT — do whatever you want with it. See [LICENSE](./LICENSE).
