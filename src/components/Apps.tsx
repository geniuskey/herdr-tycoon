import { useGame } from '../game/store'
import { PROJECTS } from '../scenarios'
import { PREVIEWS } from '../previews'
import { Window } from './Window'

export function Browser() {
  const agents = useGame((s) => s.agents)
  const tab = useGame((s) => s.browserTab)
  const setTab = useGame((s) => s.setBrowserTab)
  const agent = agents.find((a) => a.projectId === tab) ?? agents[0]
  if (!agent) return null
  const p = PROJECTS[agent.projectId]
  const Preview = PREVIEWS[agent.projectId]

  return (
    <Window
      id="browser"
      icon=""
      bodyClass="edge-body"
      title={
        <div className="edge-tabs">
          {agents.map((a) => (
            <button key={a.id} className={`edge-tab ${a.projectId === tab ? 'active' : ''}`} onClick={() => setTab(a.projectId)}>
              <span className="edge-fav">{a.built ? '◆' : '○'}</span>
              <span className="edge-tab-label">{a.built ? PROJECTS[a.projectId].title : `localhost:${PROJECTS[a.projectId].port}`}</span>
              {a.status === 'done' && <span className="edge-badge" title="New result to review" />}
            </button>
          ))}
        </div>
      }
    >
      <div className="edge-bar">
        <span className="edge-nav">←</span>
        <span className="edge-nav">→</span>
        <span className="edge-nav">↻</span>
        <div className="edge-address">
          <span className="edge-lock">ⓘ</span> localhost:{p.port}
        </div>
      </div>
      <div className="edge-view">
        {!agent.built ? (
          <div className="no-site">
            <div className="no-site-icon">☹</div>
            <h3>Hmmm… can't reach this page</h3>
            <p>localhost refused to connect.</p>
            <p className="muted">{agent.status === 'working' ? 'The agent is scaffolding the project…' : 'ERR_CONNECTION_REFUSED: give your agent a task first.'}</p>
          </div>
        ) : (
          <div className="pv-root">
            {Preview({ open: agent.open, fixed: agent.fixed, polish: agent.polish })}
            {agent.open.includes('regression') && (
              <div className="error-overlay">
                <div className="eo-title">[plugin:vite] Uncaught TypeError</div>
                <div className="eo-msg">Cannot read properties of undefined (reading 'map')</div>
                <pre>{`  at App (src/App.tsx:23:18)\n  at renderWithHooks (react-dom.js:1234)`}</pre>
                <div className="eo-hint">Fix the code to dismiss this overlay.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Window>
  )
}

function fileIcon(path: string) {
  if (path.endsWith('.jpg') || path.endsWith('.png')) return '🖼️'
  if (path.endsWith('.md')) return '📝'
  if (path.startsWith('.env') || path === '.gitignore') return '⚙️'
  if (path.includes('test')) return '🧪'
  return '📄'
}

export function Explorer() {
  const agents = useGame((s) => s.agents)
  const sel = useGame((s) => s.explorerProject)
  const setSel = useGame((s) => s.setExplorerProject)
  const agent = agents.find((a) => a.projectId === sel) ?? agents[0]
  if (!agent) return null
  const p = PROJECTS[agent.projectId]

  return (
    <Window id="explorer" title={p.name} icon="📁" bodyClass="fx-body">
      <div className="fx-bar">
        <span className="fx-crumb">
          This PC <span className="muted">›</span> projects <span className="muted">›</span> <b>{p.name}</b>
        </span>
      </div>
      <div className="fx">
        <div className="fx-nav">
          <div className="fx-nav-h">projects</div>
          {agents.map((a) => (
            <div key={a.id} className={`fx-nav-item ${a.projectId === sel ? 'sel' : ''}`} onClick={() => setSel(a.projectId)}>
              📁 {PROJECTS[a.projectId].name}
            </div>
          ))}
        </div>
        <div className="fx-files">
          <div className="fx-head">
            <span>Name</span>
            <span>Status</span>
          </div>
          {agent.files.length === 0 && <div className="fx-empty muted">This folder is empty.</div>}
          {agent.files.map((f) => (
            <div key={f.path} className={`fx-file ${f.mark ?? ''}`}>
              <span className="fx-name">
                {fileIcon(f.path)} {f.path}
              </span>
              <span className="fx-mark">
                {f.mark === 'new' && <span className="pill new">new</span>}
                {f.mark === 'modified' && <span className="pill mod">modified</span>}
                {f.mark === 'warn' && <span className="pill warn">hmm?</span>}
              </span>
            </div>
          ))}
          {agent.built && !agent.files.some((f) => f.path.includes('test')) && <div className="fx-hint">⚠ No test files found.</div>}
        </div>
      </div>
      <div className="fx-status muted">{agent.files.length} items</div>
    </Window>
  )
}

export function MailApp() {
  const mails = useGame((s) => s.mails)
  const selectedId = useGame((s) => s.selectedMail)
  const readMail = useGame((s) => s.readMail)
  const sorted = [...mails].sort((a, b) => b.at - a.at)
  const sel = mails.find((m) => m.id === selectedId)
  const unread = mails.filter((m) => !m.read).length

  return (
    <Window id="mail" title={`Inbox${unread ? ` · ${unread} unread` : ''}`} icon="✉️" bodyClass="mail-body">
      <div className="mail">
        <div className="mail-list">
          {sorted.map((m) => (
            <div key={m.id} className={`mail-item ${m.read ? '' : 'unread'} ${m.id === selectedId ? 'sel' : ''}`} onClick={() => readMail(m.id)}>
              <div className="mail-avatar">{m.from[0]}</div>
              <div className="mail-meta">
                <div className="mail-from">{m.from}</div>
                <div className="mail-subj">{m.subject}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mail-view">
          {sel ? (
            <>
              <div className="mail-head">
                <div className="mail-title">{sel.subject}</div>
                <div className="muted small">
                  {sel.from} · re: {PROJECTS[sel.projectId].name}
                </div>
              </div>
              <p>{sel.body}</p>
            </>
          ) : (
            <div className="muted small">Select a message to read it.</div>
          )}
        </div>
      </div>
    </Window>
  )
}
