import { useEffect } from 'react'
import { useGame } from './game/store'
import { Terminal } from './components/Terminal'
import { Browser, Explorer, MailApp } from './components/Apps'
import { Taskbar, Toast } from './components/Shell'
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
        const target = g.mails.filter((m) => !m.read).sort((a, b) => b.at - a.at)[0]
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
  const screen = useGame((s) => s.screen)
  const hasStage = useGame((s) => s.agents.length > 0)

  return (
    <div className="desktop">
      {screen === 'title' && (
        <div className="desktop-icons">
          <div className="d-icon">🗑<span>Recycle Bin</span></div>
          <div className="d-icon">💻<span>This PC</span></div>
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
      <div className="small-screen">Herdr Tycoon needs a desktop-sized screen (at least 1024px wide).</div>
    </div>
  )
}
