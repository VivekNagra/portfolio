import { useRef } from 'react'
import { useCursorLight } from '../hooks/useCursorLight'

const skillGroups = [
  { title: 'Core', items: ['C#', '.NET', 'Java', 'Python', 'JavaScript', 'React'] },
  { title: 'Backend & Data', items: ['PostgreSQL', 'REST APIs', 'Node.js'] },
  { title: 'Collaboration', items: ['Git', 'GitHub'] },
  { title: 'Exploring', items: ['Rust', 'Power BI', 'Python Notebook'] },
]

function SkillGroupCard({ group, gi }) {
  const ref = useRef(null)
  useCursorLight(ref, { radius: 560, max: 0.9 })

  return (
    <div
      ref={ref}
      className={`cursor-light reveal reveal-delay-${gi % 3} rounded-lg border border-[color:var(--surface-border)] bg-[var(--surface-bg)] p-4 text-[var(--page-text)] ring-1 ring-[--color-brand]/15`}
    >
      <h3 className="text-sm font-semibold">{group.title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {group.items.map(item => (
          <span
            key={item}
            className="rounded-md border border-[color:var(--surface-border)] bg-[var(--surface-bg-strong)] px-3 py-1 text-sm text-[var(--muted-text)] ring-1 ring-[--color-brand]/20"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="reveal reveal-delay-0 mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold tracking-tight text-[var(--page-text)]">Skills</h2>
      <p className="mt-2 text-[var(--muted-text)]">Technologies I’m most comfortable with, plus areas I’m exploring.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {skillGroups.map((group, gi) => (
          <SkillGroupCard key={group.title} group={group} gi={gi} />
        ))}
      </div>
    </section>
  )
}


