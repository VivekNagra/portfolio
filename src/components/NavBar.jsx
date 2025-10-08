import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="#home" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Vivek Singh Nagra</a>

          <nav className="hidden gap-6 md:flex">
            <a href="#projects" className="text-zinc-700 hover:text-[--color-brand] dark:text-zinc-300">Projects</a>
            <a href="#skills" className="text-zinc-700 hover:text-[--color-brand] dark:text-zinc-300">Skills</a>
            <a href="#contact" className="text-zinc-700 hover:text-[--color-brand] dark:text-zinc-300">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle dark mode"
              onClick={toggle}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              style={{ boxShadow: '0 0 0 2px color-mix(in oklab, var(--color-brand), transparent 85%)' }}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
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


