import { useCallback } from 'react'

export function useToast() {
  const toast = useCallback((options: {
    title: string
    description?: string
    status: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }) => {
    // Simple browser alert as fallback
    if (options.status === 'error') {
      alert(`Error: ${options.title}${options.description ? ` - ${options.description}` : ''}`)
    } else if (options.status === 'success') {
      alert(`Success: ${options.title}`)
    } else {
      alert(`${options.title}${options.description ? ` - ${options.description}` : ''}`)
    }
  }, [])

  return toast
}