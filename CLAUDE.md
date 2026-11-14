# Holiday Hue

**Holiday Hue dresses the house's Philips Hue lights for the holidays.** A household member picks a
theme (Candy Cane, Red + Green, Classic Bulbs, Rainbow, Hearth, Winter White, or any solid color), a
pattern (Steady, Twinkle, Alternate, Fade), speed, brightness, and which room — and an always-on
**runner** on the umbrel box keeps the bulbs animating after the phone is locked.

Architecture, quality bar, and toolchain descend from `~/repo/spork` (via `~/repo/stoop`); CI shape
from `~/repo/jpc-noms`. When a pattern is unclear here, those are the reference implementations.

## How we work together (read this first)

The person directing you (John) owns the **product** — WHAT it does. **You own the HOW**: architecture,
code quality, testing, every technical decision below.

- **Never ask him to make a technical call** (coverage, CRAP, lint, library choices, schema design,
  bundle ids). Decide silently to the standards here.
- **Translate vague ideas into Gherkin** (`e2e/features/<slice>/*.feature`) and confirm those.
- **Only escalate genuine product questions** — behavior, scope, copy, what a screen does.

## Workflow: specs-first vertical slices

1. Spec first (`.feature` + steps in `e2e/steps/`). 2. Scaffold backend only as the slice needs it.
2. Implement. 4. `npm run quality` green. 5. Deploy + seed if the backend changed
   (`AWS_PROFILE=personal npx ampx sandbox --once`, `npm run seed`). 6. Conventional commit, push, PR,
   CI green. If the runner changed, the `runner-image` workflow publishes a new image; deploy it with a
   pull on umbrel (see Key facts).

### PR titles

`type(scope): what changed`, from the reader's point of view. No phase numbers, no issue soup
(`Closes #N` in the body). Good: `feat(control): fade pattern flows the palette across rooms`.

### PR demo artifacts

Any user-visible change needs a screenshot/video in the PR body, generated from the slice's own
Gherkin test (`VIDEO=1 npm run test:e2e` records `.webm` under `test-results/`). Upload to
`files.jpc.io` and paste the permanent `/d/` URL (a `curl -I` 307 is expected — the redirect target
expires, the `/d/` link does not):

```bash
FILE_PATH="test-results/<…>/video.webm"; FILENAME=$(basename "$FILE_PATH")
HASH=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 5)
AWS_PROFILE=personal aws s3 cp "$FILE_PATH" \
  "s3://amplify-d1wnjkkkrwiiql-mai-imagehostbucketaac3bfe7-aark0f5h8nw8/public/public/${HASH}-${FILENAME}" --region us-west-2
echo "https://files.jpc.io/d/${HASH}-${FILENAME}"
```

## Stack

- **Client:** Ionic 8 + React 19 + TypeScript strict + Vite + Capacitor (iOS + Android). react-query
  for server state.
- **Backend:** AWS Amplify Gen2 — Cognito (household auth) + AppSync + DynamoDB. No Lambdas.
- **Runner:** Node 22 + tsx in Docker on the umbrel box (`runner/`), talking to the Hue bridge over
  CLIP v2 (`https://192.168.4.47/clip/v2`). Published as `ghcr.io/johnpc/holiday-hue-runner`.

## The three-part shape (keep the seams sharp)

- **`src/domain/`** — PURE, shared by app and runner: `themes.ts` (palettes), `patterns.ts`,
  `color.ts` (hex ↔ rgb, lerp, hex → CIE xy), `scene.ts` (SceneState, clamps, speed → tick interval),
  `sceneRow.ts` (stored row ↔ state), `frame.ts` (`renderFrame`: the per-light colors for a tick,
  with injected rng). No React, no Amplify, no Node APIs here.
- **`src/features/`** — the app. `control/` (the Lights screen), `settings/`, `auth/`,
  `household/` (the editors-group gate), `shell/` (Toast, LoadState, TabBar, ErrorBoundary…).
- **`runner/`** — `animator.ts` (`planTick`: frame → only the changed lights, paced to the bridge
  limit), `loop.ts` (scheduler), `hueClient.ts` (CLIP v2), `inventory.ts` (lights ↔ rooms),
  `mirror.ts` (Light + RunnerStatus writes), `sceneSource.ts` (load + subscribe), `main.ts` (wiring).
  The runner imports `src/domain` relatively; it never imports from `src/features`.

