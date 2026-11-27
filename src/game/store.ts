import { create } from 'zustand'
import type { Agent, BlockEffect, Choice, FileNode, Issue, LogLine, Mail } from './types'
import { POLISH_PROMPTS, PROJECTS, REGRESSION, STAGES, TRAP_PROMPTS, VAGUE_PROMPTS } from '../scenarios'
import { CONTEXT_EVENT, makeBlockedEvent } from '../scenarios/events'
import { playSound } from './sound'
import { join, ui, type L, type Text } from '../i18n'

export type WindowId = 'terminal' | 'browser' | 'explorer' | 'mail'
export type Screen = 'title' | 'intro' | 'playing' | 'result'

export interface WinState {
  id: WindowId
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
}

export interface StageResult {
  utilization: number
  quality: number
  fixed: number
  total: number
  polish: number
  caught: number
  stars: number
  xp: number
}

interface Progress {
  stars: number[]
  xp: number
}

/** A paused, in-progress stage. Restored when the player picks that stage again. */
export interface Session {
  time: number
  agents: Agent[]
  selected: number
  mails: Mail[]
  selectedMail?: string
  focused: WindowId
  browserTab: string
  explorerProject: string
  caught: number
}

interface GameState {
  screen: Screen
  stageIndex: number
  time: number
  agents: Agent[]
  selected: number
  cursor: number
  mails: Mail[]
  selectedMail?: string
  windows: WinState[]
  viewport: { w: number; h: number }
  focused: WindowId
  browserTab: string
  explorerProject: string
  caught: number
  toast?: { text: Text; until: number }
  result?: StageResult
  progress: Progress
  sessions: Record<number, Session>

  goTitle: () => void
  /** Resumes the stage's saved session if there is one, unless `fresh`. */
  openStage: (i: number, fresh?: boolean) => void
  /** Finish the shift: score the stage and show the result screen. */
  endStage: () => void
  /** Snapshot the running stage into `sessions` (and localStorage). */
  saveSession: () => void
  beginPlay: () => void
  tick: (dt: number) => void
  selectAgent: (i: number) => void
  stepAgent: (delta: number) => void
  nextAttention: () => void
  moveCursor: (delta: number) => void
  setCursor: (i: number) => void
  send: (choiceIndex?: number) => void
  answer: (optionIndex: number) => void
  focus: (id: WindowId) => void
  cycleFocus: () => void
  moveWindow: (id: WindowId, x: number, y: number) => void
  minimize: (id: WindowId) => void
  fitToViewport: () => void
  setBrowserTab: (projectId: string) => void
  setExplorerProject: (projectId: string) => void
  readMail: (id: string) => void
  showToast: (text: Text) => void
}

const STORAGE_KEY = 'herdr-tycoon:v1'

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* storage unavailable */
  }
  return { stars: [], xp: 0 }
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable */
  }
}

export const RANKS: { xp: number; title: L }[] = [0, 250, 600, 1000, 1500].map((xp, i) => ({ xp, title: ui((d) => d.ranks[i]) }))

export function rankFor(xp: number) {
  let r = RANKS[0]
  for (const k of RANKS) if (xp >= k.xp) r = k
  return r
}

const SESSIONS_KEY = 'herdr-tycoon:sessions:v1'

function loadSessions(): Record<number, Session> {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* storage unavailable or corrupt */
  }
  return {}
}

function saveSessions(sessions: Record<number, Session>) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch {
    /* storage unavailable */
  }
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

let uid = 0
// prefix keeps ids unique against choices restored from a saved session
const idPrefix = Math.random().toString(36).slice(2, 6)
const nextId = () => `c${idPrefix}${++uid}`

export function allIssues(projectId: string): Issue[] {
  const p = PROJECTS[projectId]
  return [REGRESSION, ...p.issues, ...(p.lateMails ?? []).map((m) => m.issue)]
}

export function getIssue(projectId: string, id: string): Issue {
  return allIssues(projectId).find((i) => i.id === id)!
}

