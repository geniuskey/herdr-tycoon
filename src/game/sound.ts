// Notification sounds from herdr (Apache-2.0): https://github.com/herdrdev/herdr/tree/master/assets/sounds
const cache: Record<string, HTMLAudioElement> = {}
let muted = false

export function setMuted(m: boolean) {
  muted = m
}

export function playSound(name: 'done' | 'request') {
  if (muted) return
  try {
    const a = (cache[name] ??= new Audio(`${import.meta.env.BASE_URL}sounds/${name}.mp3`))
    a.volume = 0.5
    a.currentTime = 0
    void a.play().catch(() => {})
  } catch {
    /* audio unavailable */
  }
}
