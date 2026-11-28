# Herdr Tycoon 🐑

A tiny "keep every agent busy" simulator. Run several coding agents in a fake Windows 11
desktop, check their results in the Browser / Explorer / Mail, and pick the next prompt
with your mouse or arrow keys. No typing.

Goal: keep every herdr dot **yellow** (working).

| Dot | Meaning |
|---|---|
| ○ hollow | idle: wasted time |
| 🟡 yellow | working: what you want |
| 🔴 red | needs you (permission / question) |
| 🟢 green | done: review the result, then send the next prompt |

## Scoring

The shift clock stops the moment every task is done (optional polish doesn't count), so the score is about
how long your agents spend waiting for you, not how long they look busy.

- ★ quality ≥ 60%
- ★★ every task done within 1.6 × par
- ★★★ every task done within par, without approving a destructive command

Par times live on each stage in `src/scenarios/index.ts`. After changing timings or prompts, run
`npm test`: `src/game/balance.test.ts` plays every stage with scripted players (`src/game/autoplay.ts`)
and fails if sharp prompts stop beating generic, vague and shortcut play. `npm run sim` prints the
full numbers (`N=50 npm run sim` for a quicker run).

## Run

```bash
npm install
npm run dev
npm test        # scoring, store and balance tests (Vitest)
```

## Controls

`←→` switch agent · `↑↓` choose option · `Enter` / `1-4` send · `N` jump to next waiting agent ·
`B` browser · `E` explorer · `M` mail · `Tab` cycle windows

## Deploy

Every push to `main` runs the tests, builds, and publishes `dist/` to GitHub Pages
(`.github/workflows/deploy.yml`): <http://pages.euiyun.com/herdr-tycoon/>

## Languages

English and 한국어. The default follows the browser language. Switch on the title screen or with the
`EN`/`한` button in the taskbar tray; the choice is saved in localStorage and applies instantly, even mid-stage.

- `src/i18n/ui.ts`: UI strings (`en` is the source; `ko` must match its shape, enforced by TypeScript)
- Scenario text is written inline as `l('English', '한국어')` pairs

## Content

- `src/scenarios/index.ts`: projects (brief, build prompts, issues with sharp/generic prompts) and stages
- `src/scenarios/events.ts`: permission / question events (red dot)
- `src/previews/index.tsx`: the intentionally ugly sites that improve as issues get fixed

## Credits

- Notification sounds (`public/sounds/done.mp3`, `request.mp3`) are from
  [herdr](https://github.com/herdrdev/herdr) (Apache-2.0).