function buildChoices(projectId: string): Choice[] {
  return shuffle(
    PROJECTS[projectId].buildChoices.map((b) => ({ id: nextId(), label: b.label, tier: b.tier, seconds: b.seconds, build: true })),
  )
}

function genChoices(agent: Agent): Choice[] {
  const open = agent.open
  if (open.length === 0) {
    return shuffle(POLISH_PROMPTS)
      .slice(0, 3)
      .map((label) => ({ id: nextId(), label, tier: 'polish' as const, seconds: 8 }))
  }
  const first = getIssue(agent.projectId, open[0])
  const second = open[1] ? getIssue(agent.projectId, open[1]) : first
  const choices: Choice[] = [
    { id: nextId(), label: first.great, tier: 'great', issueId: first.id, lock: first.visibleIn, seconds: 7 },
    { id: nextId(), label: second.ok, tier: 'ok', issueId: second.id, seconds: 11 },
    { id: nextId(), label: pick(VAGUE_PROMPTS), tier: 'vague', seconds: 14 },
  ]
  if (!open.includes('regression')) {
    choices.push({ id: nextId(), label: pick(TRAP_PROMPTS), tier: 'trap', issueId: first.id, seconds: 4 })
  }
  return shuffle(choices)
}

function applyFiles(files: FileNode[], add: FileNode[] = [], remove: (p: string) => boolean = () => false) {
  const base = files
    .filter((f) => !remove(f.path))
    .map((f) => (f.mark === 'warn' ? f : { path: f.path }))
  for (const a of add) {
    const ex = base.find((f) => f.path === a.path)
    if (ex) ex.mark = a.mark
    else base.push({ ...a })
  }
  return base.sort((a, b) => a.path.localeCompare(b.path))
}

const REMOVALS: Record<string, (p: string) => boolean> = {
  images: (p) => p.includes('/Imgs/'),
  secret: (p) => p === '.env',
  deadcode: (p) => p.includes('final_final'),
}


/** Is a locked "great" choice visible to the player right now? */
export function isUnlocked(state: Pick<GameState, 'mails'>, agent: Agent, choice: Choice) {
  if (!choice.lock) return true
  if (choice.lock === 'mail') {
    return state.mails.some((m) => m.projectId === agent.projectId && m.issueId === choice.issueId && m.read)
  }
  return agent.inspected[choice.lock]
}

function newAgent(projectId: string, idx: number): Agent {
  const p = PROJECTS[projectId]
  return {
    id: `agent-${idx}`,
    projectId,
    status: 'idle',
    built: false,
    fixed: [],
    open: [],
    polish: 0,
    progress: 0,
    seconds: 0,
    blockFired: false,
    choices: buildChoices(projectId),
    inspected: { browser: false, explorer: false, mail: false },
    autoEdits: false,
    slow: false,
    ctx: 4,
    log: [{ who: 'sys', text: `cwd: ~/projects/${p.name}` }],
    files: [],
    workingTime: 0,
  }
}

const TASKBAR_H = 48

function currentViewport() {
  if (typeof window === 'undefined') return { w: 1280, h: 800 - TASKBAR_H }
  return { w: window.innerWidth, h: window.innerHeight - TASKBAR_H }
}

function defaultWindows(): WinState[] {
  const { w: W, h: H } = currentViewport()
  const left = Math.max(8, Math.round(W * 0.01))
  const termW = Math.round(W * 0.5)
  const rightX = left + termW + 8
  const rightW = W - rightX - left
  const browserH = Math.round(H * 0.58)
  return [
    { id: 'terminal', x: left, y: 8, w: termW, h: H - 16, z: 4, minimized: false },
    { id: 'browser', x: rightX, y: 8, w: rightW, h: browserH, z: 3, minimized: false },
    { id: 'explorer', x: rightX, y: browserH + 16, w: Math.round(rightW * 0.45), h: H - browserH - 24, z: 2, minimized: false },
    {
      id: 'mail',
      x: rightX + Math.round(rightW * 0.45) + 8,
      y: browserH + 16,
      w: rightW - Math.round(rightW * 0.45) - 8,
      h: H - browserH - 24,
      z: 1,
      minimized: false,
    },
  ]
}

