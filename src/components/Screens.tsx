import { allIssues, rankFor, RANKS, useGame } from '../game/store'
import { PROJECTS, STAGES } from '../scenarios'
import { PREVIEWS } from '../previews'

function Stars({ n }: { n: number }) {
  return (
    <span className="stars">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'on' : ''}>
          ★
        </span>
      ))}
    </span>
  )
}

function Dialog({ title, children, width = 520 }: { title: string; children: React.ReactNode; width?: number }) {
  return (
    <div className="modal-backdrop">
      <div className="dialog" style={{ width }}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  )
}

export function TitleScreen() {
  const progress = useGame((s) => s.progress)
  const openStage = useGame((s) => s.openStage)
  const rank = rankFor(progress.xp)
  const nextRank = RANKS.find((r) => r.xp > progress.xp)

  return (
    <Dialog title="Welcome" width={560}>
      <div className="title-hero">
        <div className="logo">🐑</div>
        <div>
          <h2 style={{ margin: 0 }}>Herdr Tycoon</h2>
          <div className="muted">Keep every agent busy. Never let a pane go idle.</div>
        </div>
      </div>
      <fieldset>
        <legend>Your career</legend>
        <div>
          Rank: <b>{rank.title}</b> · {progress.xp} XP
          {nextRank && <span className="muted"> (next: {nextRank.title} at {nextRank.xp})</span>}
        </div>
      </fieldset>
      <fieldset>
        <legend>Stages</legend>
        {STAGES.map((st, i) => {
          const locked = i > 0 && !(progress.stars[i - 1] >= 1) && progress.stars[i] === undefined
          return (
            <div key={st.id} className="stage-row">
              <div>
                <b>
                  {i}. {st.name}
                </b>
                <div className="small muted">{st.subtitle}</div>
              </div>
              <Stars n={progress.stars[i] ?? 0} />
              <button className="accent" disabled={locked} onClick={() => openStage(i)}>
                {locked ? '🔒' : 'Play'}
              </button>
            </div>
          )
        })}
        <div className="small muted" style={{ marginTop: 6 }}>
          Get ★ on a stage to unlock the next one. More stages coming soon.
        </div>
      </fieldset>
    </Dialog>
  )
}

export function IntroScreen() {
  const stageIndex = useGame((s) => s.stageIndex)
  const beginPlay = useGame((s) => s.beginPlay)
  const st = STAGES[stageIndex]
  return (
    <Dialog title={`Stage ${stageIndex}: ${st.name}`}>
      <p>
        <b>{st.subtitle}</b> · {Math.round(st.seconds / 60)} min
      </p>
      <p>Projects: {st.projects.map((p) => PROJECTS[p].title).join(', ')}</p>
      <fieldset>
        <legend>Tips</legend>
        <ul className="tips">
          {st.lessons.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </fieldset>
      <fieldset>
        <legend>Stars</legend>
        <div className="small">★ utilization ≥ 50% · ★ quality ≥ 60% · ★ utilization ≥ 70%</div>
      </fieldset>
      <div style={{ textAlign: 'right', marginTop: 10 }}>
        <button className="accent" autoFocus onClick={beginPlay}>
          Start ▶
        </button>
      </div>
    </Dialog>
  )
}

export function ResultScreen() {
  const r = useGame((s) => s.result)!
  const agents = useGame((s) => s.agents)
  const stageIndex = useGame((s) => s.stageIndex)
  const openStage = useGame((s) => s.openStage)
  const goTitle = useGame((s) => s.goTitle)
  const progress = useGame((s) => s.progress)
  const hasNext = stageIndex + 1 < STAGES.length

  const verdict =
    r.utilization >= 0.7 ? 'Your agents never stopped. True herdr shepherd!' : r.utilization >= 0.5 ? 'Solid shift. A few agents took naps.' : 'Your agents spent a lot of time waiting for you.'

  return (
    <Dialog title={`Stage ${stageIndex} complete: ${STAGES[stageIndex].name}`} width={760}>
      <div className="result-top">
        <Stars n={r.stars} />
        <div>{verdict}</div>
      </div>
      <div className="result-stats">
        <div>
          <div className="big">{Math.round(r.utilization * 100)}%</div>utilization
        </div>
        <div>
          <div className="big">{Math.round(r.quality * 100)}%</div>quality
        </div>
        <div>
          <div className="big">{r.caught}</div>threats caught
        </div>
        <div>
          <div className="big">+{r.xp}</div>XP · {rankFor(progress.xp).title}
        </div>
      </div>
      <fieldset>
        <legend>Before → After</legend>
        <div className="ba-grid">
          {agents.map((a) => {
            const base = PROJECTS[a.projectId].issues.map((i) => i.id)
            const P = PREVIEWS[a.projectId]
            const fixedTitles = a.fixed.filter((f) => f !== 'regression').map((f) => allIssues(a.projectId).find((i) => i.id === f)!.title)
            return (
              <div key={a.id} className="ba-row">
                <div className="ba-name">{PROJECTS[a.projectId].title}</div>
                <div className="ba-thumb">
                  <div className="ba-inner">{P({ open: base, fixed: [], polish: 0 })}</div>
                </div>
                <div className="ba-arrow">→</div>
                <div className="ba-thumb">
                  {a.built ? <div className="ba-inner">{P({ open: a.open, fixed: a.fixed, polish: a.polish })}</div> : <div className="no-site small">never built</div>}
                </div>
                <div className="ba-list small">
                  {fixedTitles.map((t) => (
                    <div key={t}>✔ {t}</div>
                  ))}
                  {a.open.includes('regression') && <div className="bad">✘ Shipped with a crash</div>}
                  {a.polish > 0 && <div>✨ {a.polish} polish task(s)</div>}
                </div>
              </div>
            )
          })}
        </div>
      </fieldset>
      <div className="result-buttons">
        <button onClick={goTitle}>Stage select</button>
        <button onClick={() => openStage(stageIndex)}>Retry</button>
        {hasNext && (
          <button className="accent" autoFocus disabled={r.stars < 1 && !(progress.stars[stageIndex] >= 1)} onClick={() => openStage(stageIndex + 1)}>
            Next stage ▶
          </button>
        )}
      </div>
    </Dialog>
  )
}
