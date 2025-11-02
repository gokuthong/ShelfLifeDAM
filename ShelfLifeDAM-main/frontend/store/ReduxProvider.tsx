'use client'

import { Provider } from 'react-redux'
import { store } from './index'
import { useEffect } from 'react'
import { fetchCurrentUser } from './slices/authSlice'
import { initializeColorMode } from './slices/uiSlice'

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth state on app load
    store.dispatch(fetchCurrentUser())
    // Initialize color mode from localStorage
    store.dispatch(initializeColorMode())
  }, [])

  return <Provider store={store}>{children}</Provider>
}
