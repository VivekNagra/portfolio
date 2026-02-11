import React from 'react'

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'default', type = 'button', ...props },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-body font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--primary)/.25)] disabled:opacity-60 disabled:pointer-events-none'

  const variants = {
    default:
      'bg-primary text-primary-foreground shadow-lg hover:brightness-105',
    outline:
      'border border-[hsl(var(--primary)/.30)] text-muted-foreground hover:bg-[hsl(var(--primary)/.08)]',
  }

  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant] || variants.default, className)}
      {...props}
    />
  )
})

