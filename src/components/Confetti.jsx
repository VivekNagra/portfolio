import { useEffect, useRef } from 'react'

function rand(min, max) {
  return min + Math.random() * (max - min)
}

export default function Confetti({ pieces = 140 }) {
  const ref = useRef(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return

    host.innerHTML = ''
    for (let i = 0; i < pieces; i++) {
      const p = document.createElement('i')
      p.className = 'mish-confetti'
      p.style.left = `${rand(0, 100)}vw`
      p.style.setProperty('--dx', `${rand(-120, 120)}px`)
      p.style.setProperty('--h', `${Math.floor(rand(0, 360))}`)
      p.style.setProperty('--rot', `${rand(0, 360)}deg`)
      p.style.setProperty('--dur', `${rand(2.8, 4.4)}s`)
      host.appendChild(p)
    }

    const t = window.setTimeout(() => {
      if (host) host.innerHTML = ''
    }, 5200)

    return () => window.clearTimeout(t)
  }, [pieces])

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        .mish-confetti {
          position: absolute;
          top: -16px;
          width: 10px;
          height: 14px;
          border-radius: 2px;
          transform: rotate(var(--rot));
          background: hsl(var(--h), 95%, 60%);
          animation: mish-conf-fall var(--dur) linear forwards;
        }
        @keyframes mish-conf-fall {
          0% { transform: translateY(-20px) translateX(0) rotate(var(--rot)); opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--dx)) rotate(calc(var(--rot) + 720deg)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

