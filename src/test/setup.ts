import { afterEach, vi } from 'vitest'

// The store persists progress and plays sounds; give it in-memory stand-ins under Node.
const mem = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
})
vi.stubGlobal(
  'Audio',
  class {
    volume = 1
    currentTime = 0
    play() {
      return Promise.resolve()
    }
  },
)

afterEach(() => {
  mem.clear()
  vi.restoreAllMocks()
})
