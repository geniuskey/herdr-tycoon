import { useEffect, useState } from 'react'
import { isUnlocked, useGame, type WindowId } from '../game/store'
import { STAGES } from '../scenarios'
import { Dot } from './Terminal'

const WIN_LABELS: Record<WindowId, string> = {
  terminal: '🖥 herdr',
  browser: '🌐 Browser',
  explorer: '📁 Explorer',
  mail: '📧 Mail',
}

export function useUtilization() {
  return useGame((s) => {
    if (!s.agents.length || s.time <= 0) return 0
    return s.agents.reduce((t, a) => t + a.workingTime, 0) / (s.agents.length * s.time)
  })
}

export function Taskbar() {
  const [menu, setMenu] = useState(false)
  const windows = useGame((s) => s.windows)
  const focused = useGame((s) => s.focused)
  const focus = useGame((s) => s.focus)
  const agents = useGame((s) => s.agents)
  const time = useGame((s) => s.time)
  const stageIndex = useGame((s) => s.stageIndex)
  const unread = useGame((s) => s.mails.filter((m) => !m.read).length)
  const openStage = useGame((s) => s.openStage)
  const goTitle = useGame((s) => s.goTitle)
  const util = useUtilization()
  const left = Math.max(0, STAGES[stageIndex].seconds - time)
  const mm = Math.floor(left / 60)
  const ss = Math.floor(left % 60)
    .toString()
    .padStart(2, '0')

  return (
    <div className="taskbar">
      <button className={`start ${menu ? 'active' : ''}`} onClick={() => setMenu(!menu)}>
        <b>🐑 Start</b>
      </button>
      {menu && (
        <div className="start-menu window" onMouseLeave={() => setMenu(false)}>
          <div className="start-side">HerdrOS 98</div>
          <div className="start-items">
            <div onClick={() => (setMenu(false), openStage(stageIndex))}>🔄 Restart stage</div>
            <div onClick={() => (setMenu(false), goTitle())}>🏠 Stage select</div>
          </div>
        </div>
      )}
      <div className="task-buttons">
        {windows.map((w) => (
          <button key={w.id} className={`task-btn ${focused === w.id && !w.minimized ? 'active' : ''}`} onClick={() => focus(w.id)}>
            {WIN_LABELS[w.id]}
            {w.id === 'mail' && unread > 0 ? ` (${unread})` : ''}
          </button>
        ))}
      </div>
      <div className="tray">
        <span className="tray-dots">
          {agents.map((a) => (
            <Dot key={a.id} status={a.status} />
          ))}
        </span>
        <span title="Utilization: share of agent time spent working" className={`util ${util >= 0.7 ? 'good' : util >= 0.5 ? 'ok' : 'bad'}`}>
          ⚙ {Math.round(util * 100)}%
        </span>
        <span className={left < 20 ? 'blink' : ''}>
          ⏱ {mm}:{ss}
        </span>
      </div>
    </div>
  )
}

export function Toast() {
  const toast = useGame((s) => s.toast)
  const [, force] = useState(0)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => force((x) => x + 1), toast.until - performance.now() + 20)
    return () => clearTimeout(t)
  }, [toast])
  if (!toast || performance.now() > toast.until) return null
  return <div className="toast window">{toast.text}</div>
}

/** Tutorial helper. */
export function Herdy() {
  const s = useGame()
  const stage = STAGES[s.stageIndex]
  if (!stage.tutorial) return null
  const a = s.agents[0]
  if (!a) return null
  const briefRead = s.mails.some((m) => m.read)
  let text: string
  if (!a.built && a.status === 'idle') {
    text = "This is herdr. Your agent is idle (○). Idle agents are wasted time! Pick a prompt with ↑↓ and press Enter, or just click one."
  } else if (a.status === 'working' && !briefRead) {
    text = 'Yellow dot = working. That is what you want! While it works, read the client mail (M). It has useful hints.'
  } else if (a.status === 'blocked') {
    text = 'Red dot = the agent needs you. Read what it is asking for before you approve!'
  } else if (a.status === 'done') {
    const locked = a.choices.find((c) => c.lock && !isUnlocked(s, a, c))
    if (locked) {
      text = `Green dot = done. Don't keep going blind: check the ${locked.lock === 'browser' ? 'Browser (B)' : locked.lock === 'explorer' ? 'Explorer (E)' : 'Mail (M)'} to see the result. A sharper prompt unlocks!`
    } else {
      text = 'Now you can see what is wrong. Specific prompts are faster and more reliable than vague ones. Send one quickly to get back to yellow!'
    }
  } else {
    text = 'Keep it yellow! The ⚙ % in the taskbar is your utilization. Press N to jump to whichever agent needs you.'
  }
  return (
    <div className="herdy">
      <div className="herdy-bubble">{text}</div>
      <div className="herdy-face">🐑</div>
    </div>
  )
}
