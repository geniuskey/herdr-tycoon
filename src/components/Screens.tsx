import { allIssues, rankFor, RANKS, useGame } from '../game/store'
import { PROJECTS, STAGES } from '../scenarios'
import { PREVIEWS } from '../previews'
import { LangSwitch } from './Shell'
import { useT } from '../i18n'

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
  const { d, tx } = useT()

  return (
    <Dialog title={d.welcome} width={560}>
      <div className="title-hero">
        <div className="logo">🐑</div>
        <div>
          <h2 style={{ margin: 0 }}>Herdr Tycoon</h2>
          <div className="muted">{d.tagline}</div>
        </div>
        <LangSwitch />
      </div>
      <fieldset>
        <legend>{d.career}</legend>
        <div>
          {d.rank}: <b>{tx(rank.title)}</b> · {progress.xp} XP
          {nextRank && <span className="muted">{d.nextRank(tx(nextRank.title), nextRank.xp)}</span>}
        </div>
      </fieldset>
      <fieldset>
        <legend>{d.stages}</legend>
        {STAGES.map((st, i) => {
          const locked = i > 0 && !(progress.stars[i - 1] >= 1) && progress.stars[i] === undefined
          return (
            <div key={st.id} className="stage-row">
              <div>
                <b>
                  {i}. {tx(st.name)}
                </b>
                <div className="small muted">{tx(st.subtitle)}</div>
              </div>
              <Stars n={progress.stars[i] ?? 0} />
              <button className="accent" disabled={locked} onClick={() => openStage(i)}>
                {locked ? '🔒' : d.play}
              </button>
            </div>
          )
        })}
        <div className="small muted" style={{ marginTop: 6 }}>
          {d.unlockHint}
        </div>
      </fieldset>
    </Dialog>
  )
}

export function IntroScreen() {
  const stageIndex = useGame((s) => s.stageIndex)
  const beginPlay = useGame((s) => s.beginPlay)
  const st = STAGES[stageIndex]
  const { d, tx } = useT()
  return (
    <Dialog title={d.stageTitle(stageIndex, tx(st.name))}>
      <p>
        <b>{tx(st.subtitle)}</b> · {d.minutes(Math.round(st.seconds / 60))}
      </p>
      <p>
        {d.projectsLabel}: {st.projects.map((p) => tx(PROJECTS[p].title)).join(', ')}
      </p>
      <fieldset>
        <legend>{d.tips}</legend>
        <ul className="tips">
          {st.lessons.map((l) => (
            <li key={l.en}>{tx(l)}</li>
          ))}
        </ul>
      </fieldset>
      <fieldset>
        <legend>{d.stars}</legend>
        <div className="small">{d.starRules}</div>
      </fieldset>
      <div style={{ textAlign: 'right', marginTop: 10 }}>
        <button className="accent" autoFocus onClick={beginPlay}>
          {d.startBtn}
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
  const { d, tx, lang } = useT()

  const verdict =
    r.utilization >= 0.7 ? d.verdictGreat : r.utilization >= 0.5 ? d.verdictOk : d.verdictBad

  return (
    <Dialog title={d.stageComplete(stageIndex, tx(STAGES[stageIndex].name))} width={760}>
      <div className="result-top">
        <Stars n={r.stars} />
        <div>{verdict}</div>
      </div>
      <div className="result-stats">
        <div>
          <div className="big">{Math.round(r.utilization * 100)}%</div>
          {d.utilization}
        </div>
        <div>
          <div className="big">{Math.round(r.quality * 100)}%</div>
          {d.quality}
        </div>
        <div>
          <div className="big">{r.caught}</div>
          {d.threatsCaught}
        </div>
        <div>
          <div className="big">+{r.xp}</div>XP · {tx(rankFor(progress.xp).title)}
        </div>
      </div>
      <fieldset>
        <legend>{d.beforeAfter}</legend>
        <div className="ba-grid">
          {agents.map((a) => {
            const base = PROJECTS[a.projectId].issues.map((i) => i.id)
            const P = PREVIEWS[a.projectId]
            const fixedTitles = a.fixed.filter((f) => f !== 'regression').map((f) => tx(allIssues(a.projectId).find((i) => i.id === f)!.title))
            return (
              <div key={a.id} className="ba-row">
                <div className="ba-name">{tx(PROJECTS[a.projectId].title)}</div>
                <div className="ba-thumb">
                  <div className="ba-inner">{P({ open: base, fixed: [], polish: 0, lang })}</div>
                </div>
                <div className="ba-arrow">→</div>
                <div className="ba-thumb">
                  {a.built ? <div className="ba-inner">{P({ open: a.open, fixed: a.fixed, polish: a.polish, lang })}</div> : <div className="no-site small">{d.neverBuilt}</div>}
                </div>
                <div className="ba-list small">
                  {fixedTitles.map((t) => (
                    <div key={t}>✔ {t}</div>
                  ))}
                  {a.open.includes('regression') && <div className="bad">{d.shippedCrash}</div>}
                  {a.polish > 0 && <div>{d.polishTasks(a.polish)}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </fieldset>
      <div className="result-buttons">
        <button onClick={goTitle}>{d.stageSelectBtn}</button>
        <button onClick={() => openStage(stageIndex)}>{d.retry}</button>
        {hasNext && (
          <button className="accent" autoFocus disabled={r.stars < 1 && !(progress.stars[stageIndex] >= 1)} onClick={() => openStage(stageIndex + 1)}>
            {d.nextStage}
          </button>
        )}
      </div>
    </Dialog>
  )
}
