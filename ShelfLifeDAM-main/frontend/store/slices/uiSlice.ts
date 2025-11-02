import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ColorMode = 'light' | 'dark'

interface UIState {
  colorMode: ColorMode
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
  }>
}

const initialState: UIState = {
  colorMode: 'light',
  sidebarOpen: true,
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setColorMode: (state, action: PayloadAction<ColorMode>) => {
      state.colorMode = action.payload
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('colorMode', action.payload)
      }
    },
    toggleColorMode: (state) => {
      state.colorMode = state.colorMode === 'light' ? 'dark' : 'light'
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('colorMode', state.colorMode)
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    addNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'info' | 'warning'
        message: string
      }>
    ) => {
      const id = Date.now().toString()
      state.notifications.push({
        id,
        ...action.payload,
      })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    initializeColorMode: (state) => {
      // Load from localStorage on initialization
      if (typeof window !== 'undefined') {
        const savedMode = localStorage.getItem('colorMode') as ColorMode
        if (savedMode) {
          state.colorMode = savedMode
        }
      }
    },
  },
})

export const {
  setColorMode,
  toggleColorMode,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  initializeColorMode,
} = uiSlice.actions

export default uiSlice.reducer