### Data models (all household-only)

- **`Scene`** (id `main`) — `powerOn`, `themeId`, `patternId`, `speed` 1–10, `brightness` 1–100,
  `customColor` (#rrggbb for `solid`), `target` (`all` or a Hue room id). The field is `powerOn`, not
  `on`: AppSync rejects a field named `on` (GraphQL keyword) — the schema failed to stabilize.
- **`Light`** — the runner's mirror of the bridge inventory (`hueId`, `name`, `roomId`, `roomName`,
  `reachable`, `supportsColor`, `lastSeenAt`). The app only reads it.
- **`RunnerStatus`** (id `main`) — heartbeat; the app calls the runner online if it is < 90s old.

### Amplify auth contract

Every model grants ONLY `allow.group('editors')` for read + write, and the client
(`src/lib/dataClient.ts`) uses **`authMode: 'userPool'`** for everything. There is no guest grant and
no plain-authenticated grant **on purpose** — this app controls a real house. A signed-up account that
isn't in `editors` gets the "Not in the household yet" screen (`HouseholdGate`). Add a household
member with `aws cognito-idp admin-add-user-to-group --group-name editors`. The runner signs in as a
household account too (`RUNNER_USERNAME`/`RUNNER_PASSWORD`).

### Writes are optimistic, never refetch-after-write

`useOptimisticMutation` (`src/lib/`) applies the patch to the react-query cache at tap time, rolls
back on error (global toast), and does NOT invalidate on success. Reconciliation is the read path's
job: `useSceneLive` (AppSync `Scene.onUpdate` subscription) + focus refetch. The runner's `loop`
treats every scene change as a full resend so the new look lands on the next tick.

## Code organization

`useX.ts` hooks hold logic; `xApi.ts` holds all server state (react-query over the Amplify client);
`X.tsx` renders; `x.ts` pure helpers; `X.css` consumes `--hh-*` tokens from `src/theme/variables.css`
— never hardcoded hex/px in feature CSS. Tests colocated. Dark mode: tokens under
`prefers-color-scheme: dark` AND `[data-theme='dark']` on `<html>` (Settings → Appearance).

## Quality gates (non-negotiable — CI + husky pre-commit enforce them)

`npm run quality` = lint → format → lines → dead → dup → halstead → features → coverage → crap → build.

- **No `any`, no written `unknown`** (eslint). Model the shape. One tested boundary helper may own a
  single `eslint-disable-next-line` (`runner/hueClient.ts parseData` is the only one).
- **≤ 100 lines** per `.ts/.tsx` logic file in `src/`, `amplify/`, `runner/` (`check:lines`).
- **≥ 80 % coverage** per file; **CRAP ≤ 15**; **Halstead difficulty ≤ 20** per function.
- **No dead code** (`knip` — delete it; un-export internal-only types), **no duplicate blocks** ≥ 8
  lines / 70 tokens (`jscpd` — extract the shared unit).
- **Every `.feature` maps to a CI matrix area** (`check:features`).
- **Determinism:** inject `rng` and `now` (see `renderFrame`, `runnerOnline`, `planTick`).
- When a gate fails, **fix the code, never the gate.**

## Honest e2e

Every data-reading flow asserts on rendered **seeded** data (room names + counts, the stale-heartbeat
"Runner offline" chip), and write flows assert persistence across a reload — never just element
visibility. Sign in via the `a household member is signed in` step, which waits for the theme grid
before anything reads data.

## Definition of done

1. `npm run quality` green locally. 2. Gherkin + colocated unit tests added and passing. 3. Backend
   deployed + seeded if a model changed. 4. Conventional commit, pushed, PR open, **CI green**. 5. Demo
   artifact in the PR for any user-visible change. 6. README feature table updated.

## Commands

