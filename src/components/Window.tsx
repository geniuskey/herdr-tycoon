import { useRef, type ReactNode } from 'react'
import { useGame, type WindowId } from '../game/store'

export function Window({
  id,
  title,
  icon,
  children,
  bodyClass,
  dark,
  titleExtra,
}: {
  id: WindowId
  title: ReactNode
  icon: string
  children: ReactNode
  bodyClass?: string
  dark?: boolean
  titleExtra?: ReactNode
}) {
  const win = useGame((s) => s.windows.find((w) => w.id === id)!)
  const focused = useGame((s) => s.focused === id)
  const focus = useGame((s) => s.focus)
  const moveWindow = useGame((s) => s.moveWindow)
  const minimize = useGame((s) => s.minimize)
  const drag = useRef<{ dx: number; dy: number } | null>(null)

  if (win.minimized) return null

  return (
    <div
      className={`win ${dark ? 'win-dark' : ''} ${focused ? 'is-focused' : ''}`}
      style={{ left: Math.round(win.x), top: Math.round(win.y), width: Math.max(200, Math.round(win.w)), height: Math.max(140, Math.round(win.h)), zIndex: win.z }}
      onPointerDownCapture={() => !focused && focus(id)}
    >
      <div
        className="win-titlebar"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const x = Math.max(-win.w + 120, Math.min(window.innerWidth - 120, e.clientX - drag.current.dx))
          const y = Math.max(0, Math.min(window.innerHeight - 90, e.clientY - drag.current.dy))
          moveWindow(id, x, y)
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <div className="win-title">
          <span className="win-icon">{icon}</span>
          {title}
        </div>
        {titleExtra}
        <div className="win-controls">
          <button aria-label="Minimize" onClick={() => minimize(id)}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" /></svg>
          </button>
          <button aria-label="Maximize" disabled>
            <svg width="10" height="10" viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" /></svg>
          </button>
          <button aria-label="Close" className="close" onClick={() => minimize(id)}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 0l10 10M10 0L0 10" stroke="currentColor" /></svg>
          </button>
        </div>
      </div>
      <div className={`win-body ${bodyClass ?? ''}`}>{children}</div>
    </div>
  )
}
