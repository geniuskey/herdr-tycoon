import { describe, expect, it } from 'vitest'
import { allDone, computeResult, DEADLINE_FACTOR, useGame, utilizationOf } from './store'
import { PROJECTS } from '../scenarios'
import type { Agent } from './types'

const PAR = 80

/** A todo agent with the whole project finished. */
function finishedTodo(over: Partial<Agent> = {}): Agent {
  useGame.getState().openStage(0, true)
  const a = useGame.getState().agents[0]
  return { ...a, built: true, status: 'done', open: [], fixed: PROJECTS.todo.issues.map((i) => i.id), workingTime: 40, ...over }
}

describe('computeResult stars', () => {
  it('gives 3★ for finishing within par without disasters', () => {
    expect(computeResult([finishedTodo()], 0, 0, 200, PAR, PAR).stars).toBe(3)
  })

  it('drops to 2★ when a destructive command was approved', () => {
    expect(computeResult([finishedTodo()], 0, 1, 200, 60, PAR).stars).toBe(2)
  })

  it('gives 2★ just over par and 1★ past the deadline', () => {
    expect(computeResult([finishedTodo()], 0, 0, 999, PAR + 1, PAR).stars).toBe(2)
    expect(computeResult([finishedTodo()], 0, 0, 999, PAR * DEADLINE_FACTOR, PAR).stars).toBe(2)
    expect(computeResult([finishedTodo()], 0, 0, 999, PAR * DEADLINE_FACTOR + 1, PAR).stars).toBe(1)
  })

  it('caps an unfinished shift at 1★ and gives no speed XP', () => {
    const r = computeResult([finishedTodo()], 0, 0, 30, undefined, PAR)
    expect(r.stars).toBe(1)
    expect(r.finishTime).toBeUndefined()
  })

  it('gives 0★ below 60% quality, however fast', () => {
    const a = finishedTodo({ fixed: [], open: PROJECTS.todo.issues.map((i) => i.id) })
    expect(computeResult([a], 0, 0, 10, 10, PAR).stars).toBe(0)
  })

  it('counts a shipped regression against quality', () => {
    const clean = computeResult([finishedTodo()], 0, 0, 60, 60, PAR)
    const crashed = computeResult([finishedTodo({ open: ['regression'] })], 0, 0, 60, undefined, PAR)
    expect(crashed.fixed).toBe(clean.fixed - 1)
  })
})

describe('computeResult XP', () => {
  it('rewards a faster finish', () => {
    const fast = computeResult([finishedTodo()], 0, 0, 60, 60, PAR).xp
    const slow = computeResult([finishedTodo()], 0, 0, 200, 110, PAR).xp
    expect(fast).toBeGreaterThan(slow)
  })

  it('caps polish and caught-threat bonuses so grinding cannot farm XP', () => {
    const some = computeResult([finishedTodo({ polish: 5 })], 2, 0, 60, 60, PAR).xp
    const lots = computeResult([finishedTodo({ polish: 50 })], 40, 0, 600, 60, PAR).xp
    expect(lots).toBe(some)
  })
})

describe('utilization', () => {
  it('is measured up to the finish time, not the end of the shift', () => {
    const a = finishedTodo({ workingTime: 30 })
    expect(computeResult([a], 0, 0, 600, 60, PAR).utilization).toBeCloseTo(0.5)
    expect(utilizationOf([a], 0)).toBe(0)
  })
})

describe('allDone', () => {
  it('treats an agent that is only polishing as done', () => {
    const a = finishedTodo({ status: 'working', current: { id: 'x', label: { en: 'p', ko: 'p' }, tier: 'polish', seconds: 8 } })
    expect(allDone([a], 10)).toBe(true)
  })

  it('is false while an agent is fixing a real issue', () => {
    const a = finishedTodo({ status: 'working', current: { id: 'x', label: { en: 'f', ko: 'f' }, tier: 'great', seconds: 7 } })
    expect(allDone([a], 10)).toBe(false)
  })

  it('waits for late client mails to arrive', () => {
    useGame.getState().openStage(1, true)
    const cafe = useGame.getState().agents.find((a) => a.projectId === 'cafe')!
    const done = { ...cafe, built: true, status: 'done' as const, open: [] }
    const at = PROJECTS.cafe.lateMails![0].at
    expect(allDone([done], at - 1)).toBe(false)
    expect(allDone([done], at)).toBe(true)
  })
})
