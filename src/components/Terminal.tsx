import { useEffect, useRef, useState } from 'react'
import { isUnlocked, useGame } from '../game/store'
import { PROJECTS, STAGES } from '../scenarios'
import type { Agent, AgentStatus } from '../game/types'
import { Window } from './Window'
import { Herdy } from './Shell'
import { useT } from '../i18n'

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const VERBS = ['Zigzagging', 'Herding', 'Percolating', 'Noodling', 'Clauding', 'Tinkering', 'Brewing', 'Wrangling', 'Pondering', 'Shepherding']

function useFrame(ms: number) {
  const [f, setF] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setF((x) => x + 1), ms)
    return () => clearInterval(t)
  }, [ms])
  return f
}

/** Workspace-level status dot (used in herdr sidebar + taskbar tray). */
export function Dot({ status }: { status: AgentStatus }) {
  return <span className={`dot dot-${status}`} aria-label={status} />
}

function AgentGlyph({ status }: { status: AgentStatus }) {
  const f = useFrame(90)
  if (status === 'working') return <span className="g g-working">{SPINNER[f % SPINNER.length]}</span>
  if (status === 'blocked') return <span className="g g-blocked">◉</span>
  if (status === 'done') return <span className="g g-done">●</span>
  return <span className="g g-idle">○</span>
}

function ctxBar(ctx: number) {
  const filled = Math.min(5, Math.round(ctx / 20))
  return '▰'.repeat(filled) + '▱'.repeat(5 - filled)
}

/** Fake "npm run dev" pane: derived from agent state. */
function DevServerPane({ agent }: { agent: Agent }) {
  const { d } = useT()
  const p = PROJECTS[agent.projectId]
  const lines: { t: string; c?: string }[] = []
  if (!agent.built) {
    lines.push({ t: `~/projects/${p.name} $ npm run dev`, c: 'dim' })
    lines.push({ t: 'npm error Missing script: "dev"', c: 'red' })
    lines.push({ t: d.waitingScaffold, c: 'dim' })
  } else {
    lines.push({ t: `> ${p.name}@0.1.0 dev`, c: 'dim' })
    lines.push({ t: `  VITE v7.3.8  ready in 312 ms`, c: 'green' })
    lines.push({ t: `  ➜  Local:   http://localhost:${p.port}/`, c: 'cyan' })
    for (const f of agent.files.filter((x) => x.mark === 'modified' || x.mark === 'new').slice(-3)) {
      lines.push({ t: `  [vite] hmr update /${f.path}`, c: 'dim' })
    }
    if (agent.open.includes('regression')) {
      lines.push({ t: "  [vite] Internal server error: TypeError: Cannot read properties of undefined (reading 'map')", c: 'red' })
    }
  }
  return (
    <div className="pane pane-dev">
      {lines.map((l, i) => (
        <div key={i} className={`dl ${l.c ?? ''}`}>
          {l.t}
        </div>
      ))}
    </div>
  )
}

