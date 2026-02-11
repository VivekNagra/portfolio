import { useEffect, useMemo, useRef } from 'react'

function rand(min, max) {
  return min + Math.random() * (max - min)
}

export default function FloatingHearts({ density = 18 }) {
  const hostRef = useRef(null)

  const hearts = useMemo(() => ['💗', '💖', '💘', '💞'], [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let raf = 0
    let alive = true

    function spawn() {
      if (!alive) return
      const el = document.createElement('div')
      el.textContent = hearts[(Math.random() * hearts.length) | 0]
      el.className = 'mish-heart'
      el.style.left = `${rand(0, 100)}%`
      el.style.fontSize = `${rand(14, 28)}px`
      el.style.setProperty('--drift', `${rand(-60, 60)}px`)
      el.style.animationDuration = `${rand(6, 10)}s`
      host.appendChild(el)

      // cleanup after animation
      const ttl = Number.parseFloat(el.style.animationDuration) * 1000 + 250
      window.setTimeout(() => el.remove(), ttl)

      raf = window.setTimeout(spawn, rand(240, 520))
    }

    spawn()
    return () => {
      alive = false
      window.clearTimeout(raf)
    }
  }, [density, hearts])

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <style>{`
        .mish-heart {
          position: absolute;
          top: 110%;
          transform: translateX(-50%);
          opacity: 0;
          animation-name: mish-float-up;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }
        @keyframes mish-float-up {
          0%   { transform: translate(-50%, 0) scale(.9); opacity: 0; }
          10%  { opacity: .85; }
          100% { transform: translate(calc(-50% + var(--drift)), -120vh) scale(1.25); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

