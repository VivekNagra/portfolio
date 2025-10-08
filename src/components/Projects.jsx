const items = [
  {
    title: 'Project One',
    summary: 'Short description of the project and your impact.',
    tech: ['React', 'Tailwind', 'Vite'],
    link: '#',
  },
  {
    title: 'Project Two',
    summary: 'Another project showcasing your expertise.',
    tech: ['Node', 'Express', 'MongoDB'],
    link: '#',
  },
  {
    title: 'Project Three',
    summary: 'A third example with measurable results.',
    tech: ['TypeScript', 'Next.js', 'Vercel'],
    link: '#',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Projects</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">A selection of work demonstrating breadth and impact.</p>
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
    </section>
  )
}


