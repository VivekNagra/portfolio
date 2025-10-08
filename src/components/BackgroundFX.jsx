export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, color-mix(in oklab, var(--color-brand), transparent 85%) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in oklab, var(--color-brand), transparent 85%) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(closest-side, black, transparent)',
          WebkitMaskImage: 'radial-gradient(closest-side, black, transparent)'
        }}
      />
      {/* Noise/dots overlay */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '3px 3px'
        }}
      />
    </div>
  )
}


