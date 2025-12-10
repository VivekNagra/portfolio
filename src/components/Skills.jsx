const skillGroups = [
  { title: 'Core', items: ['Java', 'Python', 'JavaScript', 'React'] },
  { title: 'Backend & Data', items: ['PostgreSQL', 'REST APIs', 'Node.js'] },
  { title: 'Collaboration', items: ['Git', 'GitHub'] },
  { title: 'Exploring', items: ['Rust', 'Power BI', 'Python Notebook'] },
]

export default function Skills() {
  return (
    <section id="skills" className="reveal reveal-delay-0 mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Skills</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">Technologies I’m most comfortable with, plus areas I’m exploring.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {skillGroups.map((group, gi) => (
          <div
            key={group.title}
            className={`reveal reveal-delay-${gi % 3} rounded-lg border border-zinc-200 bg-white p-4 ring-1 ring-[--color-brand]/15 dark:border-zinc-800 dark:bg-zinc-900/60`}
          >
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{group.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.items.map(item => (
                <span
                  key={item}
                  className="rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 ring-1 ring-[--color-brand]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


