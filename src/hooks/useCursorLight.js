import { useEffect } from 'react'

const els = new Set()
const optsMap = new WeakMap()

let rafId = 0
let listening = false
let pointerX = 0
let pointerY = 0
let pointerActive = false

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function scheduleUpdate() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    updateAll()
  })
}

function updateAll() {
  // If the pointer left the window, fade everything out.
  const px = pointerX
  const py = pointerY

  for (const el of els) {
    if (!el || !el.isConnected) {
      els.delete(el)
      continue
    }

    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = px - cx
    const dy = py - cy
    const dist = Math.hypot(dx, dy)

    const o = optsMap.get(el) || {}
    const radius = o.radius ?? 520
    const max = o.max ?? 1

    const intensity = pointerActive ? clamp(1 - dist / radius, 0, 1) * max : 0

    // Clamp spotlight to the element bounds so it looks directional even when not hovered.
    const lx = clamp(px - rect.left, 0, rect.width)
    const ly = clamp(py - rect.top, 0, rect.height)

    el.style.setProperty('--glow-x', `${lx}px`)
    el.style.setProperty('--glow-y', `${ly}px`)
    el.style.setProperty('--glow-a', intensity.toFixed(3))
  }
}

function ensureListeners() {
  if (listening) return
  listening = true

  const onMove = (e) => {
    pointerX = e.clientX
    pointerY = e.clientY
    pointerActive = true
    scheduleUpdate()
  }

  const onLeave = () => {
    pointerActive = false
    scheduleUpdate()
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onMove, { passive: true })
  window.addEventListener('pointerleave', onLeave, { passive: true })
  window.addEventListener('blur', onLeave, { passive: true })
}

/**
 * Adds a cursor-driven "light source" effect to any element.
 *
 * Usage:
 * const ref = useRef(null)
 * useCursorLight(ref, { radius: 560, max: 0.9 })
 * <div ref={ref} className="cursor-light" />
 */
export function useCursorLight(ref, options) {
  useEffect(() => {
    const el = ref?.current
    if (!el) return

    ensureListeners()
    els.add(el)
    optsMap.set(el, options || {})

    // Ensure initial values exist (prevents flashing).
    el.style.setProperty('--glow-a', '0')
    el.style.setProperty('--glow-x', '50%')
    el.style.setProperty('--glow-y', '50%')

    // If the pointer is already active, update immediately.
    scheduleUpdate()

    return () => {
      els.delete(el)
      optsMap.delete(el)
      el.style.removeProperty('--glow-a')
      el.style.removeProperty('--glow-x')
      el.style.removeProperty('--glow-y')
    }
  }, [ref, options?.radius, options?.max])
}

