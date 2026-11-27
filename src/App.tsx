import { useEffect } from 'react'
import { useGame } from './game/store'
import { Terminal } from './components/Terminal'
import { Browser, Explorer, MailApp } from './components/Apps'
import { Taskbar, Toast } from './components/Shell'
import { useT } from './i18n'
import { markActive } from './game/hint'
import { IntroScreen, ResultScreen, TitleScreen } from './components/Screens'

function useGameLoop() {
  useEffect(() => {
    let last = performance.now()
    let raf = 0
    const loop = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000)
      last = now
      useGame.getState().tick(dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
}

function useAutoResize() {
  useEffect(() => {
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => useGame.getState().fitToViewport())
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [])
}

/** Save the running stage when the tab is hidden or closed, so a reload can resume it. */
function useSaveOnLeave() {
  useEffect(() => {
    const save = () => useGame.getState().saveSession()
    const onVis = () => document.visibilityState === 'hidden' && save()
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])
}

/** Any key press, click or scroll counts as activity; a quiet spell shows the window hint. */
function useActivity() {
  const screen = useGame((s) => s.screen)
  useEffect(() => {
    markActive()
  }, [screen])
  useEffect(() => {
    const opts = { capture: true, passive: true }
    window.addEventListener('keydown', markActive, opts)
    window.addEventListener('pointerdown', markActive, opts)
    window.addEventListener('wheel', markActive, opts)
    return () => {
      window.removeEventListener('keydown', markActive, opts)
      window.removeEventListener('pointerdown', markActive, opts)
      window.removeEventListener('wheel', markActive, opts)
    }
  }, [])
}

function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = useGame.getState()
      if (g.screen !== 'playing' || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key
      const agent = g.agents[g.selected]
      if (k === 'ArrowUp') g.moveCursor(-1)
      else if (k === 'ArrowDown') g.moveCursor(1)
      else if (k === 'ArrowLeft') g.stepAgent(-1)
      else if (k === 'ArrowRight') g.stepAgent(1)
      else if (k === 'Enter') g.send()
      else if (/^[1-4]$/.test(k)) g.send(Number(k) - 1)
      else if (k === 'Tab') g.cycleFocus()
      else if (k === 'n' || k === 'N') g.nextAttention()
      else if (k === 'b' || k === 'B') {
        if (agent) g.setBrowserTab(agent.projectId)
        g.focus('browser')
      } else if (k === 'e' || k === 'E') {
        if (agent) g.setExplorerProject(agent.projectId)
        g.focus('explorer')
      } else if (k === 'm' || k === 'M') {
        g.focus('mail')
        // Prefer the selected agent's unread mail (e.g. its brief), then the newest unread.
        const unread = g.mails.filter((m) => !m.read).sort((a, b) => b.at - a.at)
        const target = unread.find((m) => m.projectId === agent?.projectId) ?? unread[0]
        if (target) g.readMail(target.id)
      } else if (k === 't' || k === 'T' || k === 'Escape') g.focus('terminal')
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export default function App() {
  useGameLoop()
  useKeyboard()
  useAutoResize()
  useSaveOnLeave()
  useActivity()
  const screen = useGame((s) => s.screen)
  const hasStage = useGame((s) => s.agents.length > 0)
  const { d } = useT()

  return (
    <div className="desktop">
      {screen === 'title' && (
        <div className="desktop-icons">
          <div className="d-icon">🗑<span>{d.recycleBin}</span></div>
          <div className="d-icon">💻<span>{d.thisPC}</span></div>
        </div>
      )}
      {hasStage && screen !== 'title' && (
        <>
          <Terminal />
          <Browser />
          <Explorer />
          <MailApp />
        </>
      )}
      {screen === 'title' && <TitleScreen />}
      {screen === 'intro' && <IntroScreen />}
      {screen === 'result' && <ResultScreen />}
      <Toast />
      <Taskbar />
      <div className="small-screen">{d.smallScreen}</div>
    </div>
  )
}
