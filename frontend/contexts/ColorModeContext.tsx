'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ColorMode = 'light' | 'dark'

interface ColorModeContextType {
  colorMode: ColorMode
  toggleColorMode: () => void
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined)

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>('light')

  useEffect(() => {
    // Load saved color mode from localStorage
    const saved = localStorage.getItem('chakra-ui-color-mode') as ColorMode
    if (saved) {
      setColorMode(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light'
    setColorMode(newMode)
    localStorage.setItem('chakra-ui-color-mode', newMode)
    document.documentElement.setAttribute('data-theme', newMode)
  }

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  )
}

export function useColorMode() {
  const context = useContext(ColorModeContext)
  if (!context) {
    throw new Error('useColorMode must be used within ColorModeProvider')
  }
  return context
}