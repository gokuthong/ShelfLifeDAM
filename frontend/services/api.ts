import axios, { AxiosError } from 'axios'
import Cookies from 'universal-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const cookies = new Cookies()

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })
          localStorage.setItem('accessToken', response.data.access)
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// ============ Authentication ============
export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login/', { username, password })
  if (response.data.access && response.data.refresh) {
    localStorage.setItem('accessToken', response.data.access)
    localStorage.setItem('refreshToken', response.data.refresh)
  }
  return response
}

export const register = async (userData: {
  username: string
  email: string
  password: string
  password2: string
  role?: string
  first_name?: string
  last_name?: string
  profile_info?: string
}) => {
  return api.post('/auth/register/', userData)
}

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  try {
    await api.post('/auth/logout/', { refresh_token: refreshToken })
  } finally {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

export const getCurrentUser = async () => {
  return api.get('/users/me/')
}

// ============ Assets Management ============
export const getAssets = async (page = 1, pageSize = 20, filters?: any) => {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    ...filters,
  })
  return api.get(`/assets/?${params}`)
}

export const getAsset = async (id: number) => {
  return api.get(`/assets/${id}/`)
}

export const uploadAsset = async (
  formData: FormData,
  options?: {
    onUploadProgress?: (progressEvent: any) => void
  }
) => {
  return api.post('/assets/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...options,
  })
}

export const updateAsset = async (id: number, data: any) => {
  return api.patch(`/assets/${id}/`, data)
}

export const deleteAsset = async (id: number) => {
  return api.delete(`/assets/${id}/`)
}

export const downloadAsset = async (id: number) => {
  const response = await api.get(`/assets/${id}/download/`, {
    responseType: 'blob',
  })
  return response
}

// ============ Search and Filtering ============
export const searchAssets = async (queryParams: string) => {
  return api.get(`/assets/search/?${queryParams}`)
}

export const getAssetsByTag = async (tag: string) => {
  return api.get(`/assets/?tags=${tag}`)
}

export const getPopularTags = async () => {
  return api.get('/assets/tags/popular/')
}

// ============ Version Control ============
export const getAssetVersions = async (assetId: number) => {
  return api.get(`/assets/${assetId}/versions/`)
}

export const restoreAssetVersion = async (assetId: number, versionId: number) => {
  return api.post(`/assets/${assetId}/versions/${versionId}/restore/`)
}

// ============ Sharing and Collaboration ============
export const shareAsset = async (assetId: number, data: {
  users: string[]
  message?: string
  permissions?: string[]
}) => {
  return api.post(`/assets/${assetId}/share/`, data)
}

export const getSharedAssets = async () => {
  return api.get('/assets/shared/')
}

// ============ Activity and Logging ============
export const getActivityLogs = async (queryParams?: string) => {
  const url = queryParams ? `/activity/?${queryParams}` : '/activity/'
  return api.get(url)
}

export const getUserActivity = async (userId?: number) => {
  const url = userId ? `/activity/user/${userId}/` : '/activity/me/'
  return api.get(url)
}

// ============ User Management ============
export const getAllUsers = async (queryParams?: string) => {
  const url = queryParams ? `/users/?${queryParams}` : '/users/'
  return api.get(url)
}

export const getUser = async (id: number) => {
  return api.get(`/users/${id}/`)
}

export const updateUser = async (id: number, data: any) => {
  return api.patch(`/users/${id}/`, data)
}

export const deleteUser = async (id: number) => {
  return api.delete(`/users/${id}/`)
}

export const updateUserRole = async (userId: number, role: string) => {
  return api.patch(`/users/${userId}/role/`, { role })
}

// ============ User Profile ============
export const updateUserProfile = async (data: {
  first_name?: string
  last_name?: string
  email?: string
  profile_info?: string
}) => {
  return api.patch('/users/me/', data)
}

export const changePassword = async (data: {
  old_password: string
  new_password: string
  confirm_password: string
}) => {
  return api.post('/users/me/change-password/', data)
}

export const getUserStats = async () => {
  return api.get('/users/me/stats/')
}

export const getUserPermissions = async () => {
  return api.get('/users/me/permissions/')
}

// ============ Dashboard and Analytics ============
export const getDashboardStats = async () => {
  return api.get('/dashboard/stats/')
}

export const getRecentAssets = async (limit = 10) => {
  return api.get(`/assets/recent/?limit=${limit}`)
}

export const getStorageStats = async () => {
  return api.get('/dashboard/storage/')
}

export const getAssetTypeDistribution = async () => {
  return api.get('/dashboard/asset-types/')
}

export const getUserActivityStats = async (period = '30d') => {
  return api.get(`/dashboard/activity/?period=${period}`)
}

// ============ Metadata Management ============
export const getMetadataFields = async () => {
  return api.get('/metadata/fields/')
}

export const createMetadataField = async (data: {
  name: string
  type: string
  required?: boolean
  options?: string[]
}) => {
  return api.post('/metadata/fields/', data)
}

export const updateMetadataField = async (id: number, data: any) => {
  return api.patch(`/metadata/fields/${id}/`, data)
}

export const deleteMetadataField = async (id: number) => {
  return api.delete(`/metadata/fields/${id}/`)
}

// ============ Bulk Operations ============
export const bulkDeleteAssets = async (assetIds: number[]) => {
  return api.post('/assets/bulk-delete/', { asset_ids: assetIds })
}

export const bulkUpdateAssets = async (assetIds: number[], updates: any) => {
  return api.post('/assets/bulk-update/', {
    asset_ids: assetIds,
    updates,
  })
}

export const bulkDownloadAssets = async (assetIds: number[]) => {
  return api.post('/assets/bulk-download/',
    { asset_ids: assetIds },
    { responseType: 'blob' }
  )
}

// ============ Export and Import ============
export const exportAssets = async (format: 'csv' | 'json' | 'xlsx') => {
  return api.get(`/assets/export/?format=${format}`, {
    responseType: 'blob',
  })
}

export const importAssets = async (file: File, format: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('format', format)

  return api.post('/assets/import/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// ============ System Settings ============
export const getSystemSettings = async () => {
  return api.get('/settings/')
}

export const updateSystemSettings = async (settings: any) => {
  return api.patch('/settings/', settings)
}

// ============ Helper Functions ============
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦'
  return '📎'
}

export default api