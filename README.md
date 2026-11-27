# Herdr Tycoon 🐑

A tiny "keep every agent busy" simulator. Run several coding agents in a fake Windows 98
desktop, check their results in the Browser / Explorer / Mail, and pick the next prompt
with your mouse or arrow keys. No typing.

Goal: keep every herdr dot **yellow** (working).

| Dot | Meaning |
|---|---|
| ○ hollow white | idle: wasted time |
| 🟡 yellow | working: what you want |
| 🔴 red | needs you (permission / question) |
| 🟢 green | done: review the result, then send the next prompt |

## Run

```bash
npm install
npm run dev
```

## Controls

`←→` switch agent · `↑↓` choose option · `Enter` / `1-4` send · `N` jump to next waiting agent ·
`B` browser · `E` explorer · `M` mail · `Tab` cycle windows

## Content

- `src/scenarios/index.ts`: projects (brief, build prompts, issues with sharp/generic prompts) and stages
- `src/scenarios/events.ts`: permission / question events (red dot)
- `src/previews/index.tsx`: the intentionally ugly sites that improve as issues get fixed

## Credits

- Notification sounds (`public/sounds/done.mp3`, `request.mp3`) are from
  [herdr](https://github.com/herdrdev/herdr) (Apache-2.0).
