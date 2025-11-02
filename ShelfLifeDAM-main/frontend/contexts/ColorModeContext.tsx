'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { toggleColorMode as toggleColorModeAction } from '@/store/slices/uiSlice'

type ColorMode = 'light' | 'dark'

interface ColorModeContextType {
  colorMode: ColorMode
  toggleColorMode: () => void
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined)

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const colorMode = useAppSelector((state) => state.ui.colorMode)

  useEffect(() => {
    // Apply theme to DOM
    document.documentElement.setAttribute('data-theme', colorMode)
    // Also update Chakra UI color mode
    localStorage.setItem('chakra-ui-color-mode', colorMode)
  }, [colorMode])

  const toggleColorMode = () => {
    dispatch(toggleColorModeAction())
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