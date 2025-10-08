import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'theme'

export function useTheme() {
  const [theme, setTheme] = useState('system')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
      applyTheme(stored)
    } else {
      setTheme('system')
      applyTheme(systemPrefersDark() ? 'dark' : 'light')
    }
  }, [])

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      applyTheme(next)
      return next
    })
  }, [])

  return { theme, toggle }
}

function applyTheme(mode) {
  const root = document.documentElement
  if (mode === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}


