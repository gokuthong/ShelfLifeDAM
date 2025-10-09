import axios from 'axios'
import { User, LoginData, RegisterData, Asset, Comment, ActivityLog } from '@/types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
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
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          localStorage.setItem('accessToken', access)
          originalRequest.headers.Authorization = `Bearer ${access}`

          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login/', data)
    return response.data
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register/', data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile/')
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile/', data)
    return response.data
  },

  changePassword: async (data: { old_password: string; new_password: string; new_password2: string }) => {
    const response = await api.post('/auth/profile/change-password/', data)
    return response.data
  },

  getAllUsers: async () => {
    const response = await api.get('/auth/users/')
    return response.data
  },

  getUserById: async (id: number) => {
    const response = await api.get(`/auth/users/${id}/`)
    return response.data
  },

  updateUser: async (id: number, data: any) => {
    const response = await api.put(`/auth/users/${id}/`, data)
    return response.data
  },

  deleteUser: async (id: number) => {
    await api.delete(`/auth/users/${id}/`)
  },
}

export const assetsAPI = {
  list: async (params?: any): Promise<{ results: Asset[]; count: number }> => {
    const response = await api.get('/assets/assets/', { params })
    return response.data
  },

  get: async (id: string): Promise<Asset> => {
    const response = await api.get(`/assets/assets/${id}/`)
    return response.data
  },

  create: async (data: FormData): Promise<Asset> => {
    const response = await api.post('/assets/assets/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  update: async (id: string, data: Partial<Asset>): Promise<Asset> => {
    const response = await api.patch(`/assets/assets/${id}/`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/assets/assets/${id}/`)
  },

  upload: async (data: FormData): Promise<Asset> => {
    const response = await api.post('/assets/upload/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  search: async (params: any): Promise<Asset[]> => {
    const response = await api.get('/assets/search/', { params })
    return response.data
  },
}

export const activityAPI = {
  getLogs: async (params?: any): Promise<{ results: ActivityLog[]; count: number }> => {
    const response = await api.get('/activity/logs/', { params })
    return response.data
  },

  getRecent: async (limit = 10): Promise<ActivityLog[]> => {
    const response = await api.get('/activity/recent/', { params: { limit } })
    return response.data
  },

  getComments: async (assetId: string): Promise<Comment[]> => {
    const response = await api.get(`/activity/comments/?asset=${assetId}`)
    return response.data
  },

  createComment: async (assetId: string, content: string): Promise<Comment> => {
    const response = await api.post('/activity/comments/', { asset: assetId, content })
    return response.data
  },

  deleteComment: async (id: string) => {
    await api.delete(`/activity/comments/${id}/`)
  },
}

export const usersAPI = {
  list: async (): Promise<User[]> => {
    const response = await api.get('/auth/users/')
    return response.data
  },

  get: async (id: number): Promise<User> => {
    const response = await api.get(`/auth/users/${id}/`)
    return response.data
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/auth/users/${id}/`, data)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/auth/users/${id}/`)
  },
}

export default api