```bash
npm run dev            # Vite on :5173
npm run quality        # the full gate
npm run test:e2e       # bddgen + playwright
npm run e2e-config     # amplify_outputs.json from your sandbox (SANDBOX_IDENTIFIER=<id> for another)
npm run prod-config    # amplify_outputs.json from the prod (main) Amplify app — set AMPLIFY_APP_ID
npm run seed           # reset the backend to a known state (.env.local creds)
npm run ensure-editor  # idempotently create TEST_USERNAME in the pool + editors group
npm run runner         # run the Hue runner locally (RUNNER_* / HUE_* env, see runner/.env.example)
npm run gen:icons      # regenerate icons from assets/icon*.png
AWS_PROFILE=personal npx ampx sandbox --once
```

## Key facts

- **Repo:** `johnpc/holiday-hue`. **Bundle id:** `com.johncorser.holidayhue`. **Team:** `JW5SC3NYUV`.
- **AWS:** profile `personal`, region `us-west-2`. **Prod = Amplify Hosting app `d8ltdg7pl8oq`**
  (GitHub-connected; a push to `main` runs `ampx pipeline-deploy` + the web build; URL
  `https://main.d8ltdg7pl8oq.amplifyapp.com`). `npm run prod-config` pulls its outputs. The umbrel
  runner and John's phones use PROD. Personal dev sandbox: `amplify-holidayhue-xss-sandbox-df764a2c97`
  (`npm run e2e-config`) — local `npm run test:e2e` runs against it, never against prod, so a test
  flipping the lights off only flips the sandbox. CI deploys its own `ci-<run id>` sandbox per run
  and tears it down (`scripts/sandbox.mjs`); `sandbox-cleanup.yml` sweeps leaks.
- **CI runs on the Mac mini** (`runs-on: [self-hosted, mac-mini]`) for quality, acceptance, and iOS
  deploy — John's rule. Sandbox deploy/teardown + Android + the runner image build run on
  `ubuntu-latest` (they need the `aws` CLI / JDK / Docker). Runner dir on the mini:
  `~/actions-runner-holiday-hue`.
- **Hue bridge:** `192.168.4.47`, CLIP v2, 54 lights across 6 rooms (Main Floor, Bedroom, Garage,
  Dimmable Lights, Backyard, Cupola). The app key lives in John's `~/.zshrc` as `HUE_API_KEY` and in
  the runner stack's `.env` on umbrel. The bridge cert is Signify-signed, so the runner's transport
  disables TLS verification for that one LAN host.
- **Runner deploy (umbrel 192.168.7.211, Dockge dind):** stack `holiday-hue` at
  `/opt/stacks/holiday-hue/compose.yaml` (host path
  `~/umbrel/app-data/dockge/data/dockge-stacks/holiday-hue/`); its `.env` carries the creds and
  `AMPLIFY_OUTPUTS_JSON` (prod outputs, one line). Dind can't bind-mount stack files and the GHCR
  package is private until John flips it public, so today the image is built IN dind from a `git
archive` tarball: `git archive HEAD | ssh umbrel … 'sudo docker exec -i dockge_dockge_1 docker build
-t holiday-hue-runner:local -f runner/Dockerfile - < /tmp/hh.tar'` then `… compose up -d
--force-recreate`. Once the package is public, switch the stack image back to
  `ghcr.io/johnpc/holiday-hue-runner:main` and use `compose pull`.
- **Secrets (GitHub):** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TEST_USERNAME`,
  `TEST_PASSWORD`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_CONTENT`, `TEAM_ID`, `CI_KEYCHAIN_PASSWORD`.
- **Local:** `.env.local` holds `TEST_USERNAME`/`TEST_PASSWORD` (sandbox editor) and
  `RUNNER_USERNAME`/`RUNNER_PASSWORD` (the runner's household account).

## Decisions

- **Household-only, no guest mode.** Controls a real house; every model is editors-group only and the
  client is userPool-only. Revisit never.
- **Runner on umbrel, not the phone or a Lambda.** Patterns must keep running with the app closed, and
  the bridge is LAN-only (no Hue remote API).
- **One shared pure engine** (`src/domain`) for preview and bulbs; a pattern is a renderer, a theme is
  a palette — adding either is a data change, never a schema change.
- **Diff-and-pace, not fire-everything.** The runner sends only changed lights and paces to ~9
  commands/s; speed is a request, the bridge limit wins.
- **`powerOn` not `on`** on `Scene` — AppSync rejects the GraphQL keyword as a field name.
