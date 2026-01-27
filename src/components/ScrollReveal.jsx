import { useEffect } from 'react'

export default function ScrollReveal({ children }) {
  useEffect(() => {
    const getRevealElsFromNode = (node) => {
      if (!node) return []
      if (node.nodeType !== 1) return [] // ELEMENT_NODE only
      const el = /** @type {HTMLElement} */ (node)
      const out = []
      if (el.classList?.contains('reveal')) out.push(el)
      out.push(...Array.from(el.querySelectorAll?.('.reveal') || []))
      return out
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Use a data-attribute so React rerenders don't wipe the revealed state.
          entry.target.dataset.revealed = 'true'
          // Keep the class for backwards compatibility with existing CSS (optional).
          entry.target.classList.add('reveal-visible')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    const observeAll = (root = document) => {
      const els = Array.from(root.querySelectorAll?.('.reveal') || [])
      els.forEach((el) => {
        if (el.dataset.revealed === 'true') return
        io.observe(el)
      })
    }

    // Observe all current reveal elements.
    observeAll(document)

    // Also observe reveal elements added later (e.g., conditional rendering / state changes).
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach((n) => {
            const els = getRevealElsFromNode(n)
            els.forEach((el) => {
              if (el.dataset.revealed === 'true') return
              io.observe(el)
            })
          })
        }
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
    }
  }, [])

  return children
}


