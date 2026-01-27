import { useEffect, useMemo, useRef, useState } from 'react'
import { useCursorLight } from '../hooks/useCursorLight'

const experiences = [
  {
    id: 'student-python-dev',
    title: 'Student Python Developer',
    org: 'Realview',
    period: '2026 — Present',
    tags: ['Python', 'SQL', 'AI'],
    summary:
      'Part of a development team on an ongoing AI image analysis software project, contributing to planning, development, testing, and integrations.',
    bullets: [
      'Contribute to planning, development, project follow‑up, and quality assurance (testing).',
      'Build Python scripts that run AI on images to help analyze and understand them.',
      'Work primarily with Python and SQL, including integration work with other systems.',
    ],
  },
  {
    id: 'novo-nordisk-intern',
    title: 'Intern',
    org: 'Novo Nordisk',
    period: '2024 — 2025',
    tags: ['Power BI', 'Automation', 'Data & AI'],
    summary:
      'Worked across BI, AI/Automation & Analysis, and Platform Engineering—building dashboards and automation tooling for internal teams.',
    bullets: [
      'Worked across BI Center of Excellence, AI/Automation & Analysis, and Platform Engineering.',
      'Coordinated internal BI training and helped organize a Data & AI conference (200+ participants).',
      'Built Power BI dashboards and automation tools supporting data‑driven decisions and workflows.',
      'Communicated technical topics to non‑technical stakeholders and managed cross‑team tasks.',
    ],
  },
]