/** Every project is built, every arrived-or-pending issue fixed, and no agent is mid-task. */
export function allDone(agents: Agent[], time: number) {
  return (
    agents.length > 0 &&
    agents.every(
      (a) =>
        a.built &&
        a.open.length === 0 &&
        (a.status === 'done' || a.status === 'idle') &&
        (PROJECTS[a.projectId].lateMails ?? []).every((m) => time >= m.at),
    )
  )
}

function computeResult(agents: Agent[], caught: number, time: number): StageResult {
  const working = agents.reduce((s, a) => s + a.workingTime, 0)
  const utilization = Math.min(1, working / (agents.length * Math.max(1, time)))
  let total = 0
  let fixed = 0
  let polish = 0
  for (const a of agents) {
    const p = PROJECTS[a.projectId]
    total += p.issues.length + (p.lateMails ?? []).filter((m) => m.at <= time).length + 1 // +1 for build
    fixed += a.fixed.filter((f) => f !== 'regression').length + (a.built ? 1 : 0)
    if (a.open.includes('regression')) fixed -= 1
    polish += a.polish
  }
  const quality = Math.max(0, Math.min(1, (fixed + polish * 0.25) / total))
  // No time limit, so utilization only counts once real work is done (otherwise ending at 0:03 = 100%).
  const stars = quality >= 0.6 ? 1 + (utilization >= 0.5 ? 1 : 0) + (utilization >= 0.7 ? 1 : 0) : 0
  const xp = Math.round(utilization * quality * 100 + fixed * 15 + Math.min(polish, 5) * 6 + caught * 15 + stars * 20)
  return { utilization, quality, fixed, total, polish, caught, stars, xp }
}

