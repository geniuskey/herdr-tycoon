import { create } from 'zustand'
import { allDone, briefRead, isUnlocked, useGame, type WindowId } from './store'
import type { InspectSource } from './types'

/** Seconds without a key press or click before the hint highlight appears. */
export const IDLE_SECONDS = 5

interface IdleState {
  idle: boolean
}

export const useIdle = create<IdleState>(() => ({ idle: false }))

let timer: ReturnType<typeof setTimeout> | undefined

/** Reset the idle countdown. Called on every key press / click. */
export function markActive() {
  if (useIdle.getState().idle) useIdle.setState({ idle: false })
  clearTimeout(timer)
  timer = setTimeout(() => useIdle.setState({ idle: true }), IDLE_SECONDS * 1000)
}

export type HintReason = 'brief' | 'blocked' | 'waiting' | 'inspect' | 'mail'

/** Which window the player should look at next, and why. Undefined = nothing to point at. */
export function hintTarget(s: ReturnType<typeof useGame.getState>): { win: WindowId; reason: HintReason } | undefined {
  if (s.screen !== 'playing' || !s.agents.length || allDone(s.agents, s.time)) return undefined
  if (s.agents.some((a) => a.status === 'blocked')) return { win: 'terminal', reason: 'blocked' }

  const sel = s.agents[s.selected]
  if (sel && (sel.status === 'done' || sel.status === 'idle')) {
    // Work starts in the inbox: read the client's brief before the first prompt.
    if (!sel.built && !briefRead(s, sel.projectId)) return { win: 'mail', reason: 'brief' }
    const locked = sel.choices.find((c) => c.lock && !isUnlocked(s, sel, c))
    if (locked) return { win: locked.lock as InspectSource, reason: 'inspect' }
    return { win: 'terminal', reason: 'waiting' }
  }
  if (s.agents.some((a) => a.status === 'done' || a.status === 'idle')) return { win: 'terminal', reason: 'waiting' }
  if (s.mails.some((m) => !m.read)) return { win: 'mail', reason: 'mail' }
  return undefined
}

/** The hint to show now: after an idle spell, except the "read the brief" hint which shows right away. */
export function activeHint(s: ReturnType<typeof useGame.getState>, idle: boolean) {
  const t = hintTarget(s)
  return t && (idle || t.reason === 'brief') ? t : undefined
}

/** The hint for one window, or undefined when nothing should point at it. */
export function useHint(id: WindowId): HintReason | undefined {
  const idle = useIdle((s) => s.idle)
  return useGame((s) => {
    const t = activeHint(s, idle)
    return t?.win === id ? t.reason : undefined
  })
}