function ClaudePane({ agent }: { agent: Agent }) {
  const cursor = useGame((s) => s.cursor)
  const mails = useGame((s) => s.mails)
  const send = useGame((s) => s.send)
  const setCursor = useGame((s) => s.setCursor)
  const { d, tx } = useT()
  const logRef = useRef<HTMLDivElement>(null)
  const p = PROJECTS[agent.projectId]
  const verb = VERBS[(agent.log.length + agent.projectId.length) % VERBS.length]
  const step = Math.floor(agent.progress * 4)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [agent.log.length, agent.status, step, agent.id])

  // live tool calls while working
  const live: string[] = []
  if (agent.status === 'working' || agent.status === 'blocked') {
    const target = agent.files.find((f) => f.path.includes('App')) ?? agent.files[0]
    if (agent.progress > 0.12) live.push(agent.built ? `Read(${target?.path ?? 'src/App.tsx'})` : 'Bash(ls -la)')
    if (agent.progress > 0.3) live.push(agent.built ? `Search(pattern: "${agent.current?.tier === 'polish' ? 'TODO' : 'export'}", path: "src")` : 'Bash(npm create vite@latest)')
  }

  return (
    <div className="pane pane-claude">
      <div className="cc-log" ref={logRef}>
        <div className="cc-banner">
          <div className="cc-banner-title">Claude Code</div>
          <div className="cc-banner-body">
            <div className="cc-mascot">▐▛███▜▌</div>
            <div>
              <b>{d.welcomeBack}</b>
              <div className="dim">~/projects/{p.name}</div>
            </div>
          </div>
        </div>
        {agent.log.map((l, i) => {
          if (l.who === 'you')
            return (
              <div key={i} className="cc-user">
                <span className="dim">❯</span> {tx(l.text)}
              </div>
            )
          if (l.who === 'tool') {
            const [head, sub] = tx(l.text).split('\n')
            const m = head.match(/^(\w+)\((.*)\)$/)
            return (
              <div key={i} className="cc-tool">
                <span className="cc-bullet green">⏺</span> <b>{m ? m[1] : head}</b>
                {m && <span>({m[2]})</span>}
                {sub && <div className="cc-sub dim">{sub}</div>}
              </div>
            )
          }
          if (l.who === 'agent')
            return (
              <div key={i} className="cc-agent">
                <span className="cc-bullet">⏺</span> {tx(l.text)}
              </div>
            )
          return (
            <div key={i} className="cc-sys dim">
              {tx(l.text)}
            </div>
          )
        })}
        {live.map((t, i) => {
          const m = t.match(/^(\w+)\((.*)\)$/)!
          return (
            <div key={`live-${i}`} className="cc-tool">
              <span className="cc-bullet dim">⏺</span> <b>{m[1]}</b>({m[2]})
              {i === live.length - 1 && <div className="cc-sub dim">⎿  Running…</div>}
            </div>
          )
        })}
        {agent.status === 'working' && (
          <div className="cc-working">
            ✻ {verb}… <span className="dim">{d.escToInterrupt(Math.round(agent.progress * agent.seconds))}</span>
          </div>
        )}
      </div>

      {agent.status === 'blocked' && agent.blocked && (
        <div className={`cc-dialog ${agent.blocked.kind === 'danger' ? 'danger' : ''}`}>
          <div className="cc-dialog-title">{tx(agent.blocked.title)}</div>
          <div className="cc-dialog-detail">{tx(agent.blocked.detail)}</div>
          <div className="cc-dialog-q">{agent.blocked.kind === 'question' ? d.chooseAnswer : d.proceed}</div>
          {agent.blocked.options.map((o, i) => (
            <div key={i} className={`cc-opt ${cursor === i ? 'sel' : ''}`} onMouseEnter={() => setCursor(i)} onClick={() => send(i)}>
              <span className="cc-caret">{cursor === i ? '❯' : ' '}</span>
              <span className="cc-num">{i + 1}.</span>
              <span>{tx(o.label)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="cc-input">
        <span className="dim">❯</span>
        {agent.status === 'idle' || agent.status === 'done' ? <span className="cc-cursor" /> : null}
      </div>

      {(agent.status === 'idle' || agent.status === 'done') && (
        <div className="cc-menu">
          <div className="cc-menu-title dim">{agent.built ? d.pickNext : d.pickFirst}</div>
          {agent.choices.map((c, i) => {
            const unlocked = isUnlocked({ mails }, agent, c)
            return (
              <div key={c.id} className={`cc-opt ${cursor === i ? 'sel' : ''} ${unlocked ? '' : 'locked'}`} onMouseEnter={() => setCursor(i)} onClick={() => send(i)}>
                <span className="cc-caret">{cursor === i ? '❯' : ' '}</span>
                <span className="cc-num">{i + 1}.</span>
                <span>{unlocked ? tx(c.label) : d.lockedChoice(d.place[c.lock!])}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="cc-status">
        <span className="purple">~/p/{p.name}</span> <span className="dim">⎇</span> <span className="blue">{p.branch}</span>{' '}
        <span className={agent.ctx >= 85 ? 'red' : 'dim'}>{ctxBar(agent.ctx)}</span> <span className={agent.ctx >= 85 ? 'red' : 'cyan'}>{agent.ctx}%</span>
        {agent.slow && <span className="red">{d.slowCtx}</span>}
        {agent.autoEdits && <span className="dim">{d.acceptEdits}</span>}
      </div>
    </div>
  )
}

export function Terminal() {
  const agents = useGame((s) => s.agents)
  const selected = useGame((s) => s.selected)
  const selectAgent = useGame((s) => s.selectAgent)
  const tutorial = useGame((s) => !!STAGES[s.stageIndex].tutorial)
  const { d } = useT()
  const agent = agents[selected]

  return (
    <Window
      id="terminal"
      dark
      icon=""
      title={
        <span className="wt-tab">
          <span className="wt-tab-icon">❯_</span> herdr
        </span>
      }
      titleExtra={<span className="wt-plus">+ ⌄</span>}
      bodyClass="term-body"
    >
      <div className="herdr">
        <div className={`herdr-side ${tutorial ? 'wide' : ''}`}>
          {agents.map((a, i) => {
            const p = PROJECTS[a.projectId]
            return (
              <div key={a.id} className={`ws ${i === selected ? 'sel' : ''}`} onClick={() => selectAgent(i)}>
                <div className="ws-row">
                  <span className="dim">{i + 1}</span> <b>{p.name}</b> <Dot status={a.status} />
                </div>
                <div className={`ws-branch ${i === selected ? 'purple' : 'dim'}`}>{p.branch}</div>
              </div>
            )
          })}
          <div className="ws-new dim">new</div>
          {tutorial && <Herdy />}
          <div className="side-agents">
            <div className="side-h dim">agents</div>
            {agents.map((a, i) => (
              <div key={a.id} className={`ag ${i === selected ? 'sel' : ''} ${a.status === 'blocked' ? 'attn' : ''}`} onClick={() => selectAgent(i)}>
                <AgentGlyph status={a.status} />
                <span className="ag-name">
                  claude <span className="dim">· {i + 1}</span>
                </span>
                <span className={`ag-state st-${a.status}`}>{d.status[a.status]}</span>
              </div>
            ))}
          </div>
          <div className="side-keys dim">
            <div>{d.keysWorkspace}</div>
            <div>{d.keysSend}</div>
            <div>{d.keysApps}</div>
          </div>
        </div>
        {agent && (
          <div className="panes">
            <ClaudePane agent={agent} />
            <DevServerPane agent={agent} />
          </div>
        )}
      </div>
    </Window>
  )
}
