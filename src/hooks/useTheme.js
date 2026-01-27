import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const next = stored ? stored === 'dark' : prefersDark
      applyTheme(next)
      setIsDark(next)
    } catch {
      // no-op
    }
  }, [])

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
      applyTheme(next)
      return next
    })
  }, [])

  return { isDark, toggle }
}

function applyTheme(isDark) {
  const root = document.documentElement
  const body = document.body
  root.classList.toggle('dark', isDark)
  body?.classList?.toggle('dark', isDark)
  // Helps form controls / scrollbars match the theme in supporting browsers.
  root.style.colorScheme = isDark ? 'dark' : 'light'
}


