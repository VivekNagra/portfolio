import { useEffect, useMemo, useRef, useState } from 'react'
import Mishubishi from './Mishubishi.tsx'

const COUNTDOWN_TARGET_UTC_MS = Date.UTC(2026, 1, 14, 11, 0, 0) // 14 Feb 2026 12:00 CET == 11:00 UTC

// Put an mp3 in /public (example: public/valentine.mp3)
const AUDIO_SRC = '/valentine.mp3'

// Build-time load of images from the repo root `temp/` folder.
// This keeps your request: “slideshow photos should load the photos in the folder temp”.
const TEMP_IMAGES = import.meta.glob('../../temp/*.{png,jpg,jpeg,JPG,JPEG,webp,WEBP,gif,GIF}', {
  eager: true,
  import: 'default',
})

function getTempSlides() {
  const entries = Object.entries(TEMP_IMAGES)
  // stable sort by filename
  entries.sort((a, b) => a[0].localeCompare(b[0]))
  return entries.map(([, url]) => url)
}

export default function MishubishiShell() {
  const containerRef = useRef(null)
  const audioRef = useRef(null)
  const [musicOn, setMusicOn] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [remaining, setRemaining] = useState(() => getRemainingParts(COUNTDOWN_TARGET_UTC_MS))

  const slides = useMemo(() => getTempSlides(), [])
  const [slideIdx, setSlideIdx] = useState(0)

  // Detect “accepted” without changing your Mishubishi code.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const compute = () => {
      const yay = el.querySelector('h1')
      const isYay = yay && yay.textContent && yay.textContent.trim() === 'Yay!!!'
      setAccepted(Boolean(isYay))
    }

    compute()
    const obs = new MutationObserver(compute)
    obs.observe(el, { subtree: true, childList: true, characterData: true, attributes: true })
    return () => obs.disconnect()
  }, [])

  // Auto-advance slideshow only after accepted.
  useEffect(() => {
    if (!accepted) return
    if (slides.length <= 1) return
    const t = window.setInterval(() => {
      setSlideIdx((i) => (i + 1) % slides.length)
    }, 3500)
    return () => window.clearInterval(t)
  }, [accepted, slides.length])

  // Countdown (only after accepted).
  useEffect(() => {
    if (!accepted) return
    const tick = () => setRemaining(getRemainingParts(COUNTDOWN_TARGET_UTC_MS))
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
  }, [accepted])

  // Prime audio src when accepted (browser may still require a click).
  useEffect(() => {
    if (!accepted) return
    if (!audioRef.current) return
    if (musicOn) return
    audioRef.current.src = AUDIO_SRC
  }, [accepted, musicOn])

  async function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.src) audio.src = AUDIO_SRC

    if (!audio.paused) {
      audio.pause()
      setMusicOn(false)
      return
    }

    try {
      await audio.play()
      setMusicOn(true)
    } catch {
      // Usually means: audio file missing OR autoplay restriction.
      // Keep UI responsive (so the user sees the click did something).
      setMusicOn(false)
      window.alert('Music could not start. Make sure you added /public/valentine.mp3, then tap again.')
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Mishubishi />

      <audio ref={audioRef} loop preload="none" />

      <button
        type="button"
        onClick={toggleMusic}
        className="pointer-events-auto fixed bottom-4 right-4 z-50 rounded-full border border-zinc-200 bg-white/95 px-4 py-3 text-sm font-extrabold text-zinc-800 shadow-lg backdrop-blur"
      >
        Music: {musicOn ? 'On' : 'Off'}
      </button>

      {accepted && (
        <>
          <div className="pointer-events-none fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white/95 px-5 py-3 text-center shadow-lg backdrop-blur">
            <div className="text-xs font-extrabold text-zinc-700">
              since you said yes please be ready for our date ill come pick you up in.
            </div>
            <div className="mt-2 font-script text-3xl text-rose-600 leading-none tabular-nums">
              {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
            </div>
            <div className="mt-1 text-[11px] font-bold text-zinc-600">
              Countdown to 14 Feb 2026 · 12:00 CET
            </div>
          </div>

          {slides.length > 0 && (
            <div className="pointer-events-auto fixed bottom-4 left-1/2 z-40 w-[320px] -translate-x-1/2 overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-lg backdrop-blur">
              <img src={slides[slideIdx]} alt="Slideshow" className="h-56 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setSlideIdx((i) => (i - 1 + slides.length) % slides.length)}
                  className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-extrabold text-zinc-800"
                >
                  Prev
                </button>
                <div className="text-xs font-bold text-zinc-700">
                  {slideIdx + 1} / {slides.length}
                </div>
                <button
                  type="button"
                  onClick={() => setSlideIdx((i) => (i + 1) % slides.length)}
                  className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-extrabold text-zinc-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function getRemainingParts(targetUtcMs) {
  const now = Date.now()
  let diff = Math.max(0, targetUtcMs - now)

  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  diff -= days * 24 * 60 * 60 * 1000
  const hours = Math.floor(diff / (60 * 60 * 1000))
  diff -= hours * 60 * 60 * 1000
  const minutes = Math.floor(diff / (60 * 1000))
  diff -= minutes * 60 * 1000
  const seconds = Math.floor(diff / 1000)

  return {
    days,
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  }
}

