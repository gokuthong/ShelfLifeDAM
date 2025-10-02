export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  first_name: string
  last_name: string
  profile_info?: string
  date_joined: string
  last_login?: string
}

export interface Asset {
  asset_id: string
  user: User
  file: string
  file_url: string
  file_type: 'image' | 'video' | 'pdf' | 'doc' | 'audio' | 'other'
  title: string
  description?: string
  tags: string[]
  version: number
  file_size: number
  mime_type?: string
  file_extension: string
  metadata_fields: Metadata[]
  versions: AssetVersion[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Metadata {
  metadata_id: string
  field_name: string
  field_value: string
  created_at: string
  updated_at: string
}

export interface AssetVersion {
  version_id: string
  version_number: number
  file: string
  file_size: number
  changes?: string
  created_by: User
  created_at: string
}

export interface ActivityLog {
  log_id: string
  asset: Asset
  user: User
  action: 'upload' | 'edit' | 'delete' | 'view' | 'download' | 'share'
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
}

export interface Comment {
  comment_id: string
  asset: Asset
  user: User
  content: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password2: string
  role: 'admin' | 'editor' | 'viewer'
  first_name?: string
  last_name?: string
  profile_info?: string
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}