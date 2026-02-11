import { useEffect, useMemo, useRef, useState } from 'react'
import Mishubishi from './Mishubishi.tsx'

// Edit these to match your “Save the Date” details.
const SAVE_THE_DATE = {
  title: 'Save the Date',
  line1: 'Vivek & Manice',
  line2: '14 Feb 2026',
}

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
        className="pointer-events-auto fixed bottom-4 right-4 z-50 rounded-full border border-border bg-background/90 px-4 py-3 text-sm font-extrabold text-muted-foreground shadow-lg backdrop-blur"
      >
        Music: {musicOn ? 'On' : 'Off'}
      </button>

      {accepted && (
        <>
          <div className="pointer-events-none fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border bg-background/90 px-4 py-3 text-center shadow-lg backdrop-blur">
            <div className="text-xs font-extrabold text-muted-foreground">{SAVE_THE_DATE.title}</div>
            <div className="font-script text-2xl text-primary leading-none">{SAVE_THE_DATE.line1}</div>
            <div className="text-sm font-bold text-muted-foreground">{SAVE_THE_DATE.line2}</div>
          </div>

          {slides.length > 0 && (
            <div className="pointer-events-auto fixed left-1/2 top-1/2 z-40 w-[320px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-background/90 shadow-lg backdrop-blur">
              <img src={slides[slideIdx]} alt="Slideshow" className="h-56 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setSlideIdx((i) => (i - 1 + slides.length) % slides.length)}
                  className="rounded-full border border-[hsl(var(--primary)/.30)] px-3 py-1 text-xs font-extrabold text-muted-foreground"
                >
                  Prev
                </button>
                <div className="text-xs font-bold text-muted-foreground">
                  {slideIdx + 1} / {slides.length}
                </div>
                <button
                  type="button"
                  onClick={() => setSlideIdx((i) => (i + 1) % slides.length)}
                  className="rounded-full border border-[hsl(var(--primary)/.30)] px-3 py-1 text-xs font-extrabold text-muted-foreground"
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

