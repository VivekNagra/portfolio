import { useEffect, useMemo, useRef, useState } from 'react'
import Valentine from './Valentine.tsx'
import profileImg from '../assets/profile.jpg'

const GIPHY =
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTJ5ZXRrOHhsMGx6Y2R0MnJ6OHJrcm1nNHF4a3BhYnU2MnRxdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/M90mJvfWfd5mbUuULX/giphy.gif'

// Edit these to match your “Save the Date” details.
const SAVE_THE_DATE = {
  title: 'Save the Date',
  line1: 'Vivek & Manice',
  line2: '14 Feb 2026',
}

// Put an mp3 in /public (example: public/valentine.mp3)
const AUDIO_SRC = '/valentine.mp3'

export default function ValentineShell() {
  const containerRef = useRef(null)
  const audioRef = useRef(null)
  const [musicOn, setMusicOn] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const slides = useMemo(() => [profileImg, GIPHY], [])
  const [slideIdx, setSlideIdx] = useState(0)

  // Detect “accepted” without changing your Valentine code.
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

  // Try to start music when accepted (browser may still require a click).
  useEffect(() => {
    if (!accepted) return
    if (!audioRef.current) return
    if (musicOn) return
    // Don't force autoplay; just prime the element.
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
      // Autoplay restrictions (user gesture needed).
      setMusicOn(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Your unchanged page */}
      <Valentine />

      {/* Overlays (added without editing your Valentine code) */}
      <audio ref={audioRef} loop preload="none" />

      <button
        type="button"
        onClick={toggleMusic}
        className="fixed bottom-4 right-4 z-50 rounded-full border border-border bg-background/90 px-4 py-3 text-sm font-extrabold text-muted-foreground shadow-lg backdrop-blur"
      >
        Music: {musicOn ? 'On' : 'Off'}
      </button>

      {accepted && (
        <>
          <div className="fixed top-4 left-4 z-50 rounded-2xl border border-border bg-background/90 px-4 py-3 shadow-lg backdrop-blur">
            <div className="text-xs font-extrabold text-muted-foreground">{SAVE_THE_DATE.title}</div>
            <div className="font-script text-2xl text-primary leading-none">{SAVE_THE_DATE.line1}</div>
            <div className="text-sm font-bold text-muted-foreground">{SAVE_THE_DATE.line2}</div>
          </div>

          <div className="fixed bottom-4 left-4 z-50 w-[260px] overflow-hidden rounded-2xl border border-border bg-background/90 shadow-lg backdrop-blur">
            <img
              src={slides[slideIdx]}
              alt="Slideshow"
              className="h-56 w-full object-cover"
            />
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
        </>
      )}
    </div>
  )
}

