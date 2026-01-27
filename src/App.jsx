import './App.css'
import NavBar from './components/NavBar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BackgroundFX from './components/BackgroundFX'

function App() {
  return (
    <div className="relative min-h-full bg-[var(--page-bg)] text-[var(--page-text)] antialiased">
      <BackgroundFX />
      <NavBar />
      <main>
        <Hero />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
