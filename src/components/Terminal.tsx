import { useEffect, useRef } from 'react'
import { isUnlocked, useGame } from '../game/store'
import { PROJECTS, STAGES } from '../scenarios'
import type { Agent, AgentStatus } from '../game/types'
import { Window } from './Window'
import { Herdy } from './Shell'

const STATUS_TEXT: Record<AgentStatus, string> = {
  idle: 'idle',
  working: 'working',
  blocked: 'needs you',
  done: 'done',
}

export function Dot({ status }: { status: AgentStatus }) {
  return <span className={`dot dot-${status}`} aria-label={status} />
}

const LOCK_TEXT = { browser: 'Browser (B)', explorer: 'Explorer (E)', mail: 'Mail (M)' }

function Pane({ agent }: { agent: Agent }) {
  const cursor = useGame((s) => s.cursor)
  const mails = useGame((s) => s.mails)
  const send = useGame((s) => s.send)
  const setCursor = useGame((s) => s.setCursor)
  const logRef = useRef<HTMLDivElement>(null)
  const p = PROJECTS[agent.projectId]

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [agent.log.length, agent.status])

  return (
    <div className="pane">
      <div className="pane-head">
        <Dot status={agent.status} /> <b>{p.name}</b> <span className="muted">· claude · ~/projects/{p.name}</span>
        {agent.slow && <span className="tag tag-warn">context 92%</span>}
        {agent.autoEdits && <span className="tag">auto-edit</span>}
      </div>
      <div className="pane-log" ref={logRef}>
        {agent.log.map((l, i) => (
          <div key={i} className={`log log-${l.who}`}>
            {l.who === 'you' ? '> ' : l.who === 'agent' ? '⏺ ' : ''}
            {l.text}
          </div>
        ))}
        {agent.status === 'working' && (
          <div className="log log-working">
            <span className="spinner">✻</span> {agent.built ? 'Working' : 'Scaffolding project'}… <span className="muted">({Math.round(agent.progress * 100)}%)</span>
            <div className="bar">
              <div style={{ width: `${Math.min(100, agent.progress * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {agent.status === 'blocked' && agent.blocked && (
        <div className={`prompt-box blocked ${agent.blocked.kind === 'danger' ? 'danger' : ''}`}>
          <div className="prompt-title">⚠ {agent.blocked.title}</div>
          <div className="prompt-detail">{agent.blocked.detail}</div>
          {agent.blocked.options.map((o, i) => (
            <div key={o.label} className={`opt ${cursor === i ? 'sel' : ''}`} onMouseEnter={() => setCursor(i)} onClick={() => send(i)}>
              <span className="opt-key">{cursor === i ? '❯' : ' '} {i + 1}.</span> {o.label}
            </div>
          ))}
        </div>
      )}

      {(agent.status === 'idle' || agent.status === 'done') && (
        <div className="prompt-box">
          <div className="prompt-title">{agent.built ? 'What next?' : 'New task: pick your first prompt'}</div>
          {agent.choices.map((c, i) => {
            const unlocked = isUnlocked({ mails }, agent, c)
            return (
              <div
                key={c.id}
                className={`opt ${cursor === i ? 'sel' : ''} ${unlocked ? '' : 'locked'}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => send(i)}
              >
                <span className="opt-key">
                  {cursor === i ? '❯' : ' '} {i + 1}.
                </span>{' '}
                {unlocked ? c.label : `🔒 A sharper prompt is available. Check the ${LOCK_TEXT[c.lock!]} to see what's wrong.`}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Terminal() {
  const agents = useGame((s) => s.agents)
  const selected = useGame((s) => s.selected)
  const selectAgent = useGame((s) => s.selectAgent)
  const agent = agents[selected]
  const tutorial = useGame((s) => !!STAGES[s.stageIndex].tutorial)

  return (
    <Window id="terminal" title={`Terminal — herdr (${agents.length} panes)`} icon="🖥" bodyClass="term-body">
      <div className="herdr">
        <div className={`herdr-side ${tutorial ? 'wide' : ''}`}>
          <div className="side-title">AGENTS</div>
          {agents.map((a, i) => (
            <div key={a.id} className={`side-item ${i === selected ? 'sel' : ''} ${a.status === 'blocked' ? 'attn' : ''}`} onClick={() => selectAgent(i)}>
              <Dot status={a.status} />
              <div>
                <div>{PROJECTS[a.projectId].name}</div>
                <div className="muted small">{STATUS_TEXT[a.status]}</div>
              </div>
            </div>
          ))}
          <Herdy />
          <div className="side-legend">
            <div><Dot status="working" /> working</div>
            <div><Dot status="blocked" /> needs you</div>
            <div><Dot status="done" /> done</div>
            <div><Dot status="idle" /> idle</div>
          </div>
        </div>
        {agent && <Pane agent={agent} />}
      </div>
      <div className="term-keys">
        <span><kbd>←→</kbd> agent</span>
        <span><kbd>↑↓</kbd> option</span>
        <span><kbd>Enter</kbd>/<kbd>1-4</kbd> send</span>
        <span><kbd>N</kbd> next waiting</span>
        <span><kbd>B</kbd> browser</span>
        <span><kbd>E</kbd> explorer</span>
        <span><kbd>M</kbd> mail</span>
        <span><kbd>Tab</kbd> window</span>
      </div>
    </Window>
  )
}
