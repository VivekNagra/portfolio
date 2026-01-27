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
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--page-text)] md:text-5xl">
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

        <div className="relative flex flex-col items-center md:items-center">
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
          <div className="mt-4 ml-1 md:ml-2 flex items-center justify-center gap-6">
            <a
              href="https://github.com/VivekNagra"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--surface-border)] bg-[var(--surface-bg)] text-[var(--muted-text)] shadow-sm ring-1 ring-[--color-brand]/10 transition hover:scale-105 hover:ring-[--color-brand]/40 hover:shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--color-brand),transparent_60%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[--color-brand]/40"
              style={{ boxShadow: '0 0 0 2px color-mix(in oklab, var(--color-brand), transparent 85%)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path fillRule="evenodd" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.26 3.39.97.11-.76.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 2.91-.39c.99 0 1.98.13 2.91.39 2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.68 5.41-5.24 5.7.42.36.79 1.07.79 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.68.8.56A10.999 10.999 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/viveknagra"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--surface-border)] bg-[var(--surface-bg)] text-[var(--muted-text)] shadow-sm ring-1 ring-[--color-brand]/10 transition hover:scale-105 hover:ring-[--color-brand]/40 hover:shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--color-brand),transparent_60%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[--color-brand]/40"
              style={{ boxShadow: '0 0 0 2px color-mix(in oklab, var(--color-brand), transparent 85%)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M4.98 3.5a2.5 2.5 0 1 0 .02 5.001 2.5 2.5 0 0 0-.02-5ZM3.75 9h2.5v11h-2.5V9Zm6 0h2.39v1.5h.03c.33-.62 1.15-1.27 2.37-1.27 2.53 0 3 1.66 3 3.82V20h-2.5v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.41-2.08 2.86V20h-2.5V9Z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function getAge(birthDate, now = new Date()) {
  const yearDiff = now.getFullYear() - birthDate.getFullYear()
  const hadBirthdayThisYear =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate())
  return yearDiff - (hadBirthdayThisYear ? 0 : 1)
}

function ParagraphType({ start }) {
  // Birthdate: 14 November 1998 (month is 0-based in JS Date)
  const age = getAge(new Date(1998, 10, 14))
  const paragraph =
    `${age}-year-old computer science / Software development student shaping futuristic, data-driven web experiences. ` +
    'I build with Python, Java, C#, and React—blending minimal design with real functionality. ' +
    'From dashboards to full-stack apps, my focus is on clarity, performance, and precision.'

  return (
    <div
      className={`transition-opacity duration-700 ease-in ${
        start ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Typewriter
        as="p"
        className="mt-4 text-lg text-[var(--muted-text)]"
        text={paragraph}
        start={start}
        speed={18}
        startDelay={0}
        showCursor
      />
    </div>
  )
}
