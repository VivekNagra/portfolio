const skills = [
  'JavaScript', 'React', 'TailwindCSS', 'Node.js', 'Express', 'REST APIs', 'Git', 'Vite'
]

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Skills</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">Core technologies and tools I use.</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {skills.map(s => (
          <li key={s} className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 ring-1 ring-[--color-brand]/20 dark:border-zinc-800 dark:text-zinc-300">{s}</li>
        ))}
      </ul>
    </section>
  )
}


