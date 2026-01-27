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
      className="sticky top-0 z-50 border-b border-[color:var(--surface-border)] bg-[var(--surface-bg)] backdrop-blur transition-colors"
    >
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="#home" className="text-lg font-semibold tracking-tight text-[var(--page-text)]">Vivek Singh Nagra</a>

          <nav className="hidden gap-6 md:flex">
            <a href="#projects" className="text-[var(--muted-text)] hover:text-[--color-brand]">Projects</a>
            <a href="#skills" className="text-[var(--muted-text)] hover:text-[--color-brand]">Skills</a>
            <a href="#contact" className="text-[var(--muted-text)] hover:text-[--color-brand]">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggle} />
            <button
              className="md:hidden rounded-md border border-[color:var(--surface-border)] p-2"
              aria-label="Open menu"
              onClick={() => setOpen(v => !v)}
            >
              <span className="block h-0.5 w-5 bg-[var(--page-text)]" />
              <span className="mt-1 block h-0.5 w-5 bg-[var(--page-text)]" />
              <span className="mt-1 block h-0.5 w-5 bg-[var(--page-text)]" />
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-3 flex flex-col gap-2 md:hidden">
            <a href="#projects" className="rounded-md px-2 py-2 text-[var(--muted-text)] hover:bg-[--color-brand]/10">Projects</a>
            <a href="#skills" className="rounded-md px-2 py-2 text-[var(--muted-text)] hover:bg-[--color-brand]/10">Skills</a>
            <a href="#contact" className="rounded-md px-2 py-2 text-[var(--muted-text)] hover:bg-[--color-brand]/10">Contact</a>
          </div>
        )}
      </div>
    </header>
  )
}

function ThemeToggle({ isDark, onToggle }) {
  return (
    <div className="relative">
      <button
        aria-label="Toggle dark mode"
        type="button"
        onClick={onToggle}
        className="group inline-flex items-center gap-2 rounded-md border border-[color:var(--surface-border)] bg-[var(--surface-bg-strong)] px-3 py-1.5 text-sm text-[var(--muted-text)] shadow-sm ring-[--color-brand]/40 transition hover:bg-[color:color-mix(in_oklab,var(--surface-bg-strong),black_3%)] active:scale-[0.98]"
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


