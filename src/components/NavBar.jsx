import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const { isDark, toggle } = useTheme()
  const headerRef = useRef(null)

  // Keep a CSS variable in sync with the sticky header height so anchor links
  // (e.g. #experience) don't get clipped under the navbar.
  useEffect(() => {
    const headerEl = headerRef.current
    if (!headerEl) return

    const update = () => {
      const h = headerEl.getBoundingClientRect().height || 0
      const offset = Math.ceil(h) + 16 // extra breathing room
      document.documentElement.style.setProperty('--scroll-offset', `${offset}px`)
    }

    update()

    const ro = new ResizeObserver(() => update())
    ro.observe(headerEl)
    window.addEventListener('resize', update)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur transition-colors dark:border-zinc-800 dark:bg-zinc-900/80"
    >
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="#home" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Vivek Singh Nagra</a>

          <nav className="hidden gap-6 md:flex">
            <a href="#projects" className="text-zinc-700 hover:text-[--color-brand] dark:text-zinc-300">Projects</a>
            <a href="#skills" className="text-zinc-700 hover:text-[--color-brand] dark:text-zinc-300">Skills</a>
            <a href="#contact" className="text-zinc-700 hover:text-[--color-brand] dark:text-zinc-300">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggle} />
            <button
              className="md:hidden rounded-md border border-zinc-200 p-2 dark:border-zinc-700"
              aria-label="Open menu"
              onClick={() => setOpen(v => !v)}
            >
              <span className="block h-0.5 w-5 bg-zinc-900 dark:bg-zinc-100" />
              <span className="mt-1 block h-0.5 w-5 bg-zinc-900 dark:bg-zinc-100" />
              <span className="mt-1 block h-0.5 w-5 bg-zinc-900 dark:bg-zinc-100" />
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-3 flex flex-col gap-2 md:hidden">
            <a href="#projects" className="rounded-md px-2 py-2 text-zinc-700 hover:bg-[--color-brand]/10 dark:text-zinc-300">Projects</a>
            <a href="#skills" className="rounded-md px-2 py-2 text-zinc-700 hover:bg-[--color-brand]/10 dark:text-zinc-300">Skills</a>
            <a href="#contact" className="rounded-md px-2 py-2 text-zinc-700 hover:bg-[--color-brand]/10 dark:text-zinc-300">Contact</a>
          </div>
        )}
      </div>
    </header>
  )
}

function ThemeToggle({ isDark, onToggle }) {
  const [showNote, setShowNote] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleClick() {
    onToggle()
    setShowNote(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShowNote(false), 2000)
  }

  return (
    <div className="relative">
      <button
        aria-label="Toggle dark mode"
        onClick={handleClick}
        className="group inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm ring-[--color-brand]/40 transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        style={{ boxShadow: isDark ? '0 0 0 2px color-mix(in oklab, var(--color-brand), transparent 60%)' : '0 0 0 2px color-mix(in oklab, var(--color-brand), transparent 85%)' }}
      >
        {isDark ? (
          <>
            <MoonIcon className="h-4 w-4" />
            <span>Light</span>
          </>
        ) : (
          <>
            <SunIcon className="h-4 w-4" />
            <span>Dark</span>
          </>
        )}
      </button>
      <div
        className={`absolute left-0 right-0 translate-y-1 text-center text-[11px] text-zinc-600 transition-opacity dark:text-zinc-300 ${showNote ? 'opacity-100' : 'opacity-0'}`}
        aria-live="polite"
      >
        coming soon
      </div>
    </div>
  )
}

function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 5.25a.75.75 0 0 0 .75-.75V3a.75.75 0 0 0-1.5 0v1.5c0 .414.336.75.75.75Zm0 15a.75.75 0 0 0-.75.75V22a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75ZM5.25 12a.75.75 0 0 0-.75-.75H3a.75.75 0 0 0 0 1.5h1.5A.75.75 0 0 0 5.25 12ZM22 12a.75.75 0 0 0-.75-.75H19.75a.75.75 0 0 0 0 1.5H21.25A.75.75 0 0 0 22 12ZM5.47 5.47a.75.75 0 0 0 0 1.06l1.06 1.06a.75.75 0 1 0 1.06-1.06L6.53 5.47a.75.75 0 0 0-1.06 0Zm10.94 10.94a.75.75 0 0 0 0 1.06l1.06 1.06a.75.75 0 1 0 1.06-1.06l-1.06-1.06a.75.75 0 0 0-1.06 0ZM5.47 18.53a.75.75 0 0 0 1.06 0l1.06-1.06a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 0 1.06Zm10.94-10.94a.75.75 0 0 0 1.06 0l1.06-1.06a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 0 1.06ZM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/>
    </svg>
  )
}

function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.752 15.002a8.25 8.25 0 0 1-11.255-11.255.75.75 0 0 0-1.072-.914 9.75 9.75 0 1 0 13.241 13.24.75.75 0 0 0-.914-1.071Z"/>
    </svg>
  )
}


