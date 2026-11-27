// Balance guard rails: the scripted players in ./autoplay must rank the way the game teaches.
// Seeded, so a failure here means a real change in balance, not bad luck.
import { describe, expect, it, vi } from 'vitest'
import { FAST, MEDIUM, play, seeded, type Policy } from './autoplay'
import { STAGES } from '../scenarios'

const RUNS = 30

function sample(stage: number, p: Policy) {
  vi.spyOn(Math, 'random').mockImplementation(seeded(stage * 1000 + p.name.length))
  const results = Array.from({ length: RUNS }, () => play(stage, p))
  vi.restoreAllMocks()
  const avg = (f: (r: (typeof results)[number]) => number) => results.reduce((s, r) => s + f(r), 0) / RUNS
  return {
    finish: avg((r) => r.finishTime ?? r.time),
    stars: avg((r) => r.stars),
    threeStar: results.filter((r) => r.stars === 3).length / RUNS,
  }
}

describe.each(STAGES.map((s, i) => [i, s.par] as const))('stage %i (par %is)', (stage) => {
  const great = sample(stage, FAST)

  it('gives a fast, careful player 3★', () => {
    expect(great.threeStar).toBeGreaterThanOrEqual(0.9)
  })

  it('gives a medium-speed careful player at least 2★', () => {
    expect(sample(stage, MEDIUM).stars).toBeGreaterThanOrEqual(1.9)
  })

  it.each([
    ['ok prompts (skipping inspection)', { ...FAST, name: 'ok', tier: 'ok' as const }],
    ['vague prompts', { ...FAST, name: 'vague', tier: 'vague' as const }],
    ['shortcut prompts', { ...FAST, name: 'trap', tier: 'trap' as const }],
  ])('sharp prompts finish faster and score higher than %s', (_, p) => {
    const other = sample(stage, p)
    expect(great.finish).toBeLessThan(other.finish)
    expect(great.stars).toBeGreaterThan(other.stars)
  })

  it('does not reward approving destructive commands', () => {
    expect(sample(stage, { ...FAST, name: 'blind', safe: false }).stars).toBeLessThan(great.stars)
  })

  it('does not penalize polishing after the work is done', () => {
    expect(sample(stage, { ...FAST, name: 'polish', polishFor: 60 }).threeStar).toBeGreaterThanOrEqual(0.85)
  })
})
