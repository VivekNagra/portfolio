import { useCallback, useEffect, useRef, useState } from 'react'
import MishubishiShell from './MishubishiShell.jsx'
import './mishubishi.css'

export default function MishubishiGate() {
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Page-scoped theme: force light mode for this route
  useEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains('dark')
    const bodyHadDark = document.body.classList.contains('dark')
    root.classList.remove('dark')
    document.body.classList.remove('dark')
    document.body.classList.add('mishubishi')
    return () => {
      document.body.classList.remove('mishubishi')
      if (hadDark) root.classList.add('dark')
      if (bodyHadDark) document.body.classList.add('dark')
    }
  }, [])

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')
      setSubmitting(true)
      try {
        const resp = await fetch('/api/vault-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        if (!resp.ok) {
          setUnlocked(false)
          setError('Incorrect password.')
          setPassword('')
          queueMicrotask(() => inputRef.current?.focus?.())
          return
        }
        setUnlocked(true)
      } catch {
        setError('Network error. Try again.')
      } finally {
        setSubmitting(false)
      }
    },
    [password]
  )

  if (unlocked) return <MishubishiShell />

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_80px_rgba(0,0,0,.10)] p-5">
        <h1 className="text-lg font-bold text-zinc-900">Enter password</h1>
        <p className="mt-1 text-sm text-zinc-600">
          This page is protected. Refreshing will require the password again.
        </p>
        {error && (
          <div className="mt-3 rounded-xl border border-[rgba(255,80,80,.25)] bg-[rgba(255,80,80,.10)] px-3 py-2 text-sm text-[rgba(180,20,20,.95)]">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="mt-4">
          <label className="block text-xs font-semibold text-zinc-700" htmlFor="pw">
            Password
          </label>
          <input
            ref={inputRef}
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-zinc-900 outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/.20)]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 w-full rounded-xl bg-primary text-primary-foreground py-3 font-extrabold hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}