export default function Experience() {
  // "topId" is the card currently rendered in the foreground slot.
  // "openId" controls whether the foreground card is expanded (details visible).
  // This lets us animate: expanded -> collapsed -> swap.
  const [topId, setTopId] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const animTimerRef = useRef(null)
  const expandedWrapRef = useRef(null)
  const sectionRef = useRef(null)

  function getHeaderOffset() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--scroll-offset')
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) ? parsed : 96
  }

  const top = useMemo(() => experiences.find(e => e.id === topId) || null, [topId])
  const collapsed = useMemo(() => experiences.filter(e => e.id !== topId), [topId])
  const isTopExpanded = Boolean(topId && openId === topId)

  // When a card is expanded from the grid, it renders "above" the grid.
  // Smooth-scroll to the Experience header so the context (section title) is always visible.
  useEffect(() => {
    if (!openId) return
    const el = sectionRef.current
    if (!el) return

    const headerOffset = getHeaderOffset()
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }, [openId])

  useEffect(() => {
    return () => clearTimeout(animTimerRef.current)
  }, [])

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function getTopEl() {
    return expandedWrapRef.current?.querySelector?.('[data-exp-card]') || null
  }

  function getGridEl(id) {
    return document.getElementById(`exp-grid-${id}`)?.querySelector?.('[data-exp-card]') || null
  }

  function createFlyClone(el, fromRect, toRect) {
    const clone = el.cloneNode(true)
    clone.style.position = 'fixed'
    clone.style.left = `${fromRect.left}px`
    clone.style.top = `${fromRect.top}px`
    clone.style.width = `${fromRect.width}px`
    clone.style.height = `${fromRect.height}px`
    clone.style.margin = '0'
    clone.style.pointerEvents = 'none'
    clone.style.zIndex = '9999'
    clone.style.transformOrigin = 'top left'
    document.body.appendChild(clone)

    const dx = toRect.left - fromRect.left
    const dy = toRect.top - fromRect.top
    const sx = toRect.width / Math.max(1, fromRect.width)
    const sy = toRect.height / Math.max(1, fromRect.height)

    const anim = clone.animate(
      [
        { transform: 'translate(0px, 0px) scale(1, 1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 1 },
      ],
      { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
    )
    anim.finished.finally(() => clone.remove())
    return anim.finished
  }

  async function animateSwap(nextId) {
    if (isAnimating) return
    if (!topId || !nextId || nextId === topId) return

    setIsAnimating(true)

    // Step 1: collapse details so the flying card matches the collapsed size.
    setOpenId(null)
    await sleep(320)

    const topEl = getTopEl()
    const fromGridEl = getGridEl(nextId)
    const toGridEl = getGridEl(topId) // invisible placeholder spot in the grid

    if (!topEl || !fromGridEl || !toGridEl) {
      // Fallback: no fancy animation, just swap.
      setTopId(nextId)
      setOpenId(nextId)
      setIsAnimating(false)
      return
    }

    const topFrom = topEl.getBoundingClientRect()
    const topTo = toGridEl.getBoundingClientRect()
    const gridFrom = fromGridEl.getBoundingClientRect()
    const gridTo = topFrom

    // Hide originals while clones fly.
    const prevTopVis = topEl.style.visibility
    const prevGridVis = fromGridEl.style.visibility
    topEl.style.visibility = 'hidden'
    fromGridEl.style.visibility = 'hidden'

    try {
      await Promise.all([
        createFlyClone(topEl, topFrom, topTo),
        createFlyClone(fromGridEl, gridFrom, gridTo),
      ])
    } finally {
      // Restore (in case elements still exist) before rerender.
      if (topEl.isConnected) topEl.style.visibility = prevTopVis
      if (fromGridEl.isConnected) fromGridEl.style.visibility = prevGridVis
    }

    // Step 2: swap foreground, then expand the new one.
    setTopId(nextId)
    setOpenId(nextId)
    setIsAnimating(false)
  }

  async function animateCollapseToGrid() {
    if (isAnimating) return
    if (!topId) return

    setIsAnimating(true)
    setOpenId(null)
    await sleep(320)

    const topEl = getTopEl()
    const toGridEl = getGridEl(topId)
    if (!topEl || !toGridEl) {
      setTopId(null)
      setIsAnimating(false)
      return
    }

    const from = topEl.getBoundingClientRect()
    const to = toGridEl.getBoundingClientRect()

    const prevVis = topEl.style.visibility
    topEl.style.visibility = 'hidden'
    try {
      await createFlyClone(topEl, from, to)
    } finally {
      if (topEl.isConnected) topEl.style.visibility = prevVis
    }

    setTopId(null)
    setIsAnimating(false)
  }

  function collapseThen(nextId) {
    clearTimeout(animTimerRef.current)

    // Trigger the in-card collapse animation first (details max-height/opacity).
    setOpenId(null)

    // Duration should match the Card's details transition (duration-300).
    const COLLAPSE_MS = 320
    animTimerRef.current = setTimeout(() => {
      if (nextId) {
        // Swap: move next card into the foreground and expand it.
        setTopId(nextId)
        setOpenId(nextId)
      } else {
        // Fully collapse: remove foreground slot and return all cards to grid.
        setTopId(null)
      }
    }, COLLAPSE_MS)
  }

  function toggleExpanded(id) {
    if (isAnimating) return
    // No foreground card yet: expand immediately.
    if (!topId) {
      setTopId(id)
      setOpenId(id)
      return
    }

    // Clicking the same foreground card: collapse back into grid (animated).
    if (topId === id) {
      void animateCollapseToGrid()
      return
    }

    // Clicking another card while one is expanded: collapse first, then expand the new one.
    void animateSwap(id)
  }

  return (
    <section ref={sectionRef} id="experience" className="reveal reveal-delay-0 mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold tracking-tight text-[var(--page-text)]">Experience</h2>
      <p className="mt-2 text-[var(--muted-text)]">Recent roles and responsibilities.</p>

      {/* Expanded card gets its own "foreground" area so the rest naturally move below it */}
      {top && (
        <div ref={expandedWrapRef} className="reveal reveal-delay-0 mt-6 scroll-mt-32">
          <Card
            exp={top}
            expanded={isTopExpanded}
            onToggle={() => toggleExpanded(top.id)}
            disabled={isAnimating}
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {experiences.map((exp, i) => {
          const isTop = exp.id === topId
          return (
            <div
              key={exp.id}
              id={`exp-grid-${exp.id}`}
              className={`reveal reveal-delay-${i % 3} ${isTop ? 'invisible' : ''}`}
              aria-hidden={isTop || undefined}
            >
              <Card
                exp={exp}
                expanded={false}
                onToggle={() => toggleExpanded(exp.id)}
                disabled={isAnimating || isTop}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Card({ exp, expanded, onToggle, disabled }) {
  const { title, org, period, tags = [], summary, bullets = [] } = exp
  const controlsId = `${exp.id}-details`
  const cardRef = useRef(null)

  useCursorLight(cardRef, { radius: 620, max: 0.95 })

  useEffect(() => {
    if (!expanded) return
    // Move focus to the expanded card for keyboard users (and to make it obvious).
    cardRef.current?.focus?.({ preventScroll: true })
  }, [expanded])

  return (
    <article
      ref={cardRef}
      tabIndex={-1}
      data-exp-card={exp.id}
      className={[
        'cursor-light group relative overflow-hidden rounded-xl border border-[color:var(--surface-border)] bg-[var(--surface-bg)] p-4 text-[var(--page-text)] shadow-sm ring-1 ring-[--color-brand]/10 transition-all duration-300 ease-out',
        expanded
          ? 'z-20 ring-[--color-brand]/35 shadow-[0_26px_70px_-18px_color-mix(in_oklab,var(--color-brand),transparent_45%)]'
          : 'hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_color-mix(in_oklab,var(--color-brand),transparent_50%)] hover:ring-[--color-brand]/30',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-[var(--muted-text-2)]">{org} · {period}</p>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[--color-brand]/15 text-[--color-brand] ring-1 ring-[--color-brand]/20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v10.5A2.25 2.25 0 0 1 17.25 19.5H6.75A2.25 2.25 0 0 1 4.5 17.25V6.75Z"/>
          </svg>
        </span>
      </div>

      {/* Collapsed = consistent height; Expanded = full details */}
      <div className={expanded ? 'mt-3' : 'mt-3 min-h-[7.25rem]'}>
        <p
          className={[
            'text-sm leading-relaxed text-[var(--muted-text)]',
            expanded ? '' : 'h-[4.5rem] overflow-hidden',
          ].join(' ')}
        >
          {summary}
        </p>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map(t => (
              <span
                key={t}
                className="rounded-md bg-[--color-brand]/10 px-2 py-1 text-xs text-[var(--muted-text)] ring-1 ring-[--color-brand]/25"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        id={controlsId}
        className={[
          'transition-[max-height,opacity] duration-300 ease-out',
          expanded ? 'mt-4 max-h-[900px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden',
        ].join(' ')}
        aria-hidden={!expanded}
      >
        {bullets.length > 0 && (
          <ul className="space-y-2 text-sm text-[var(--muted-text)]">
            {bullets.map((p, i) => (
              <li key={i} className="relative pl-4">
                <span className="absolute left-0 top-[0.6em] h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-[--color-brand]" />
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-md border border-[color:var(--surface-border)] bg-[var(--surface-bg-strong)] px-3 py-2 text-sm font-semibold text-[var(--page-text)] shadow-sm ring-1 ring-[--color-brand]/10 transition hover:bg-[color:color-mix(in_oklab,var(--surface-bg-strong),black_3%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[--color-brand]/40"
          aria-expanded={expanded}
          aria-controls={controlsId}
        >
          {expanded ? 'Collapse' : 'Expand'}
          <span
            aria-hidden
            className={[
              'inline-block h-2 w-2 border-r-2 border-b-2 border-current transition-transform duration-200',
              expanded ? '-rotate-135' : 'rotate-45',
            ].join(' ')}
          />
        </button>

        {expanded && (
          <span className="text-xs text-[var(--muted-text-2)]">
            Tip: click Collapse to return to the grid.
          </span>
        )}
      </div>

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


