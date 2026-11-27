import { beforeEach, describe, expect, it, vi } from 'vitest'
import { briefMailId, useGame } from './store'
import { PROJECTS } from '../scenarios'
import type { Agent, BlockedEvent } from './types'

const G = useGame
const state = () => G.getState()
const agent = () => state().agents[0]
const patchAgent = (over: Partial<Agent>) => G.setState({ agents: state().agents.map((a, i) => (i === 0 ? { ...a, ...over } : a)) })

/** Tick until the first agent is no longer working (or give up after `max` seconds). */
function runUntilIdle(max = 60) {
  for (let t = 0; t < max && agent().status === 'working'; t += 0.1) state().tick(0.1)
}

function buildTodo() {
  state().readMail(briefMailId('todo'))
  const idx = agent().choices.findIndex((c) => c.tier === 'great')
  state().send(idx)
  runUntilIdle()
}

beforeEach(() => {
  // 0.99 never fires a permission prompt (and keeps ok/vague rolls deterministic).
  vi.spyOn(Math, 'random').mockReturnValue(0.99)
  G.setState({ progress: { stars: [], xp: 0 }, sessions: {} })
  state().openStage(0, true)
  state().beginPlay()
})

describe('starting a stage', () => {
  it('creates one idle agent per project and an unread brief in the inbox', () => {
    expect(state().agents.map((a) => a.projectId)).toEqual(['todo'])
    expect(agent().status).toBe('idle')
    expect(state().mails).toHaveLength(1)
    expect(state().mails[0].read).toBe(false)
    expect(state().focused).toBe('mail')
  })
})

describe('prompts', () => {
  it('refuses the sharp build prompt until the brief is read', () => {
    const idx = agent().choices.findIndex((c) => c.tier === 'great')
    state().send(idx)
    expect(agent().status).toBe('idle')
    expect(state().toast).toBeDefined()

    state().readMail(briefMailId('todo'))
    state().send(idx)
    expect(agent().status).toBe('working')
  })

  it('builds the project and queues its issues', () => {
    buildTodo()
    expect(agent().status).toBe('done')
    expect(agent().built).toBe(true)
    expect(agent().open).toEqual(PROJECTS.todo.issues.map((i) => i.id))
    expect(agent().choices.length).toBeGreaterThan(0)
  })

  it('never offers a shortcut prompt while a regression is open', () => {
    patchAgent({ built: true, status: 'done', open: ['ugly'] })
    const trap = { id: 't', label: { en: 'trap', ko: 'trap' }, tier: 'trap' as const, issueId: 'ugly', seconds: 1 }
    patchAgent({ choices: [trap] })
    state().send(0)
    runUntilIdle()
    expect(agent().open[0]).toBe('regression')
    expect(agent().choices.some((c) => c.tier === 'trap')).toBe(false)
  })
})

describe('permission prompts', () => {
  const danger: BlockedEvent = {
    kind: 'danger',
    title: { en: 'Run command?', ko: '명령을 실행할까요?' },
    detail: 'rm -rf src',
    options: [
      { label: 'Yes', effect: 'disaster' },
      { label: 'No', effect: 'caught' },
    ],
  }

  it('counts a blindly approved destructive command and ships a regression', () => {
    patchAgent({ built: true, status: 'blocked', blocked: danger, open: [] })
    state().answer(0)
    expect(state().disasters).toBe(1)
    expect(agent().open).toContain('regression')
    expect(agent().status).toBe('working')
  })

  it('rewards refusing it', () => {
    patchAgent({ built: true, status: 'blocked', blocked: danger })
    state().answer(1)
    expect(state().caught).toBe(1)
    expect(state().disasters).toBe(0)
  })
})

describe('the shift clock', () => {
  it('stops when every task is done, and polish afterwards adds no busy time', () => {
    patchAgent({ built: true, status: 'done', open: [], workingTime: 20 })
    G.setState({ time: 50 })
    state().tick(0.1)
    expect(state().finishedAt).toBeCloseTo(50.1)

    const polish = { id: 'p', label: { en: 'polish', ko: 'polish' }, tier: 'polish' as const, seconds: 8 }
    patchAgent({ choices: [polish] })
    state().send(0)
    for (let i = 0; i < 20; i++) state().tick(0.1)
    expect(agent().workingTime).toBe(20)
    expect(state().finishedAt).toBeCloseTo(50.1)
  })

  it('scores the shift on the finish time', () => {
    patchAgent({ built: true, status: 'done', open: [], fixed: PROJECTS.todo.issues.map((i) => i.id) })
    G.setState({ time: 60 })
    state().tick(0.1)
    G.setState({ time: 500 })
    state().endStage()
    expect(state().screen).toBe('result')
    expect(state().result!.finishTime).toBeCloseTo(60.1)
    expect(state().result!.stars).toBe(3)
  })
})

