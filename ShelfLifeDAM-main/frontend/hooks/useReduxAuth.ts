import { useAppDispatch, useAppSelector } from '@/store'
import { loginUser, registerUser, logout, clearError } from '@/store/slices/authSlice'
import { useRouter } from 'next/navigation'

export function useReduxAuth() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, token, isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth)

  const login = async (username: string, password: string) => {
    const result = await dispatch(loginUser({ username, password }))
    if (loginUser.fulfilled.match(result)) {
      router.push('/dashboard')
    }
    return result
  }

  const register = async (username: string, email: string, password: string) => {
    const result = await dispatch(registerUser({ username, email, password }))
    if (registerUser.fulfilled.match(result)) {
      router.push('/dashboard')
    }
    return result
  }

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  const clearAuthError = () => {
    dispatch(clearError())
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout: handleLogout,
    clearError: clearAuthError,
  }
}
