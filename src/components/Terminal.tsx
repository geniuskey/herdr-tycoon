import { useEffect, useRef, useState } from 'react'
import { isUnlocked, useGame } from '../game/store'
import { PROJECTS, STAGES } from '../scenarios'
import type { Agent, AgentStatus } from '../game/types'
import { Window } from './Window'
import { Herdy } from './Shell'
import { useT } from '../i18n'

const VERBS = ['Zigzagging', 'Herding', 'Percolating', 'Noodling', 'Clauding', 'Tinkering', 'Brewing', 'Wrangling', 'Pondering', 'Shepherding']

/** Workspace-level status dot (used in herdr sidebar + taskbar tray). */
export function Dot({ status }: { status: AgentStatus }) {
  return <span className={`dot dot-${status}`} aria-label={status} />
}

/** Status glyph as herdr draws it in the spaces and agents lists: ● working / done, ◉ needs you, ○ idle. */
function Glyph({ status }: { status: AgentStatus }) {
  return <span className={`g g-${status}`}>{status === 'idle' ? '○' : status === 'blocked' ? '◉' : '●'}</span>
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

      <div className="cc-rule">
        <span className="cc-rule-title">{tx(p.title)}</span>
      </div>
      <div className="cc-input">
        <span>❯</span>
        {agent.status === 'idle' || agent.status === 'done' ? <span className="cc-cursor" /> : null}
      </div>
      <div className="cc-rule" />

      {(agent.status === 'idle' || agent.status === 'done') && (
        <div className="cc-menu">
          <div className="cc-menu-title dim">{agent.built ? d.pickNext : d.pickFirst}</div>
          {agent.choices.map((c, i) => {
            const unlocked = isUnlocked({ mails }, agent, c)
            return (
              <div key={c.id} className={`cc-opt ${cursor === i ? 'sel' : ''} ${unlocked ? '' : 'locked'}`} onMouseEnter={() => setCursor(i)} onClick={() => send(i)}>
                <span className="cc-caret">{cursor === i ? '❯' : ' '}</span>
                <span className="cc-num">{i + 1}.</span>
                <span>{unlocked ? tx(c.label) : c.build ? d.lockedBrief : d.lockedChoice(d.place[c.lock!])}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="cc-status">
        {agent.autoEdits ? <span className="cc-mode">⏵⏵ {d.acceptEdits}</span> : <span className="dim">{d.keysHint}</span>}
        <span className="dim"> · </span>
        <span className={agent.ctx >= 85 ? 'red' : 'dim'}>{ctxBar(agent.ctx)}</span> <span className={agent.ctx >= 85 ? 'red' : 'cyan'}>{agent.ctx}%</span>
        {agent.slow && <span className="red">{d.slowCtx}</span>}
      </div>
    </div>
  )
}

const SPLIT_KEY = 'herdr-tycoon:agents-height'
const MIN_SPACES = 60
const MIN_AGENTS = 40

/** Drag the line between the spaces and agents lists to resize them (height remembered per browser). */
function useSideSplit() {
  const sideRef = useRef<HTMLDivElement>(null)
  const agentsRef = useRef<HTMLDivElement>(null)
  const [agentsH, setAgentsH] = useState<number | null>(() => {
    try {
      const v = Number(localStorage.getItem(SPLIT_KEY))
      return v > 0 ? v : null
    } catch {
      return null
    }
  })

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const side = sideRef.current
    const agentsEl = agentsRef.current
    if (!side || !agentsEl || e.button !== 0) return
    e.preventDefault()
    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)
    const startY = e.clientY
    const startH = agentsEl.getBoundingClientRect().height
    // Everything in the sidebar that is neither spaces nor agents (handle, collapse arrow, padding).
    const fixed = side.clientHeight - startH - (side.querySelector('.side-spaces') as HTMLElement).getBoundingClientRect().height
    const maxH = Math.max(MIN_AGENTS, side.clientHeight - fixed - MIN_SPACES)
    let last = startH
    const move = (ev: PointerEvent) => {
      last = Math.round(Math.min(maxH, Math.max(MIN_AGENTS, startH + startY - ev.clientY)))
      setAgentsH(last)
    }
    const up = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', up)
      document.body.classList.remove('row-resizing')
      try {
        localStorage.setItem(SPLIT_KEY, String(last))
      } catch {
        /* storage unavailable */
      }
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
    handle.addEventListener('pointercancel', up)
    document.body.classList.add('row-resizing')
  }

  const resetResize = () => {
    setAgentsH(null)
    try {
      localStorage.removeItem(SPLIT_KEY)
    } catch {
      /* storage unavailable */
    }
  }

  return { sideRef, agentsRef, agentsH, startResize, resetResize }
}

export function Terminal() {
  const agents = useGame((s) => s.agents)
  const selected = useGame((s) => s.selected)
  const selectAgent = useGame((s) => s.selectAgent)
  const tutorial = useGame((s) => !!STAGES[s.stageIndex].tutorial)
  const { d } = useT()
  const agent = agents[selected]
  const space = agent ? PROJECTS[agent.projectId] : undefined
  const { sideRef, agentsRef, agentsH, startResize, resetResize } = useSideSplit()

  return (
    <Window
      id="terminal"
      dark
      icon=""
      title={
        <span className="wt-tab">
          <span className="wt-tab-icon">❯_</span> herdr{space ? `: ${space.name}` : ''}
        </span>
      }
      titleExtra={<span className="wt-plus">+ ⌄</span>}
      bodyClass="term-body"
    >
      <div className="herdr">
        <div ref={sideRef} className={`herdr-side ${tutorial ? 'wide' : ''}`}>
          <div className="side-spaces">
            <div className="side-h">spaces</div>
            {agents.map((a, i) => {
              const p = PROJECTS[a.projectId]
              return (
                <div key={a.id} className={`ws ${i === selected ? 'sel' : ''}`} onClick={() => selectAgent(i)}>
                  <div className="ws-row">
                    <Glyph status={a.status} /> <b>{p.name}</b>
                  </div>
                  <div className="ws-branch">{p.branch}</div>
                </div>
              )
            })}
            {tutorial && <Herdy />}
            <div className="side-row side-new dim">
              <span>new</span>
              <span>menu</span>
            </div>
          </div>
          <div
            className="side-split"
            role="separator"
            aria-orientation="horizontal"
            onPointerDown={startResize}
            onDoubleClick={resetResize}
            title="drag to resize · double-click to reset"
          />
          <div ref={agentsRef} className="side-agents" style={agentsH != null ? { height: agentsH } : undefined}>
            <div className="side-row side-h">
              <span>agents</span>
              <span className="dim">grouped</span>
            </div>
            {agents.map((a, i) => {
              const p = PROJECTS[a.projectId]
              return (
                <div
                  key={a.id}
                  className={`ag ${i === selected ? 'sel' : ''} ${a.status === 'blocked' ? 'attn' : ''}`}
                  title={d.status[a.status]}
                  onClick={() => selectAgent(i)}
                >
                  <div className="ag-row">
                    <Glyph status={a.status} />
                    <span className="ag-name">
                      <b>{p.name}</b> <span className="dim">· {p.tab}</span>
                    </span>
                  </div>
                  <div className="ag-kind dim">claude</div>
                </div>
              )
            })}
          </div>
          <div className="side-collapse dim">«</div>
        </div>
        {agent && space && (
          <div className="herdr-main">
            <div className="herdr-tabs">
              <span className="htab active">{space.tab}</span>
              <span className="htab-plus dim">+</span>
            </div>
            <div className="panes">
              <ClaudePane agent={agent} />
              <DevServerPane agent={agent} />
            </div>
          </div>
        )}
      </div>
    </Window>
  )
}
