import profileUrl from '../assets/profile.jpg'

export default function Hero() {
  return (
    <section id="home" className="mx-auto max-w-6xl px-4 pt-16 pb-10">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-5xl">Hi, I’m Vivek Singh Nagra</h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">26-year-old computer science / Software development student shaping futuristic, data-driven web experiences.
            I build with React and Tailwind, blending minimal design with real functionality.
            From dashboards to full-stack apps, my focus is on clarity, performance, and precision.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="link-underline rounded-md bg-[--color-brand] px-5 py-2.5 text-white shadow hover:opacity-90">
              View Projects
            </a>
            <a href="#contact" className="link-underline rounded-md border border-zinc-300 px-5 py-2.5 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">Contact</a>
          </div>
          </div>
        <div className="relative flex justify-center md:justify-end">
          <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-[0_0_50px_-10px_color-mix(in_oklab,var(--color-brand),transparent_60%)] md:h-56 md:w-56">
            <img
              src={profileUrl}
              alt="Vivek Singh Nagra"
              className="h-full w-full object-cover object-[50%_20%] scale-105"
              draggable={false}
              loading="eager"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-[--color-brand]/12 to-fuchsia-500/10" />
          </div>
          <div className="pointer-events-none absolute inset-0 -z-10 animate-[blobShift_12s_ease-in-out_infinite] rounded-full bg-gradient-to-tr from-fuchsia-500/40 to-[--color-brand]/40 blur-2xl" />
        </div>
      </div>
    </section>
  )
}


