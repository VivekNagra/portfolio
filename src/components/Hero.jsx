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
    <section id="home" className="mx-auto max-w-6xl px-4 pt-16 pb-10">
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
              className="link-underline rounded-md bg-[--color-brand] px-5 py-2.5 text-white shadow hover:opacity-90"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="link-underline rounded-md border border-zinc-300 px-5 py-2.5 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-[0_0_50px_-10px_color-mix(in_oklab,var(--color-brand),transparent_60%)] md:h-56 md:w-56">
            <img
              src={profileUrl}
              alt="Vivek Singh Nagra"
              className="h-full w-full object-cover object-[50%_10%] scale-105"
              draggable={false}
              loading="eager"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-[--color-brand]/12 to-fuchsia-500/10" />
          </div>
          <div className="pointer-events-none absolute inset-0 -z-10 animate-[blobShift_12s_ease-in-out_infinite] rounded-full bg-gradient-to-tr from-fuchsia-500/40 to-[--color-brand]/40 blur-2xl" />
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
