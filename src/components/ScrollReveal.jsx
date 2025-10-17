import { useEffect } from 'react'

export default function ScrollReveal({ children }) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))
    if (els.length === 0) return

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return children
}


