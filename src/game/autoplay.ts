// Scripted player used by the balance simulator (`npm run sim`) and the balance tests.
// Not imported by the app. It drives the real store, one decision at a time, with a
// human-like delay per action so that player attention is the bottleneck it is in the game.
import { allDone, briefMailId, isUnlocked, useGame, type StageResult } from './store'

export interface Policy {
  name: string
  /** Seconds per click / decision. */
  react: number
  /** Seconds to look at the Browser or Explorer. */
  inspect: number
  /** Seconds to read a mail. */
  mail: number
  /** Prompt tier the player prefers once the project is built. */
  tier: 'great' | 'ok' | 'trap' | 'vague'
  /** Seconds to keep sending polish prompts once every task is done (the clock has stopped). */
  polishFor: number
  /** Force End shift at this stage time. */
  endAt?: number
  /** Refuse destructive commands (true) or approve them blindly (false). */
  safe: boolean
}

export const FAST: Policy = { name: 'great, fast human', react: 2, inspect: 3, mail: 6, tier: 'great', polishFor: 0, safe: true }
export const MEDIUM: Policy = { ...FAST, name: 'great, medium human', react: 3, inspect: 4.5, mail: 9 }
export const SLOW: Policy = { ...FAST, name: 'great, slow human', react: 4, inspect: 6, mail: 12 }

export type PlayResult = StageResult & { time: number }

/** Play one stage to the end and return its result. */
export function play(stage: number, p: Policy, maxSeconds = 600): PlayResult {
  const G = useGame
  G.getState().openStage(stage, true)
  G.getState().beginPlay()
  const dt = 0.1
  let busyUntil = 0
  while (G.getState().time < maxSeconds) {
    const s = G.getState()
    const t = s.time
    if (p.endAt !== undefined && t >= p.endAt) break
    const finished = allDone(s.agents, t)
    const polishing = finished && s.finishedAt !== undefined && t - s.finishedAt < p.polishFor
    if (p.endAt === undefined && finished && !polishing && s.agents.every((a) => a.status !== 'working' && a.status !== 'blocked')) break

    if (t >= busyUntil) {
      // Blocked agents first, then idle/done ones with real work, then (optionally) polish.
      const want = (i: number) => {
        const a = s.agents[i]
        if (a.status === 'blocked') return 0
        if (a.status !== 'idle' && a.status !== 'done') return 9
        if (a.built && a.open.length === 0) return polishing ? 2 : 9
        return 1
      }
      const best = s.agents.reduce((b, _, i) => (want(i) < want(b) ? i : b), 0)
      if (want(best) < 9) busyUntil = t + act(best, p)
    }
    G.getState().tick(dt)
  }
  G.getState().endStage()
  return { ...G.getState().result!, time: G.getState().time }
}

/** Take one action on agent `i`; returns how many seconds it cost the player. */
function act(i: number, p: Policy): number {
  const G = useGame
  G.getState().selectAgent(i)
  const a = G.getState().agents[i]

  if (a.status === 'blocked') {
    const opts = a.blocked!.options
    const prefer = [p.safe ? 'caught' : 'disaster', 'compact', 'always', 'continue']
    const k = prefer.map((e) => opts.findIndex((o) => o.effect === e)).find((x) => x >= 0) ?? 0
    G.getState().answer(k)
    return p.react
  }

  const tier = !a.built || a.open.length ? p.tier : 'polish'
  let idx = a.choices.findIndex((c) => c.tier === tier)
  if (idx < 0) idx = a.choices.findIndex((c) => c.tier === 'ok' || c.tier === 'great')
  const c = a.choices[idx]
  if (!c) return p.react

  if (!isUnlocked(G.getState(), a, c)) {
    // Go look where the hint is, then send on a later decision.
    if (c.build || c.lock === 'mail') {
      const m = G.getState().mails.find((m) => (c.build ? m.id === briefMailId(a.projectId) : m.projectId === a.projectId && m.issueId === c.issueId))!
      G.getState().readMail(m.id)
      G.getState().focus('mail')
      return p.mail
    }
    if (c.lock === 'browser') {
      G.getState().setBrowserTab(a.projectId)
      G.getState().focus('browser')
    } else {
      G.getState().setExplorerProject(a.projectId)
      G.getState().focus('explorer')
    }
    return p.inspect
  }

  G.getState().focus('terminal')
  G.getState().send(idx)
  return p.react
}

/** Small seeded PRNG (mulberry32) so balance runs are reproducible. */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
