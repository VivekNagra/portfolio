const skills = [
   'Java', 'Python','Python Notebook', 'JavaScript', 'React', 'Rust', 'C#', 'Bussiness Intelligence', 'Power BI', 'Node.js', 'REST APIs', 'Azure','Git', 'Vite', 'TailwindCSS',
]

export default function Skills() {
  return (
    <section id="skills" className="reveal reveal-delay-0 mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Skills</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">Core technologies and tools I use.</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {skills.map((s, i) => (
          <li key={s} className={`reveal reveal-delay-${i % 4} rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 ring-1 ring-[--color-brand]/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300`}>{s}</li>
        ))}
      </ul>
    </section>
  )
}


