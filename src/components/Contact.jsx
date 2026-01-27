import { useState, useMemo, useRef } from 'react'
import { useCursorLight } from '../hooks/useCursorLight'

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const wrapRef = useRef(null)

  const isDisabled = useMemo(() => status === 'loading', [status])
  const isDev = import.meta.env && import.meta.env.DEV

  useCursorLight(wrapRef, { radius: 760, max: 0.85 })

  function validate(values) {
    const next = {}
    const name = String(values.name || '').trim()
    const email = String(values.email || '').trim()
    const message = String(values.message || '').trim()
    if (!name) next.name = 'Please enter your name.'
    else if (name.length < 2) next.name = 'Name must be at least 2 characters.'
    if (!email) next.email = 'Please enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Please enter a valid email.'
    if (!message) next.message = 'Please enter a message.'
    else if (message.length < 10) next.message = 'Message must be at least 10 characters.'
    else if (message.length > 2000) next.message = 'Message is too long (2000 max).'
    return next
  }

  async function onSubmit(e) {
    e.preventDefault()
    setServerError('')
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setStatus('loading')
    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok || data.ok === false) {
        if (resp.status === 404 && isDev) {
          setServerError('Local dev server does not serve /api. Use “vercel dev” or test the deployed site.')
        }
        if (data.fieldErrors) setErrors(prev => ({ ...prev, ...data.fieldErrors }))
        setServerError(data.error || 'Failed to send. Please try again.')
        throw new Error(data.error || 'Failed')
      }
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
      setErrors({})
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="reveal reveal-delay-0 mx-auto max-w-6xl px-4 py-12">
      <div
        ref={wrapRef}
        id="contact-form"
        className="scroll-mt-[var(--scroll-offset)] cursor-light rounded-xl border border-[color:var(--surface-border)] bg-[var(--surface-bg)] p-6 text-[var(--page-text)]"
      >
        <h2 className="text-3xl font-bold tracking-tight">Get in touch</h2>
        <p className="mt-2 text-[var(--muted-text)]">Have a question or want to work together? Send a message below and I’ll get back to you soon.</p>
        {status==='success' && (
          <div className="mt-4 rounded-md border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-950 dark:border-0 dark:bg-green-500/15 dark:text-green-100">
            Your message has been sent. I’ll get back to you shortly.
          </div>
        )}
        {serverError && (
          <div className="mt-4 rounded-md border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-950 dark:border-0 dark:bg-red-500/15 dark:text-red-100">
            {serverError}
          </div>
        )}
        {isDev && (
          <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-0 dark:bg-amber-500/15 dark:text-amber-200">
            Note: Local npm dev doesn’t host /api. Use <code>vercel dev</code> or test on your deployed Vercel URL.
          </div>
        )}
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="sm:col-span-1">
            <label className="block text-sm text-[var(--muted-text)]">Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={`mt-1 w-full rounded-md border bg-[var(--surface-bg-strong)] px-3 py-2 text-[var(--page-text)] outline-none ring-brand/20 focus:ring-4 ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-[color:var(--surface-border)]'}`}
              placeholder="Your name"
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? 'name-error' : undefined}
              disabled={isDisabled}
            />
            {errors.name && <p id="name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm text-[var(--muted-text)]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={`mt-1 w-full rounded-md border bg-[var(--surface-bg-strong)] px-3 py-2 text-[var(--page-text)] outline-none ring-brand/20 focus:ring-4 ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-[color:var(--surface-border)]'}`}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isDisabled}
            />
            {errors.email && <p id="email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-[var(--muted-text)]">Message</label>
            <textarea
              rows="4"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className={`mt-1 w-full rounded-md border bg-[var(--surface-bg-strong)] px-3 py-2 text-[var(--page-text)] outline-none ring-brand/20 focus:ring-4 ${errors.message ? 'border-red-400 focus:ring-red-200' : 'border-[color:var(--surface-border)]'}`}
              placeholder="How can I help?"
              aria-invalid={Boolean(errors.message) || undefined}
              aria-describedby={errors.message ? 'message-error' : undefined}
              disabled={isDisabled}
            />
            {errors.message && <p id="message-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <button
              disabled={isDisabled}
              className="relative w-full cursor-pointer rounded-md btn-ambient btn-pulse px-4 py-2.5 font-semibold text-white shadow-sm transition
                hover:shadow-[0_12px_30px_-10px_color-mix(in_oklab,var(--color-brand),transparent_60%)]
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[--color-brand]/40
                active:translate-y-[0.5px]
                disabled:cursor-not-allowed disabled:opacity-60"
              style={{ boxShadow: '0 0 0 2px color-mix(in oklab, var(--color-brand), transparent 80%)' }}
            >
              {status==='loading' ? 'Sending…' : status==='success' ? 'Sent!' : status==='error' ? 'Try again' : 'Send'}
              <span className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity hover:opacity-20" />
            </button>
          </div>
        </form>
        <div aria-live="polite" className="sr-only">
          {status==='success' ? 'Message sent' : status==='error' ? 'Message failed' : ''}
        </div>
      </div>
    </section>
  )
}


