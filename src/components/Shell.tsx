import { useEffect, useState } from 'react'
import { allDone, briefRead, isUnlocked, useGame, type WindowId } from '../game/store'
import { setMuted } from '../game/sound'
import { Dot } from './Terminal'
import { LANGS, useLang, useT } from '../i18n'
import { activeHint, useIdle } from '../game/hint'

const APPS: { id: WindowId; icon: string }[] = [
  { id: 'terminal', icon: '❯_' },
  { id: 'browser', icon: '🌐' },
  { id: 'explorer', icon: '📁' },
  { id: 'mail', icon: '✉️' },
]

/** EN / 한국어 toggle. */
export function LangSwitch({ compact }: { compact?: boolean }) {
  const lang = useLang((s) => s.lang)
  const setLang = useLang((s) => s.setLang)
  const { d } = useT()
  if (compact) {
    const other = lang === 'en' ? 'ko' : 'en'
    return (
      <button className="tray-btn tray-lang" title={d.language} onClick={() => setLang(other)}>
        {lang === 'en' ? 'EN' : '한'}
      </button>
    )
  }
  return (
    <div className="lang-switch" role="group" aria-label={d.language}>
      {LANGS.map((l) => (
        <button key={l} className={l === lang ? 'active' : ''} onClick={() => setLang(l)}>
          {l === 'en' ? 'EN' : '한국어'}
        </button>
      ))}
    </div>
  )
}

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
  const { d } = useT()
  const playing = screen !== 'title' && agents.length > 0
  const endStage = useGame((s) => s.endStage)
  const finished = useGame((s) => allDone(s.agents, s.time))
  const idle = useIdle((s) => s.idle)
  const hinted = useGame((s) => activeHint(s, idle)?.win)
  const mm = Math.floor(time / 60)
  const ss = Math.floor(time % 60)
    .toString()
    .padStart(2, '0')

  return (
    <div className="taskbar">
      <div className="tb-center">
        <button className={`tb-app tb-start ${menu ? 'active' : ''}`} onClick={() => setMenu(!menu)} title={d.start}>
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
              <button key={a.id} className={`tb-app ${focused === a.id && !w.minimized ? 'active' : ''} ${w.minimized ? '' : 'open'} ${hinted === a.id ? 'hint' : ''}`} onClick={() => focus(a.id)} title={d.apps[a.id]}>
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
            <div className="start-item" onClick={() => (setMenu(false), openStage(stageIndex, true))}>
              {d.restartStage}
            </div>
          )}
          <div className="start-item" onClick={() => (setMenu(false), goTitle())}>
            {d.stageSelect}
          </div>
        </div>
      )}
      <div className="tray">
        {playing && (
          <>
            <span className="tray-dots" title={d.agentStatus}>
              {agents.map((a) => (
                <Dot key={a.id} status={a.status} />
              ))}
            </span>
            <span title={d.utilTitle} className={`util ${util >= 0.7 ? 'good' : util >= 0.5 ? 'ok' : 'bad'}`}>
              {d.busy(Math.round(util * 100))}
            </span>
            <span className="tray-time">
              {mm}:{ss}
            </span>
            <button className={`tray-end ${finished ? 'ready' : ''}`} title={d.endShiftTitle} onClick={endStage}>
              {d.endShift}
            </button>
          </>
        )}
        <LangSwitch compact />
        <button
          className="tray-btn"
          title={muted ? d.unmute : d.mute}
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
  const { tx } = useT()
  const [, force] = useState(0)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => force((x) => x + 1), toast.until - performance.now() + 20)
    return () => clearTimeout(t)
  }, [toast])
  if (!toast || performance.now() > toast.until) return null
  return <div className="toast">{tx(toast.text)}</div>
}

/** Tutorial helper, rendered inside the herdr sidebar. */
export function Herdy() {
  const s = useGame()
  const { d } = useT()
  const a = s.agents[0]
  if (!a) return null
  const anyMailRead = s.mails.some((m) => m.read)
  let text: string
  if (allDone(s.agents, s.time)) {
    text = d.herdyAllDone
  } else if (!a.built && a.status === 'idle' && !briefRead(s, a.projectId)) {
    text = d.herdyBrief
  } else if (!a.built && a.status === 'idle') {
    text = d.herdyIdle
  } else if (a.status === 'working' && !anyMailRead) {
    text = d.herdyWorking
  } else if (a.status === 'blocked') {
    text = d.herdyBlocked
  } else if (a.status === 'done') {
    const locked = a.choices.find((c) => c.lock && !isUnlocked(s, a, c))
    if (locked) {
      text = d.herdyLocked(d.place[locked.lock!])
    } else {
      text = d.herdyUnlocked
    }
  } else {
    text = d.herdyDefault
  }
  return (
    <div className="herdy">
      <div className="herdy-h">🐑 herdy</div>
      <div className="herdy-text">{text}</div>
    </div>
  )
}
