export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-12">
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Get in touch</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">Have a question or want to work together? Send a message or email <a className="underline decoration-[--color-brand] underline-offset-4" href="mailto:vivek.nagra@gmail.com">vivek.nagra@gmail.com</a>.</p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <div className="sm:col-span-1">
            <label className="block text-sm text-zinc-700 dark:text-zinc-300">Name</label>
            <input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-brand/20 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" placeholder="Your name" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm text-zinc-700 dark:text-zinc-300">Email</label>
            <input type="email" className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-brand/20 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" placeholder="you@example.com" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-zinc-700 dark:text-zinc-300">Message</label>
            <textarea rows="4" className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-brand/20 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" placeholder="How can I help?" />
          </div>
          <div className="sm:col-span-2">
            <button className="w-full rounded-md bg-[--color-brand] px-4 py-2.5 font-medium text-white shadow hover:opacity-90">Send</button>
          </div>
        </form>
      </div>
    </section>
  )
}


