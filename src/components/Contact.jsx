import { useState } from 'react'

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  async function onSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok || data.ok === false) throw new Error(data.error || 'Failed')
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-12">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Get in touch</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">Have a question or want to work together? Send a message or email <a className="underline decoration-[--color-brand] underline-offset-4" href="mailto:vivek.nagra@gmail.com">vivek.nagra@gmail.com</a>.</p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="sm:col-span-1">
            <label className="block text-sm text-zinc-700 dark:text-zinc-300">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-brand/20 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" placeholder="Your name" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm text-zinc-700 dark:text-zinc-300">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-brand/20 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" placeholder="you@example.com" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-zinc-700 dark:text-zinc-300">Message</label>
            <textarea rows="4" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-brand/20 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" placeholder="How can I help?" />
          </div>
          <div className="sm:col-span-2">
            <button disabled={status==='loading'} className="w-full rounded-md bg-[--color-brand] px-4 py-2.5 font-medium text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {status==='loading' ? 'Sending…' : status==='success' ? 'Sent!' : status==='error' ? 'Try again' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}


