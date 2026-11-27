import { useEffect, useState } from 'react'
import { isUnlocked, useGame, type WindowId } from '../game/store'
import { setMuted } from '../game/sound'
import { STAGES } from '../scenarios'
import { Dot } from './Terminal'

const APPS: { id: WindowId; icon: string; label: string }[] = [
  { id: 'terminal', icon: '❯_', label: 'Terminal (herdr)' },
  { id: 'browser', icon: '🌐', label: 'Browser' },
  { id: 'explorer', icon: '📁', label: 'File Explorer' },
  { id: 'mail', icon: '✉️', label: 'Mail' },
]

export function useUtilization() {
  return useGame((s) => {
    if (!s.agents.length || s.time <= 0) return 0
    return s.agents.reduce((t, a) => t + a.workingTime, 0) / (s.agents.length * s.time)
  })
}

export function Taskbar() {
  const [menu, setMenu] = useState(false)
  const [muted, setMutedState] = useState(false)
  const windows = useGame((s) => s.windows)
  const focused = useGame((s) => s.focused)
  const focus = useGame((s) => s.focus)
  const agents = useGame((s) => s.agents)
  const time = useGame((s) => s.time)
  const screen = useGame((s) => s.screen)
  const stageIndex = useGame((s) => s.stageIndex)
  const unread = useGame((s) => s.mails.filter((m) => !m.read).length)
  const openStage = useGame((s) => s.openStage)
  const goTitle = useGame((s) => s.goTitle)
  const util = useUtilization()
  const playing = screen !== 'title' && agents.length > 0
  const left = Math.max(0, STAGES[stageIndex].seconds - time)
  const mm = Math.floor(left / 60)
  const ss = Math.floor(left % 60)
    .toString()
    .padStart(2, '0')

  return (
    <div className="taskbar">
      <div className="tb-center">
        <button className={`tb-app tb-start ${menu ? 'active' : ''}`} onClick={() => setMenu(!menu)} title="Start">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <rect x="1" y="1" width="8.5" height="8.5" rx="1" fill="#0078d4" />
            <rect x="10.5" y="1" width="8.5" height="8.5" rx="1" fill="#0078d4" />
            <rect x="1" y="10.5" width="8.5" height="8.5" rx="1" fill="#0078d4" />
            <rect x="10.5" y="10.5" width="8.5" height="8.5" rx="1" fill="#0078d4" />
          </svg>
        </button>
        {playing &&
          APPS.map((a) => {
            const w = windows.find((x) => x.id === a.id)!
            return (
              <button key={a.id} className={`tb-app ${focused === a.id && !w.minimized ? 'active' : ''} ${w.minimized ? '' : 'open'}`} onClick={() => focus(a.id)} title={a.label}>
                <span className={a.id === 'terminal' ? 'tb-term' : ''}>{a.icon}</span>
                {a.id === 'mail' && unread > 0 && <span className="tb-badge">{unread}</span>}
              </button>
            )
          })}
      </div>
      {menu && (
        <div className="start-menu" onMouseLeave={() => setMenu(false)}>
          <div className="start-h">Herdr Tycoon</div>
          {playing && (
            <div className="start-item" onClick={() => (setMenu(false), openStage(stageIndex))}>
              🔄 Restart stage
            </div>
          )}
          <div className="start-item" onClick={() => (setMenu(false), goTitle())}>
            🏠 Stage select
          </div>
        </div>
      )}
      <div className="tray">
        {playing && (
          <>
            <span className="tray-dots" title="Agent status">
              {agents.map((a) => (
                <Dot key={a.id} status={a.status} />
              ))}
            </span>
            <span title="Utilization: share of agent time spent working" className={`util ${util >= 0.7 ? 'good' : util >= 0.5 ? 'ok' : 'bad'}`}>
              {Math.round(util * 100)}% busy
            </span>
            <span className={`tray-time ${left < 20 ? 'urgent' : ''}`}>
              {mm}:{ss}
            </span>
          </>
        )}
        <button
          className="tray-btn"
          title={muted ? 'Unmute' : 'Mute'}
          onClick={() => {
            setMuted(!muted)
            setMutedState(!muted)
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
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
  return <div className="toast">{toast.text}</div>
}

/** Tutorial helper, rendered inside the herdr sidebar. */
export function Herdy() {
  const s = useGame()
  const a = s.agents[0]
  if (!a) return null
  const briefRead = s.mails.some((m) => m.read)
  let text: string
  if (!a.built && a.status === 'idle') {
    text = 'Your agent is idle (○). Idle agents are wasted time! Pick a prompt with ↑↓ and press Enter, or just click one.'
  } else if (a.status === 'working' && !briefRead) {
    text = 'Spinner = working. That is what you want! While it works, read the client mail (M). It has useful hints.'
  } else if (a.status === 'blocked') {
    text = 'Red = the agent needs you. Read what it is asking before you approve!'
  } else if (a.status === 'done') {
    const locked = a.choices.find((c) => c.lock && !isUnlocked(s, a, c))
    if (locked) {
      text = `Green = done. Don't continue blind: check the ${locked.lock === 'browser' ? 'Browser (B)' : locked.lock === 'explorer' ? 'Explorer (E)' : 'Mail (M)'} to see the result. A sharper prompt unlocks!`
    } else {
      text = 'Now you know what is wrong. Specific prompts are faster and more reliable. Send one quickly to get back to working!'
    }
  } else {
    text = 'Keep it working! "busy %" in the taskbar is your utilization. Press N to jump to whichever agent needs you.'
  }
  return (
    <div className="herdy">
      <div className="herdy-h">🐑 herdy</div>
      <div className="herdy-text">{text}</div>
    </div>
  )
}
