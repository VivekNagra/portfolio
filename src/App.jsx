import './App.css'
import NavBar from './components/NavBar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BackgroundFX from './components/BackgroundFX'

function App() {
  return (
    <div className="relative min-h-full bg-white text-zinc-900 antialiased dark:bg-zinc-900 dark:text-zinc-100">
      <BackgroundFX />
      <NavBar />
      <main>
        <Hero />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
