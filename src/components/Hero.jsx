import { useEffect, useState, useRef, useCallback } from 'react'
import profileUrl from '../assets/profile.jpg'

function Typewriter({
  text,
  start = true,
  speed = 18,
  startDelay = 150,
  className = '',
  as = 'span',
  onDone,
  showCursor = true,
  caretClassName = '',
  blinkAfterDone = 2, // set a finite number (in blinks) to hide after; null = infinite
}) {
  const [output, setOutput] = useState('')
  const [done, setDone] = useState(false)
  const [hideCaret, setHideCaret] = useState(false)
  const tickTimeoutId = useRef(null)

  useEffect(() => {
    if (!start) return
    let isCancelled = false

    const startTimeoutId = setTimeout(() => {
      let i = 0
      const tick = () => {
        if (isCancelled) return
        i++
        setOutput(text.slice(0, i))
        if (i < text.length) {
          tickTimeoutId.current = setTimeout(tick, speed)
        } else {
          setDone(true)
          if (onDone) onDone()
        }
      }
      tick()
    }, startDelay)

    return () => {
      isCancelled = true
      clearTimeout(startTimeoutId)
      clearTimeout(tickTimeoutId.current)
    }
  }, [start, text, speed, startDelay, onDone])

  // 👇 Stop blinking after N blinks on completion (1 blink ~ 1s per CSS)
  useEffect(() => {
    if (!done || !showCursor) return
    if (!(Number.isFinite(blinkAfterDone) && blinkAfterDone > 0)) return
    const totalBlinkTime = blinkAfterDone * 1000
    const hideTimer = setTimeout(() => setHideCaret(true), totalBlinkTime)
    return () => clearTimeout(hideTimer)
  }, [done, showCursor, blinkAfterDone])

  const TagName = as

  return (
    <TagName className={`${className} inline whitespace-pre-wrap align-baseline`}>
      {output}
      {showCursor && !hideCaret && (
        <span
          className={`animate-blink ml-0.5 inline-block align-baseline h-[1em] w-[0.08em] bg-current ${caretClassName}`}
        />
      )}
    </TagName>
  )
}

export default function Hero() {
  const [paraStart, setParaStart] = useState(false)

  const handleTypingDone = useCallback(() => {
    setTimeout(() => {
      setParaStart(true)
    }, 1800) // short pause before paragraph
  }, [])

  return (
    <section id="home" className="reveal reveal-delay-0 mx-auto max-w-6xl px-4 pt-16 pb-10">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            <Typewriter
              as="span"
              text="Hi, I’m Vivek Singh Nagra"
              speed={75}
              start
              startDelay={100}
              onDone={handleTypingDone}
              showCursor
              caretClassName="w-[0.12em] bg-[--color-brand]"
            />
          </h1>

          {/* Paragraph fades in & types */}
          <ParagraphType start={paraStart} />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              aria-label="View projects"
              className="group relative inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-semibold text-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_color-mix(in_oklab,var(--color-brand),transparent_60%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[--color-brand]/40 active:translate-y-[0.5px] btn-ambient btn-pulse"
              style={{ boxShadow: '0 0 0 2px color-mix(in oklab, var(--color-brand), transparent 80%)' }}
            >
              <span className="relative">View Projects</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M13.25 4.5a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.31l-8.47 8.47a.75.75 0 1 1-1.06-1.06l8.47-8.47h-3.69a.75.75 0 0 1-.75-.75Z"/>
                <path d="M6.75 5.25a.75.75 0 0 1 .75.75v10.5h10.5a.75.75 0 0 1 0 1.5H6.75A2.25 2.25 0 0 1 4.5 15.75V6a.75.75 0 0 1 .75-.75Z"/>
              </svg>
              <span className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-20" />
            </a>
            <a
              href="#contact"
              aria-label="Contact"
              className="group relative inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-semibold text-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_color-mix(in_oklab,var(--color-brand),transparent_60%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[--color-brand]/40 active:translate-y-[0.5px] btn-ambient btn-pulse"
              style={{ boxShadow: '0 0 0 2px color-mix(in oklab, var(--color-brand), transparent 80%)' }}
            >
              <span className="relative">Contact</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M1.5 6.75A2.25 2.25 0 0 1 3.75 4.5h16.5a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 20.25 19.5H3.75A2.25 2.25 0 0 1 1.5 17.25V6.75Zm2.658-.75a.75.75 0 0 0-.53 1.28l7.092 7.092a.75.75 0 0 0 1.06 0l7.092-7.092a.75.75 0 0 0-.53-1.28H4.158Z"/>
              </svg>
              <span className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-20" />
            </a>
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <div
            className="relative h-40 w-40 overflow-hidden rounded-full shadow-[0_0_60px_-12px_color-mix(in_oklab,var(--color-brand),transparent_55%),_0_0_120px_-38px_color-mix(in_oklab,var(--color-brand),transparent_72%)] md:h-56 md:w-56"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Centered inner halo to avoid side skew */}
            <div
              className="pointer-events-none absolute -inset-3 -z-10 rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(closest-side, color-mix(in oklab, var(--color-brand), transparent 60%), transparent 62%)'
              }}
            />
            {/* Secondary soft halo for extra presence */}
            <div
              className="pointer-events-none absolute -inset-5 -z-20 rounded-full blur-[38px]"
              style={{
                background: 'radial-gradient(closest-side, color-mix(in oklab, var(--color-brand), transparent 82%), transparent 80%)'
              }}
            />
            <img
              src={profileUrl}
              alt="Vivek Singh Nagra"
              className="h-full w-full select-none pointer-events-none object-cover object-[50%_10%] scale-105"
              draggable={false}
              loading="eager"
              decoding="async"
            />
            {/* Invisible overlay to intercept interactions */}
            <span className="absolute inset-0 z-10" />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-[--color-brand]/20 to-fuchsia-500/14" />
            <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[--color-brand]/35" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full opacity-28 mix-blend-screen"
              style={{
                background:
                  'radial-gradient(closest-side at 50% 38%, rgba(255,255,255,0.28), rgba(255,255,255,0.12) 55%, rgba(255,255,255,0) 76%)'
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ParagraphType({ start }) {
  const paragraph =
    '26-year-old computer science / Software development student shaping futuristic, data-driven web experiences. I build with React and Tailwind, blending minimal design with real functionality. From dashboards to full-stack apps, my focus is on clarity, performance, and precision.'

  return (
    <div
      className={`transition-opacity duration-700 ease-in ${
        start ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Typewriter
        as="p"
        className="mt-4 text-lg text-zinc-700 dark:text-zinc-300"
        text={paragraph}
        start={start}
        speed={18}
        startDelay={0}
        showCursor
      />
    </div>
  )
}
