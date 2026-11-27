// Headless balance check: plays every stage N times with scripted player profiles and prints
// average utilization, quality, star distribution [0★/1★/2★/3★], XP and finish time.
// Run with `npm run sim`. Great prompts should beat ok/vague/trap play at every stage.
import { useGame, allDone, isUnlocked, briefMailId } from '../src/game/store'
import { STAGES } from '../src/scenarios/index'

type Policy = {
  name: string
  react: number      // seconds per click/decision
  inspect: number    // seconds to look at browser/explorer
  mail: number       // seconds to read a mail
  tier: 'great' | 'ok' | 'trap' | 'vague'
  polishFor: number  // seconds to keep polishing after all fixed (Infinity = until endAt)
  endAt?: number     // force end at this time
  safe: boolean      // answers blocks well
}

const G = useGame
function run(stage: number, p: Policy) {
  G.getState().openStage(stage, true)
  G.getState().beginPlay()
  let busyUntil = 0
  let doneSince: number | undefined
  const dt = 0.1
  for (let step = 0; step < 6000; step++) {
    const s = G.getState()
    const t = s.time
    if (p.endAt !== undefined && t >= p.endAt) break
    const finished = allDone(s.agents, t)
    if (finished && doneSince === undefined) doneSince = t
    if (p.endAt === undefined && finished && t - doneSince! >= p.polishFor && s.agents.every(a => a.status !== 'working' && a.status !== 'blocked')) break
    if (t >= busyUntil) {
      // pick agent: blocked first, then idle/done with something to do
      const order = s.agents.map((a, i) => i)
      const wants = (i: number) => {
        const a = s.agents[i]
        if (a.status === 'blocked') return 0
        if (a.status === 'idle' || a.status === 'done') {
          if (a.open.length === 0 && a.built) return doneSince !== undefined && t - doneSince >= p.polishFor ? 9 : (p.polishFor > 0 ? 2 : 9)
          return 1
        }
        return 9
      }
      const best = order.reduce((b, i) => (wants(i) < wants(b) ? i : b), 0)
      if (wants(best) < 9) {
        const a = s.agents[best]
        s.selectAgent(best)
        if (a.status === 'blocked') {
          const opts = a.blocked!.options
          let k = opts.findIndex(o => o.effect === (p.safe ? 'caught' : 'disaster'))
          if (k < 0) k = opts.findIndex(o => o.effect === 'compact')
          if (k < 0) k = opts.findIndex(o => o.effect === 'always')
          if (k < 0) k = opts.findIndex(o => o.effect === 'continue')
          if (k < 0) k = 0
          G.getState().answer(k)
          busyUntil = t + p.react
        } else {
          const want = !a.built ? (p.tier === 'great' ? 'great' : p.tier) : a.open.length ? p.tier : 'polish'
          let idx = a.choices.findIndex(c => c.tier === want)
          if (idx < 0) idx = a.choices.findIndex(c => c.tier === 'ok' || c.tier === 'great')
          const c = a.choices[idx]
          if (c && !isUnlocked(G.getState(), a, c)) {
            // go look
            if (c.build || c.lock === 'mail') {
              const m = G.getState().mails.find(m => (c.build ? m.id === briefMailId(a.projectId) : m.projectId === a.projectId && m.issueId === c.issueId))
              G.getState().readMail(m!.id); G.getState().focus('mail'); busyUntil = t + p.mail
            } else if (c.lock === 'browser') { G.getState().setBrowserTab(a.projectId); G.getState().focus('browser'); busyUntil = t + p.inspect }
            else { G.getState().setExplorerProject(a.projectId); G.getState().focus('explorer'); busyUntil = t + p.inspect }
          } else if (c) {
            G.getState().focus('terminal')
            G.getState().send(idx)
            busyUntil = t + p.react
          }
        }
      }
    }
    G.getState().tick(dt)
  }
  G.getState().endStage()
  return { ...G.getState().result!, time: G.getState().time }
}

const base: Policy = { name: '', react: 2, inspect: 3, mail: 6, tier: 'great', polishFor: 0, safe: true }
const policies: Policy[] = [
  { ...base, name: 'great, fast human, stop when done' },
  { ...base, name: 'great, medium human (r3 i4.5 m9)', react: 3, inspect: 4.5, mail: 9 },
  { ...base, name: 'great, slow human (r4 i6 m12)', react: 4, inspect: 6, mail: 12 },
  { ...base, name: 'great + polish 60s', polishFor: 60 },
  { ...base, name: 'great + polish 300s', polishFor: 300 },
  { ...base, name: 'ok prompts only (no inspecting)', tier: 'ok' },
  { ...base, name: 'ok prompts, medium human', tier: 'ok', react: 3, inspect: 4.5, mail: 9 },
  { ...base, name: 'vague only', tier: 'vague' },
  { ...base, name: 'trap spam', tier: 'trap' },
  { ...base, name: 'great, blind approve', safe: false },
  { ...base, name: 'great, quit at 65s', endAt: 65 },
]
const N = 200
for (const stage of [0, 1, 2]) {
  console.log(`\n== Stage ${stage} (${STAGES[stage].projects.join(',')})`)
  for (const p of policies) {
    let u = 0, q = 0, st = 0, xp = 0, tm = 0, fin = 0; const dist = [0, 0, 0, 0]
    for (let i = 0; i < N; i++) { const r = run(stage, p); u += r.utilization; q += r.quality; st += r.stars; xp += r.xp; tm += r.time; fin += r.finishTime ?? r.time; dist[r.stars]++ }
    console.log(`${p.name.padEnd(36)} util ${(u / N * 100).toFixed(0).padStart(3)}%  qual ${(q / N * 100).toFixed(0).padStart(3)}%  stars ${(st / N).toFixed(2)} [${dist.join('/')}]  xp ${(xp / N).toFixed(0).padStart(4)}  t ${(tm / N).toFixed(0)}s  fin ${(fin / N).toFixed(0)}s`)
  }
}
