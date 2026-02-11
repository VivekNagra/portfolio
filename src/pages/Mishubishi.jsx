import { useCallback, useEffect, useRef, useState } from 'react'
import ValentineShell from './ValentineShell.jsx'

export default function Mishubishi() {
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

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

  useEffect(() => {
    document.body.classList.add('mishubishi')
    return () => document.body.classList.remove('mishubishi')
  }, [])

  if (unlocked) return <ValentineShell />

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-[0_20px_80px_rgba(0,0,0,.10)] p-5">
        <h1 className="text-lg font-bold">Enter password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page is protected. Refreshing will require the password again.
        </p>
        {error && (
          <div className="mt-3 rounded-xl border border-[rgba(255,80,80,.25)] bg-[rgba(255,80,80,.10)] px-3 py-2 text-sm text-[rgba(180,20,20,.95)]">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="mt-4">
          <label className="block text-xs font-semibold text-muted-foreground" htmlFor="pw">
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
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-foreground outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/.20)]"
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

