export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 py-8 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">© <span>{new Date().getFullYear()}</span> Vivek Singh Nagra. All rights reserved.</p>
        <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <a href="https://github.com/VivekNagra" target="_blank" rel="noreferrer noopener" className="link-underline hover:text-[--color-brand]">GitHub</a>
          <a href="https://www.linkedin.com/in/viveknagra/" target="_blank" rel="noreferrer noopener" className="link-underline hover:text-[--color-brand]">LinkedIn</a>
          <a href="mailto:vivek.nagra@gmail.com" className="link-underline hover:text-[--color-brand]">Email</a>
        </div>
      </div>
    </footer>
  )
}


