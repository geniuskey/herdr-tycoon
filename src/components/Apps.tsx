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
    <Window id="browser" title={`${agent.built ? p.title : 'localhost'} - Netscape Navigator`} icon="🌐" bodyClass="browser-body">
      <div className="browser-tabs">
        {agents.map((a) => (
          <button key={a.id} className={`btab ${a.projectId === tab ? 'active' : ''}`} onClick={() => setTab(a.projectId)}>
            {a.status === 'done' && <span className="btab-new">●</span>}
            {PROJECTS[a.projectId].title}
          </button>
        ))}
      </div>
      <div className="browser-bar">
        <button>◀</button>
        <button>▶</button>
        <button>⟳</button>
        <div className="address">http://localhost:{p.port}/</div>
      </div>
      <div className="browser-view">
        {!agent.built ? (
          <div className="no-site">
            <div style={{ fontSize: 40 }}>🦖</div>
            <h3>This site can't be reached</h3>
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
                <div className="muted small">Click outside or fix the code to dismiss this overlay.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Window>
  )
}

export function Explorer() {
  const agents = useGame((s) => s.agents)
  const sel = useGame((s) => s.explorerProject)
  const setSel = useGame((s) => s.setExplorerProject)
  const agent = agents.find((a) => a.projectId === sel) ?? agents[0]
  if (!agent) return null
  const p = PROJECTS[agent.projectId]

  return (
    <Window id="explorer" title={`Exploring - C:\\projects\\${p.name}`} icon="📁" bodyClass="explorer-body">
      <div className="explorer">
        <ul className="tree-view ex-tree">
          <li>📂 projects</li>
          {agents.map((a) => (
            <li key={a.id} className={a.projectId === sel ? 'ex-sel' : ''} onClick={() => setSel(a.projectId)}>
              &nbsp;&nbsp;{a.projectId === sel ? '📂' : '📁'} {PROJECTS[a.projectId].name}
            </li>
          ))}
        </ul>
        <div className="ex-files">
          {agent.files.length === 0 && <div className="muted">(empty folder)</div>}
          {agent.files.map((f) => (
            <div key={f.path} className={`ex-file ${f.mark ?? ''}`}>
              <span>{f.path.endsWith('/') ? '📁' : f.path.includes('.') ? '📄' : '📁'}</span>
              <span className="ex-path">{f.path}</span>
              {f.mark === 'new' && <span className="ex-mark">✨ new</span>}
              {f.mark === 'modified' && <span className="ex-mark">✏️ modified</span>}
              {f.mark === 'warn' && <span className="ex-mark warn">⚠ hmm?</span>}
            </div>
          ))}
          {agent.built && !agent.files.some((f) => f.path.includes('test')) && <div className="ex-hint">No test files found.</div>}
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{agent.files.length} object(s)</p>
        <p className="status-bar-field">C:\projects\{p.name}</p>
      </div>
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
    <Window id="mail" title={`Outlook Express — Inbox${unread ? ` (${unread})` : ''}`} icon="📧" bodyClass="mail-body">
      <div className="mail">
        <div className="mail-list">
          {sorted.map((m) => (
            <div key={m.id} className={`mail-item ${m.read ? '' : 'unread'} ${m.id === selectedId ? 'sel' : ''}`} onClick={() => readMail(m.id)}>
              <div>{m.read ? '📭' : '📩'} {m.from}</div>
              <div className="small">{m.subject}</div>
            </div>
          ))}
        </div>
        <div className="mail-view">
          {sel ? (
            <>
              <div className="mail-head">
                <b>{sel.subject}</b>
                <div className="small muted">From: {sel.from} · re: {PROJECTS[sel.projectId].name}</div>
              </div>
              <p>{sel.body}</p>
            </>
          ) : (
            <div className="muted">Select a message to read it.</div>
          )}
        </div>
      </div>
    </Window>
  )
}