export const useGame = create<GameState>((set, get) => ({
  screen: 'title',
  stageIndex: 0,
  time: 0,
  agents: [],
  selected: 0,
  cursor: 0,
  mails: [],
  windows: defaultWindows(),
  viewport: currentViewport(),
  focused: 'terminal',
  browserTab: 'todo',
  explorerProject: 'todo',
  caught: 0,
  progress: loadProgress(),
  sessions: loadSessions(),

  goTitle: () => {
    get().saveSession()
    set({ screen: 'title' })
  },

  saveSession: () => {
    const s = get()
    // Only a stage that is underway is worth resuming; a finished one starts over.
    if ((s.screen !== 'playing' && s.screen !== 'intro') || !s.agents.length) return
    const session: Session = {
      time: s.time,
      agents: s.agents,
      selected: s.selected,
      mails: s.mails,
      selectedMail: s.selectedMail,
      focused: s.focused,
      browserTab: s.browserTab,
      explorerProject: s.explorerProject,
      caught: s.caught,
    }
    const sessions = { ...s.sessions, [s.stageIndex]: session }
    saveSessions(sessions)
    set({ sessions })
  },

  openStage: (i, fresh) => {
    const saved = get().sessions[i]
    if (saved && !fresh) {
      set({
        ...saved,
        screen: saved.time > 0 ? 'playing' : 'intro',
        stageIndex: i,
        cursor: 0,
        result: undefined,
        toast: undefined,
      })
      get().focus(saved.focused)
      return
    }
    if (saved) {
      const sessions = { ...get().sessions }
      delete sessions[i]
      saveSessions(sessions)
      set({ sessions })
    }
    const stage = STAGES[i]
    const agents = stage.projects.map((p, idx) => newAgent(p, idx))
    const mails: Mail[] = stage.projects.map((pid, idx) => {
      const p = PROJECTS[pid]
      const mailIssue = p.issues.find((x) => x.visibleIn === 'mail')
      return { id: `m-${pid}`, ...p.brief, read: false, at: -idx, projectId: pid, issueId: mailIssue?.id }
    })
    set({
      screen: 'intro',
      stageIndex: i,
      time: 0,
      agents,
      selected: 0,
      cursor: 0,
      mails,
      selectedMail: undefined,
      windows: defaultWindows(),
      viewport: currentViewport(),
      focused: 'terminal',
      browserTab: stage.projects[0],
      explorerProject: stage.projects[0],
      caught: 0,
      result: undefined,
      toast: undefined,
    })
  },

  beginPlay: () => set({ screen: 'playing' }),

  tick: (dt) => {
    const s = get()
    if (s.screen !== 'playing') return
    const stage = STAGES[s.stageIndex]
    const time = s.time + dt
    let caught = s.caught
    const mails = [...s.mails]

    // late mails
    for (const pid of stage.projects) {
      for (const lm of PROJECTS[pid].lateMails ?? []) {
        if (s.time < lm.at && time >= lm.at) {
          mails.push({ id: `late-${pid}-${lm.issue.id}`, from: lm.from, subject: lm.subject, body: lm.body, read: false, at: time, projectId: pid, issueId: lm.issue.id })
        }
      }
    }

    const agents = s.agents.map((a) => {
      const agent: Agent = { ...a, inspected: { ...a.inspected } }

      // Late issues land in the agent's queue.
      for (const lm of PROJECTS[agent.projectId].lateMails ?? []) {
        if (s.time < lm.at && time >= lm.at && agent.built && !agent.open.includes(lm.issue.id)) {
          agent.open = [...agent.open, lm.issue.id]
          if (agent.status === 'done' && agent.open.length === 1) agent.choices = genChoices(agent)
        }
      }

      // Inspection: looking at this project's result in a focused window.
      if (agent.status === 'done' || agent.status === 'idle') {
        if (s.focused === 'browser' && s.browserTab === agent.projectId) agent.inspected.browser = true
        if (s.focused === 'explorer' && s.explorerProject === agent.projectId) agent.inspected.explorer = true
      }

      if (agent.status !== 'working') return agent
      agent.workingTime += dt
      agent.progress += dt / agent.seconds

      if (!agent.blockFired && agent.progress >= 0.45) {
        agent.blockFired = true
        if (agent.ctx >= 85) {
          agent.status = 'blocked'
          agent.blocked = CONTEXT_EVENT
          playSound('request')
          return agent
        }
        if (Math.random() < stage.blockChance) {
          agent.status = 'blocked'
          agent.blocked = makeBlockedEvent(PROJECTS[agent.projectId].name, agent.autoEdits, Math.random)
          playSound('request')
          return agent
        }
      }

      if (agent.progress >= 1) {
        complete(agent, time)
        playSound('done')
      }
      return agent
    })

    set({ time, agents, mails, caught })
    if (!allDone(s.agents, s.time) && allDone(agents, time)) get().showToast(ui((d) => d.allDoneToast))
  },

  endStage: () => {
    const s = get()
    if (s.screen !== 'playing' || !s.agents.length) return
    const result = computeResult(s.agents, s.caught, s.time)
    const progress = { ...s.progress, stars: [...s.progress.stars] }
    progress.stars[s.stageIndex] = Math.max(progress.stars[s.stageIndex] ?? 0, result.stars)
    progress.xp += result.xp
    saveProgress(progress)
    const sessions = { ...s.sessions }
    delete sessions[s.stageIndex]
    saveSessions(sessions)
    set({ screen: 'result', result, progress, sessions })
  },

  selectAgent: (i) => set({ selected: i, cursor: 0, browserTab: get().agents[i].projectId, explorerProject: get().agents[i].projectId }),
  stepAgent: (delta) => {
    const n = get().agents.length
    get().selectAgent((get().selected + delta + n) % n)
  },
  nextAttention: () => {
    const { agents, selected } = get()
    const order = [...agents.keys()].map((k) => (selected + 1 + k) % agents.length)
    const pri = (a: Agent) => (a.status === 'blocked' ? 0 : a.status === 'done' || a.status === 'idle' ? 1 : 9)
    const best = order.reduce((b, i) => (pri(agents[i]) < pri(agents[b]) ? i : b), order[0])
    if (pri(agents[best]) < 9) get().selectAgent(best)
  },

  moveCursor: (delta) => {
    const a = get().agents[get().selected]
    if (!a) return
    const n = a.status === 'blocked' ? a.blocked!.options.length : a.choices.length
    if (!n) return
    set({ cursor: (get().cursor + delta + n) % n })
  },
  setCursor: (i) => set({ cursor: i }),

  send: (choiceIndex) => {
    const s = get()
    const a = s.agents[s.selected]
    if (!a) return
    if (a.status === 'blocked') return get().answer(choiceIndex ?? s.cursor)
    if (a.status !== 'idle' && a.status !== 'done') return
    const idx = choiceIndex ?? s.cursor
    const c = a.choices[idx]
    if (!c) return
    if (!isUnlocked(s, a, c)) {
      const lock = c.lock!
      get().showToast(ui((d) => d.lockedToast(d.place[lock])))
      return
    }
    const seconds = c.seconds * (a.slow ? 1.6 : 1)
    const agent: Agent = {
      ...a,
      status: 'working',
      current: c,
      progress: 0,
      seconds,
      blockFired: false,
      choices: [],
      log: [...a.log, { who: 'you', text: c.label }],
    }
    set({ agents: s.agents.map((x, i) => (i === s.selected ? agent : x)), cursor: 0 })
  },

  answer: (optionIndex) => {
    const s = get()
    const a = s.agents[s.selected]
    if (!a || a.status !== 'blocked' || !a.blocked) return
    const opt = a.blocked.options[optionIndex]
    if (!opt) return
    const agent: Agent = { ...a, blocked: undefined, status: 'working', log: [...a.log, { who: 'sys', text: join((p) => `${p(a.blocked!.detail)} → ${p(opt.label)}`) }] }
    let caught = s.caught
    const effect: BlockEffect = opt.effect
    switch (effect) {
      case 'always':
        agent.autoEdits = true
        break
      case 'deny':
        agent.status = 'done'
        agent.current = undefined
        agent.progress = 0
        agent.log.push({ who: 'agent', text: ui((d) => d.denyReply) })
        agent.choices = agent.built ? genChoices(agent) : buildChoices(agent.projectId)
        break
      case 'disaster':
        if (agent.built && !agent.open.includes('regression')) agent.open = ['regression', ...agent.open]
        agent.seconds += 6
        agent.log.push({ who: 'agent', text: ui((d) => d.disasterLog) })
        get().showToast(ui((d) => d.disasterToast))
        break
      case 'caught':
        caught += 1
        agent.log.push({ who: 'agent', text: ui((d) => d.caughtLog) })
        get().showToast(ui((d) => d.caughtToast))
        break
      case 'overkill':
        agent.seconds += 8
        agent.log.push({ who: 'agent', text: ui((d) => d.overkillLog) })
        break
      case 'slow':
        agent.slow = true
        agent.log.push({ who: 'sys', text: ui((d) => d.slowLog) })
        break
      case 'compact':
        agent.slow = false
        agent.ctx = 5
        agent.log.push({ who: 'sys', text: ui((d) => d.compactLog) })
        break
    }
    set({ agents: s.agents.map((x, i) => (i === s.selected ? agent : x)), caught, cursor: 0 })
  },

  focus: (id) => {
    const ws = get().windows
    const top = Math.max(...ws.map((w) => w.z))
    set({ focused: id, windows: ws.map((w) => (w.id === id ? { ...w, z: top + 1, minimized: false } : w)) })
  },
  cycleFocus: () => {
    const order: WindowId[] = ['terminal', 'browser', 'explorer', 'mail']
    get().focus(order[(order.indexOf(get().focused) + 1) % order.length])
  },
  moveWindow: (id, x, y) => set({ windows: get().windows.map((w) => (w.id === id ? { ...w, x, y } : w)) }),
  fitToViewport: () => {
    const { viewport, windows } = get()
    const next = currentViewport()
    if (next.w === viewport.w && next.h === viewport.h) return
    const sx = next.w / viewport.w
    const sy = next.h / viewport.h
    set({
      viewport: next,
      windows: windows.map((w) => ({
        ...w,
        // keep fractional values so repeated resizes don't drift
        x: w.x * sx,
        y: w.y * sy,
        w: w.w * sx,
        h: w.h * sy,
      })),
    })
  },
  minimize: (id) => set({ windows: get().windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)), focused: 'terminal' }),
  setBrowserTab: (projectId) => set({ browserTab: projectId }),
  setExplorerProject: (projectId) => set({ explorerProject: projectId }),
  readMail: (id) => set({ selectedMail: id, mails: get().mails.map((m) => (m.id === id ? { ...m, read: true } : m)) }),
  showToast: (text) => set({ toast: { text, until: performance.now() + 2800 } }),
}))

