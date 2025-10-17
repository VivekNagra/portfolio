const items = [
  {
    title: 'Fittrack App',
    summary: 'Fitness Tracker App',
    tech: ['Java', 'JavaScript', 'CSS', 'HTML'],
    link: 'https://github.com/VivekNagra/fittrack-app',
  },
  {
    title: 'Diabetes Prediction Dashboard',
    summary: 'Diabetes Prediction Dashboard',
    tech: ['Python', 'C', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
    link: 'https://github.com/VivekNagra/hop',
  },
  {
    title: 'F1 AI Prediction App',
    summary: 'A simple app that uses Supervised Learning and RAG-based Question Answering with LLaMA2',
    tech: ['Jupyter Notebook', 'Python'],
    link: 'https://github.com/VivekNagra/f1-ai-exam-final',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Projects</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">A selection of work demonstrating my abilities and skills.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <a
            key={p.title}
            href={p.link}
            className="group rounded-lg border border-zinc-200 bg-white p-5 transition will-change-transform dark:border-zinc-800 dark:bg-zinc-900/60"
            onMouseMove={(e) => {
              const el = e.currentTarget
              const r = el.getBoundingClientRect()
              const x = e.clientX - r.left - r.width / 2
              const y = e.clientY - r.top - r.height / 2
              el.style.transform = `perspective(800px) rotateY(${x / 60}deg) rotateX(${-y / 60}deg) translateZ(0)`
              el.style.boxShadow = `0 0 0 2px var(--color-brand), 0 12px 30px -12px color-mix(in oklab, var(--color-brand), transparent 70%)`
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.transform = ''
              el.style.boxShadow = ''
            }}
          >
            <div className="h-36 w-full rounded-md bg-gradient-to-br from-[--color-brand]/15 to-fuchsia-500/10 transition group-hover:from-[--color-brand]/25 group-hover:to-fuchsia-500/20 dark:from-[--color-brand]/20 dark:to-fuchsia-500/20" />
            <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">{p.title}</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{p.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tech.map(t => (
                <span key={t} className="rounded-md bg-[--color-brand]/10 px-2 py-1 text-xs text-zinc-700 ring-1 ring-[--color-brand]/25 dark:text-zinc-200">{t}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
      <div className="mt-8">
        <a
          href="https://github.com/VivekNagra"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View all projects on GitHub"
          className="group relative inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-semibold text-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_color-mix(in_oklab,var(--color-brand),transparent_60%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[--color-brand]/40 active:translate-y-[0.5px] btn-ambient btn-pulse"
          style={{ boxShadow: '0 0 0 2px color-mix(in oklab, var(--color-brand), transparent 80%)' }}
        >
          <span className="relative">All Projects on GitHub</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path fillRule="evenodd" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.26 3.39.97.11-.76.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 2.91-.39c.99 0 1.98.13 2.91.39 2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.68 5.41-5.24 5.7.42.36.79 1.07.79 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.68.8.56A10.999 10.999 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" clipRule="evenodd" />
          </svg>
          <span className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-20" />
        </a>
      </div>
    </section>
  )
}


