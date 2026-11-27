import { useRef, type ReactNode } from 'react'
import { useGame, type WindowId } from '../game/store'

export function Window({ id, title, icon, children, bodyClass }: { id: WindowId; title: string; icon: string; children: ReactNode; bodyClass?: string }) {
  const win = useGame((s) => s.windows.find((w) => w.id === id)!)
  const focused = useGame((s) => s.focused === id)
  const focus = useGame((s) => s.focus)
  const moveWindow = useGame((s) => s.moveWindow)
  const minimize = useGame((s) => s.minimize)
  const drag = useRef<{ dx: number; dy: number } | null>(null)

  if (win.minimized) return null

  return (
    <div
      className={`window os-window ${focused ? 'is-focused' : ''}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onPointerDownCapture={() => !focused && focus(id)}
    >
      <div
        className={`title-bar ${focused ? '' : 'inactive'}`}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const x = Math.max(-win.w + 80, Math.min(window.innerWidth - 80, e.clientX - drag.current.dx))
          const y = Math.max(0, Math.min(window.innerHeight - 70, e.clientY - drag.current.dy))
          moveWindow(id, x, y)
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <div className="title-bar-text">
          <span className="title-icon">{icon}</span> {title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => minimize(id)} />
          <button aria-label="Maximize" disabled />
          <button aria-label="Close" onClick={() => minimize(id)} />
        </div>
      </div>
      <div className={`window-body os-body ${bodyClass ?? ''}`}>{children}</div>
    </div>
  )
}
