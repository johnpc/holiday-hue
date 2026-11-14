<p align="center">
  <img src="assets/banner.png" alt="Holiday Hue — dress your Philips Hue lights for the holidays" width="100%" />
</p>

# Holiday Hue

**Dress your Philips Hue lights for the holidays — themes, twinkles, and color patterns that keep
running after you lock your phone.**

[![CI](https://github.com/johnpc/holiday-hue/actions/workflows/ci.yml/badge.svg)](https://github.com/johnpc/holiday-hue/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/license-MIT-green)

Pick a theme, pick a pattern, set the speed and brightness, and the whole house follows — 24/7, from
a tiny always-on runner on your home server, not from your phone. Household members sign in; nobody
else can touch the lights.

## Features

| Feature                                                                              | Status |
| ------------------------------------------------------------------------------------ | ------ |
| Themes: Candy Cane, Red + Green, Classic Bulbs, Rainbow, Hearth, Winter White, Solid | ✅     |
| Patterns: Steady, Twinkle, Alternate, Fade                                           | ✅     |
| Speed + brightness sliders                                                           | ✅     |
| Any solid color (swatches + color wheel)                                             | ✅     |
| Target all lights or one room                                                        | ✅     |
| Live on-screen preview driven by the same engine as the bulbs                        | ✅     |
| Runs after you close the app (umbrel runner + heartbeat/online chip)                 | ✅     |
| Changes sync live between phones (AppSync subscription)                              | ✅     |
| Light / Dark / System appearance                                                     | ✅     |
| Sign in, sign up, forgot password; household-only access                             | ✅     |
| Schedules (sunset → midnight)                                                        | ⬜     |
| Zones (Hue zones as targets, not just rooms)                                         | ⬜     |
| iOS TestFlight / Android APK                                                         | ⬜     |

## How it works

```
 phone (Ionic/React PWA, iOS, Android)        AWS Amplify Gen2                 home LAN
 ┌──────────────────────────────┐        ┌──────────────────────┐       ┌──────────────────┐
 │ pick theme/pattern/speed/…   │ write  │ Scene (desired state)│ sub   │ runner (Docker)  │ CLIP v2
 │ optimistic cache, live sub   ├───────▶│ Light inventory      │──────▶│ plans each tick, ├────────▶ Hue bridge
 │ online/offline chip          │◀───────│ RunnerStatus hb      │◀──────│ sends only diffs │          54 bulbs
 └──────────────────────────────┘  read  └──────────────────────┘ write └──────────────────┘
```

- **One desired state.** The app writes a single `Scene` row (theme, pattern, speed, brightness,
  on/off, target). Every tap is an optimistic cache write with rollback — never a refetch spinner.
- **The runner does the animating.** A small Node process on the umbrel box signs in as a household
  account, subscribes to the scene, and drives the bridge's lights over the local CLIP v2 API. It
  mirrors the bridge's light/room inventory back into the cloud so the app can list rooms without
  being on the LAN, and heartbeats every 30 seconds so the app can say online/offline.
- **Same engine everywhere.** `src/domain/` holds the pure theme palettes, pattern renderers
  (steady/twinkle/alternate/fade), color math (hex → CIE xy), and speed → interval mapping. The app's
  preview and the runner call the exact same `renderFrame`, so what you see is what the house does.
- **Bridge-friendly pacing.** The runner sends only the lights whose color/brightness changed and
  paces ticks to roughly nine commands per second, the bridge's comfortable limit. With many lights
  a very fast pattern naturally slows to what the bridge can take.

## Where the data comes from

Nothing is generated or scraped. Light and room names come from your own Hue bridge via the runner.
Theme palettes are hand-picked hex colors in `src/domain/themes.ts`. In CI and sandboxes the
inventory is a small seeded fixture, and the heartbeat is deliberately stale so the app reads
"Runner offline".

## Install

- **Web / PWA:** open the deployed app and "Add to Home Screen".
- **iOS:** TestFlight link coming once the first build is live.
- **Android:** debug APK attached to each GitHub Release.
- **Runner (home server):** see `runner/compose.yaml`. Create a `.env` beside it with
  `RUNNER_USERNAME`, `RUNNER_PASSWORD` (a household Cognito account), `HUE_APP_KEY`, and drop the
  backend's `amplify_outputs.json` next to it. The container publishes no ports.

## Develop

```bash
npm install
npm run e2e-config    # pull amplify_outputs.json from your sandbox
npm run dev           # http://localhost:5173
npm run quality       # the full gate (lint, format, lines, dead code, dup, Halstead, coverage, CRAP, build)
npm run test:e2e      # Gherkin acceptance tests (Playwright)
npm run runner        # run the Hue runner locally (needs RUNNER_* / HUE_* env)
```

See `CLAUDE.md` for the architecture, the Amplify auth contract, and the quality bar.
