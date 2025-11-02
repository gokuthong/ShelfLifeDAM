import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Asset } from '@/types'

interface AssetsState {
  assets: Asset[]
  currentAsset: Asset | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  searchQuery: string
  filters: {
    fileType?: string
    tags?: string[]
    dateFrom?: string
    dateTo?: string
  }
}

const initialState: AssetsState = {
  assets: [],
  currentAsset: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
  searchQuery: '',
  filters: {},
}

// Async thunks
export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (
    {
      page = 1,
      pageSize = 20,
      search = '',
      filters = {},
    }: {
      page?: number
      pageSize?: number
      search?: string
      filters?: any
    },
    { rejectWithValue }
  ) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ...(search && { search }),
        ...filters,
      })

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/assets/?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        return rejectWithValue('Failed to fetch assets')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

export const fetchAssetById = createAsyncThunk(
  'assets/fetchAssetById',
  async (assetId: string, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/assets/${assetId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        return rejectWithValue('Failed to fetch asset')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

export const deleteAsset = createAsyncThunk(
  'assets/deleteAsset',
  async (assetId: string, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/assets/${assetId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        return rejectWithValue('Failed to delete asset')
      }

      return assetId
    } catch (error) {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.currentPage = 1 // Reset to first page on new search
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = action.payload
      state.currentPage = 1 // Reset to first page on filter change
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    clearCurrentAsset: (state) => {
      state.currentAsset = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch assets
    builder.addCase(fetchAssets.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchAssets.fulfilled, (state, action) => {
      state.isLoading = false
      state.assets = action.payload.results || action.payload
      state.totalCount = action.payload.count || action.payload.length
      state.error = null
    })
    builder.addCase(fetchAssets.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Fetch asset by ID
    builder.addCase(fetchAssetById.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchAssetById.fulfilled, (state, action) => {
      state.isLoading = false
      state.currentAsset = action.payload
      state.error = null
    })
    builder.addCase(fetchAssetById.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Delete asset
    builder.addCase(deleteAsset.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(deleteAsset.fulfilled, (state, action) => {
      state.isLoading = false
      state.assets = state.assets.filter((asset) => asset.asset_id !== action.payload)
      state.error = null
    })
    builder.addCase(deleteAsset.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  },
})

export const { setSearchQuery, setFilters, setCurrentPage, clearCurrentAsset, clearError } =
  assetsSlice.actions
export default assetsSlice.reducer
