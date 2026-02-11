import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import FloatingHearts from '@/components/FloatingHearts'
import Confetti from '@/components/Confetti'

const noTexts = [
  'No 😢',
  'Are you sure? 🥺',
  'Think again! 💔',
  'Wrong button! 😤',
  'Not this one! 🙈',
  'Please? 🥹',
  'Pretty please? 🌹',
  'Fine, I give up 😭',
]

export default function Valentine() {
  const [noCount, setNoCount] = useState(0)
  const [accepted, setAccepted] = useState(false)
  const [noPosition, setNoPosition] = useState({})
  const containerRef = useRef(null)

  const handleNoHover = useCallback(() => {
    if (noCount >= noTexts.length - 1) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    // Keep button well within bounds for mobile
    const buttonWidth = 160
    const buttonHeight = 50
    const padding = 20
    const top = padding + Math.random() * (rect.height - buttonHeight - padding * 2)
    const left = padding + Math.random() * (rect.width - buttonWidth - padding * 2)
    setNoPosition({ top: `${top}px`, left: `${left}px` })
    setNoCount((c) => Math.min(c + 1, noTexts.length - 1))
  }, [noCount])

  const noButtonSize = Math.max(0.5, 1 - noCount * 0.06)
  const yesButtonSize = Math.min(1.6, 1 + noCount * 0.08)

  if (accepted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden px-4">
        <Confetti />
        <div
          className="text-center z-10"
          style={{ animation: 'bounce-in 0.6s ease-out forwards' }}
        >
          <div className="text-7xl sm:text-8xl mb-6">💖</div>
          <h1 className="font-script text-5xl sm:text-7xl text-primary mb-4">Yay!!!</h1>
          <p className="font-script text-3xl sm:text-4xl text-primary/80 mb-2">
            Vivek & Manice forever! 💕
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground mt-4">I knew you'd say yes 🥰</p>
          <div
            className="mt-6 rounded-2xl overflow-hidden shadow-lg"
            style={{ animation: 'bounce-in 0.6s ease-out 0.4s both' }}
          >
            <img
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTJ5ZXRrOHhsMGx6Y2R0MnJ6OHJrcm1nNHF4a3BhYnU2MnRxdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/M90mJvfWfd5mbUuULX/giphy.gif"
              alt="Cute romantic celebration"
              className="w-64 h-auto mx-auto"
            />
          </div>
          <div className="flex justify-center gap-2 mt-6 text-4xl">
            <span style={{ animation: 'bounce-in 0.5s ease-out 0.5s both' }}>🌹</span>
            <span style={{ animation: 'bounce-in 0.5s ease-out 0.7s both' }}>💘</span>
            <span style={{ animation: 'bounce-in 0.5s ease-out 0.9s both' }}>🌹</span>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setAccepted(false)
              setNoCount(0)
              setNoPosition({})
            }}
            className="mt-8 font-body rounded-full border-primary/30 text-muted-foreground"
          >
            ← Go back
          </Button>
        </div>
        <FloatingHearts />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden px-4"
    >
      <FloatingHearts />

      <div className="z-10 text-center max-w-lg mx-auto">
        {/* Emoji art */}
        <div className="text-6xl sm:text-7xl mb-4" style={{ animation: 'bounce-in 0.6s ease-out' }}>
          💘
        </div>

        {/* Intro message */}
        <p className="text-muted-foreground text-base sm:text-lg mb-2 font-body">Dear Manice,</p>
        <p className="text-muted-foreground text-sm sm:text-base mb-6 font-body leading-relaxed">
          Every moment with you feels like a dream. You make my world brighter, warmer, and so much
          more beautiful. So I have a very important question…
        </p>

        {/* The big question */}
        <h1 className="font-script text-4xl sm:text-5xl md:text-6xl text-primary mb-2 leading-tight">
          Manice,
        </h1>
        <h2 className="font-script text-3xl sm:text-4xl md:text-5xl text-primary/80 mb-8">
          Will You Be My Valentine?
        </h2>

        <p className="text-sm text-muted-foreground mb-8 font-body">— with all my love, Vivek 💕</p>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={() => setAccepted(true)}
            className="font-body font-bold text-lg px-8 py-6 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300"
            style={{
              transform: `scale(${yesButtonSize})`,
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          >
            Yes! 💖
          </Button>

          <Button
            variant="outline"
            onMouseEnter={handleNoHover}
            onTouchStart={handleNoHover}
            onClick={() => {
              if (noCount < noTexts.length - 1) {
                handleNoHover()
              }
            }}
            className="font-body rounded-full border-primary/30 text-muted-foreground transition-all duration-300"
            style={{
              transform: `scale(${noButtonSize})`,
              ...(noPosition.top ? { position: 'absolute', top: noPosition.top, left: noPosition.left } : {}),
            }}
          >
            {noTexts[noCount]}
          </Button>
        </div>
      </div>
    </div>
  )
}

