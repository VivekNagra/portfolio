const experiences = [
  {
    title: 'Intern',
    org: 'Novo Nordisk',
    period: '2024 — 2025',
    description: (
      <>
        As an intern at <strong>Novo Nordisk</strong>, I worked across the <strong>BI Center of Excellence</strong>, <strong>AI/Automation & Analysis</strong>, and <strong>Platform Engineering</strong>. I coordinated internal <strong>BI training</strong> and helped organize an internal <strong>Data & AI conference</strong> with <strong>200+</strong> participants and speakers. I contributed <strong>Power BI dashboards</strong> and <strong>automation tools</strong> that supported <strong>data‑driven decision‑making</strong> and improved <strong>internal workflows</strong>, communicated technical topics clearly to <strong>non‑technical stakeholders</strong>, and managed <strong>complex cross‑team tasks</strong>. I was recognized as <strong>dedicated</strong>, <strong>proactive</strong>, and <strong>dependable</strong>, with a <strong>structured</strong>, <strong>solution‑oriented</strong> mindset.
      </>
    ),
  },
  {
    title: 'Teaching Assistant',
    org: 'University',
    period: '2023 — 2024',
    points: [
      'Supported students with algorithms and data structures.',
      'Reviewed assignments and held weekly office hours.'
    ],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="reveal reveal-delay-0 mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Experience</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">Recent roles and responsibilities.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {experiences.map((exp, i) => (
          <div key={exp.title} className={`reveal reveal-delay-${i % 3}`}>
            <Card {...exp} />
          </div>
        ))}
      </div>
    </section>
  )
}

function Card({ title, org, period, points, description }) {
  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm ring-1 ring-[--color-brand]/10 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_color-mix(in_oklab,var(--color-brand),transparent_50%)] hover:ring-[--color-brand]/30 dark:border-zinc-800 dark:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{org} · {period}</p>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[--color-brand]/15 text-[--color-brand] ring-1 ring-[--color-brand]/20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v10.5A2.25 2.25 0 0 1 17.25 19.5H6.75A2.25 2.25 0 0 1 4.5 17.25V6.75Z"/>
          </svg>
        </span>
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {description}
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          {points.map((p, i) => (
            <li key={i} className="relative pl-4 transition-transform duration-200 group-hover:translate-x-0.5">
              <span className="absolute left-0 top-[0.6em] h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-[--color-brand] transition-transform duration-200 group-hover:scale-110" />
              {p}
            </li>
          ))}
        </ul>
      )}
      {/* Subtle radial glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(600px 220px at 80% -40%, color-mix(in oklab, var(--color-brand), transparent 68%), transparent)'
        }}
      />
      {/* Sheen pass */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 bottom-0 left-[-50%] w-[60%] -skew-x-12 bg-gradient-to-r from-white/0 via-white/25 to-white/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 animate-[sheen_900ms_ease]" />
      </div>
    </article>
  )
}


