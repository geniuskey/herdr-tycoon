import type { L, Text } from '../i18n'

export type AgentStatus = 'idle' | 'working' | 'blocked' | 'done'

/** Where the player must look to "see" an issue and unlock the sharp prompt. */
export type InspectSource = 'browser' | 'explorer' | 'mail'

export type Tier = 'great' | 'ok' | 'vague' | 'trap' | 'polish' | 'build'

export interface FileNode {
  path: string // e.g. "src/App.tsx"
  mark?: 'new' | 'modified' | 'warn'
}

export interface Issue {
  id: string
  /** Short label used in the result screen. */
  title: L
  visibleIn: InspectSource
  /** Sharp, specific prompt. Unlocked after inspecting `visibleIn`. */
  great: L
  /** Generic but reasonable prompt. */
  ok: L
  /** Agent reply when the fix lands. */
  fixedReply: L
  /** Files touched when fixed. */
  files?: FileNode[]
}

export interface ProjectScenario {
  id: string
  name: string // folder name, e.g. "todo-app"
  branch: string
  title: L // human name
  port: number
  brief: { from: L; subject: L; body: L }
  buildChoices: { label: L; tier: Tier; seconds: number; reply: L }[]
  /** Files that exist after the first build. */
  baseFiles: FileNode[]
  /** Issues present after the build, in the order the agent "notices" them. */
  issues: Issue[]
  /** Issues injected later by a client mail. */
  lateMails?: { at: number; from: L; subject: L; body: L; issue: Issue }[]
}

export interface Choice {
  id: string
  label: L
  tier: Tier
  issueId?: string
  lock?: InspectSource
  seconds: number
  build?: boolean
}

export interface BlockedEvent {
  kind: 'edit' | 'bash' | 'danger' | 'question' | 'context'
  title: L
  detail: Text
  options: { label: Text; effect: BlockEffect }[]
}

export type BlockEffect =
  | 'continue'
  | 'always' // continue + stop asking for edits
  | 'deny' // task aborted
  | 'disaster' // regression + extra time
  | 'caught' // continue + bonus
  | 'overkill' // continue + extra time
  | 'slow' // continue but future tasks are slower
  | 'compact' // continue and clear slow

export interface LogLine {
  who: 'you' | 'agent' | 'sys' | 'tool'
  text: Text
}

export interface Agent {
  id: string
  projectId: string
  status: AgentStatus
  built: boolean
  fixed: string[] // issue ids fixed
  open: string[] // issue ids open, ordered (regression first)
  polish: number
  progress: number // 0..1
  seconds: number // total seconds of current task
  current?: Choice
  blocked?: BlockedEvent
  blockFired: boolean
  choices: Choice[]
  inspected: Record<InspectSource, boolean>
  autoEdits: boolean
  slow: boolean
  ctx: number // context window usage %
  log: LogLine[]
  files: FileNode[]
  workingTime: number
  doneAt?: number
}

export interface Mail {
  id: string
  from: L
  subject: L
  body: L
  read: boolean
  at: number
  projectId: string
  issueId?: string
}

export interface StageDef {
  id: number
  name: L
  subtitle: L
  projects: string[]
  blockChance: number
  tutorial?: boolean
  lessons: L[]
}
