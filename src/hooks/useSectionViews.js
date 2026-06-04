import { useEffect } from 'react'
import { trackEvent, AnalyticsEvent } from '../lib/analytics'

/**
 * Tracks two portfolio engagement signals:
 *  1. section_view  — fires once the first time each <section id> becomes visible,
 *                     so you can see how far visitors actually scroll (e.g. how
 *                     many reach Projects vs. Contact).
 *  2. scroll_depth  — fires once per 25/50/75/100% page-depth milestone reached.
 *
 * Both fire at most once per page load to keep event volume sensible.
 */
export function useSectionViews() {
  useEffect(() => {
    const seenSections = new Set()

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = entry.target.id
          if (!id || seenSections.has(id)) continue
          seenSections.add(id)
          trackEvent(AnalyticsEvent.SectionView, { section: id })
          io.unobserve(entry.target)
        }
      },
      { threshold: 0.4 }
    )

    const sections = document.querySelectorAll('main section[id]')
    sections.forEach((section) => io.observe(section))

    const milestones = [25, 50, 75, 100]
    const firedDepths = new Set()
    let ticking = false

    const checkDepth = () => {
      ticking = false
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const viewport = window.innerHeight
      const fullHeight = document.documentElement.scrollHeight
      const scrollable = fullHeight - viewport
      if (scrollable <= 0) return
      const percent = Math.min(100, Math.round(((scrollTop + viewport) / fullHeight) * 100))
      for (const milestone of milestones) {
        if (percent >= milestone && !firedDepths.has(milestone)) {
          firedDepths.add(milestone)
          trackEvent(AnalyticsEvent.ScrollDepth, { depth: milestone })
        }
      }
      if (firedDepths.size === milestones.length) {
        window.removeEventListener('scroll', onScroll)
      }
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(checkDepth)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // Run once in case the page is already scrolled or short enough to be fully visible.
    checkDepth()

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}