/** Finish the agent's current task. Mutates the (already-copied) agent. */
function complete(agent: Agent, time: number) {
  const c = agent.current!
  const p = PROJECTS[agent.projectId]
  const log: LogLine[] = [...agent.log]
  agent.status = 'done'
  agent.progress = 1
  agent.current = undefined
  agent.doneAt = performance.now()
  agent.inspected = { ...agent.inspected, browser: false, explorer: false }

  const fix = (id: string) => {
    const issue = getIssue(agent.projectId, id)
    for (const f of issue.files ?? [{ path: agent.files[0]?.path ?? 'src/App.tsx' }]) {
      const add = 4 + Math.floor(Math.random() * 30)
      log.push({ who: 'tool', text: `${f.mark === 'new' ? 'Write' : 'Update'}(${f.path})\n⎿  ${f.mark === 'new' ? `Wrote ${add + 10} lines` : `Updated with ${add} additions and ${Math.floor(add / 3)} removals`}` })
    }
    agent.open = agent.open.filter((x) => x !== id)
    if (!agent.fixed.includes(id) || id === 'regression') agent.fixed = [...agent.fixed, id]
    agent.files = applyFiles(agent.files, issue.files, REMOVALS[id])
    log.push({ who: 'agent', text: issue.fixedReply })
  }

  if (c.build) {
    const b = p.buildChoices.find((x) => x.label.en === c.label.en)!
    agent.built = true
    const arrived = (p.lateMails ?? []).filter((m) => m.at <= time).map((m) => m.issue.id)
    agent.open = [...p.issues.map((i) => i.id), ...arrived]
    log.push({ who: 'tool', text: `Bash(npm create vite@latest ${p.name})` })
    for (const f of p.baseFiles.slice(0, 3)) log.push({ who: 'tool', text: `Write(${f.path})` })
    agent.files = applyFiles(
      [],
      p.baseFiles.map((f) => ({ ...f, mark: f.mark ?? 'new' })),
    )
    log.push({ who: 'agent', text: b.reply })
  } else if (c.tier === 'great') {
    fix(c.issueId!)
  } else if (c.tier === 'ok') {
    if (Math.random() < 0.7 && agent.open.includes(c.issueId!)) fix(c.issueId!)
    else log.push({ who: 'agent', text: ui((d) => d.okMiss) })
  } else if (c.tier === 'vague') {
    if (Math.random() < 0.35 && agent.open.length) fix(pick(agent.open))
    else log.push({ who: 'agent', text: ui((d) => d.vagueMiss) })
  } else if (c.tier === 'trap') {
    if (agent.open.includes(c.issueId!)) fix(c.issueId!)
    if (!agent.open.includes('regression')) agent.open = ['regression', ...agent.open]
    log.push({ who: 'agent', text: ui((d) => d.trapDone) })
  } else if (c.tier === 'polish') {
    agent.polish += 1
    const path = c.label.en.startsWith('Write a README') ? 'README.md' : c.label.en.includes('CI') ? '.github/workflows/ci.yml' : undefined
    agent.files = applyFiles(agent.files, path ? [{ path, mark: 'new' }] : [])
    log.push({ who: 'agent', text: ui((d) => d.polishDone) })
  }

  agent.ctx = Math.min(99, agent.ctx + 9 + Math.floor(Math.random() * 6) + (c.tier === 'vague' ? 6 : 0))
  const note = c.build && c.tier === 'trap' ? 'overkill' : c.tier
  log.push({ who: 'sys', text: ui((d) => d.tierNote[note]) })
  agent.log = log.slice(-40)
  agent.choices = genChoices(agent)
}

