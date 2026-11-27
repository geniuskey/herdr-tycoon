// Headless balance check: plays every stage N times with scripted player profiles and prints
// average utilization, quality, star distribution [0★/1★/2★/3★], XP and finish time.
// Run with `npm run sim`. Sharp prompts should beat ok/vague/trap play at every stage.
import { FAST, MEDIUM, SLOW, play, type Policy } from '../src/game/autoplay'
import { STAGES } from '../src/scenarios/index'

const policies: Policy[] = [
  FAST,
  MEDIUM,
  SLOW,
  { ...FAST, name: 'great + polish 60s', polishFor: 60 },
  { ...FAST, name: 'ok prompts only (no inspecting)', tier: 'ok' },
  { ...MEDIUM, name: 'ok prompts, medium human', tier: 'ok' },
  { ...FAST, name: 'vague only', tier: 'vague' },
  { ...FAST, name: 'trap spam', tier: 'trap' },
  { ...FAST, name: 'great, blind approve', safe: false },
  { ...FAST, name: 'great, quit at 65s', endAt: 65 },
]

const N = Number(process.env.N ?? 200)
for (const [stage, def] of STAGES.entries()) {
  console.log(`\n== Stage ${stage} (${def.projects.join(',')}) par ${def.par}s`)
  for (const p of policies) {
    let u = 0, q = 0, st = 0, xp = 0, fin = 0
    const dist = [0, 0, 0, 0]
    for (let i = 0; i < N; i++) {
      const r = play(stage, p)
      u += r.utilization
      q += r.quality
      st += r.stars
      xp += r.xp
      fin += r.finishTime ?? r.time
      dist[r.stars]++
    }
    const pct = (x: number) => `${((x / N) * 100).toFixed(0).padStart(3)}%`
    console.log(
      `${p.name.padEnd(34)} util ${pct(u)}  qual ${pct(q)}  stars ${(st / N).toFixed(2)} [${dist.join('/')}]  xp ${(xp / N).toFixed(0).padStart(4)}  fin ${(fin / N).toFixed(0)}s`,
    )
  }
}