describe('progress and sessions', () => {
  it('keeps the best stars per stage when a later run is worse', () => {
    patchAgent({ built: true, status: 'done', open: [], fixed: PROJECTS.todo.issues.map((i) => i.id) })
    state().tick(0.1)
    state().endStage()
    const xp = state().progress.xp
    expect(state().progress.stars[0]).toBe(3)
    expect(xp).toBeGreaterThan(0)

    state().openStage(0, true)
    state().beginPlay()
    state().tick(1)
    state().endStage()
    expect(state().result!.stars).toBe(0)
    expect(state().progress.stars[0]).toBe(3)
    expect(state().progress.xp).toBe(xp) // an empty shift earns nothing
    expect(JSON.parse(localStorage.getItem('herdr-tycoon:v1')!).stars[0]).toBe(3)
  })

  it('resumes a saved stage with its clock and mistakes intact', () => {
    patchAgent({ built: true, status: 'done', open: [] })
    G.setState({ time: 42, disasters: 1 })
    state().tick(0.1)
    state().goTitle()

    state().openStage(1, true) // play something else in between
    state().openStage(0)
    expect(state().screen).toBe('playing')
    expect(state().time).toBeCloseTo(42.1)
    expect(state().finishedAt).toBeCloseTo(42.1)
    expect(state().disasters).toBe(1)
  })

  it('starts over when asked, discarding the saved session', () => {
    G.setState({ time: 30, disasters: 2 })
    state().goTitle()
    state().openStage(0, true)
    expect(state().time).toBe(0)
    expect(state().disasters).toBe(0)
    expect(state().finishedAt).toBeUndefined()
    expect(state().sessions[0]).toBeUndefined()
  })
})

describe('stage 3: Crunch Time', () => {
  it('removes the committed attendee list when the leak is fixed', () => {
    state().openStage(3, true)
    state().beginPlay()
    const i = state().agents.findIndex((a) => a.projectId === 'rsvp')
    G.setState({ agents: state().agents.map((a, k) => (k === i ? { ...a, built: true, status: 'done', open: ['leak'], files: [{ path: 'data/attendees.csv', mark: 'warn' }] } : a)) })
    state().selectAgent(i)
    const fix = { id: 'f', label: { en: 'fix', ko: 'fix' }, tier: 'great' as const, issueId: 'leak', seconds: 1 }
    G.setState({ agents: state().agents.map((a, k) => (k === i ? { ...a, choices: [fix], inspected: { ...a.inspected, explorer: true } } : a)) })
    state().send(0)
    for (let t = 0; t < 2; t += 0.1) state().tick(0.1)
    const rsvp = state().agents[i]
    expect(rsvp.fixed).toContain('leak')
    expect(rsvp.files.map((f) => f.path)).not.toContain('data/attendees.csv')
  })
})

describe('inbox per stage', () => {
  it('gives returning projects a new brief written for that stage', () => {
    const subjects = [0, 1, 2, 3].map((st) => {
      state().openStage(st, true)
      return state().mails.find((m) => m.id === briefMailId('todo'))!.subject.en
    })
    expect(new Set(subjects).size).toBe(subjects.length)
  })

  it('only holds mail for the projects in the stage', () => {
    state().openStage(2, true)
    expect(state().mails.map((m) => m.projectId).sort()).toEqual(['cafe', 'todo', 'weather'])
  })

  it('keeps the TV hint in a returning weather brief, which its mail-only issue relies on', () => {
    state().openStage(3, true)
    const weather = state().mails.find((m) => m.id === briefMailId('weather'))!
    expect(weather.issueId).toBe('tvsize')
    expect(weather.body.en).toMatch(/TV/)
    expect(weather.subject.en).not.toBe(PROJECTS.weather.brief.subject.en)
  })
})
