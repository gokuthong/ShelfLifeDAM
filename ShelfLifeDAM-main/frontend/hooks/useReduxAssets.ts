import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchAssets,
  fetchAssetById,
  deleteAsset,
  setSearchQuery,
  setFilters,
  setCurrentPage,
  clearCurrentAsset,
  clearError,
} from '@/store/slices/assetsSlice'

export function useReduxAssets() {
  const dispatch = useAppDispatch()
  const {
    assets,
    currentAsset,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    searchQuery,
    filters,
  } = useAppSelector((state) => state.assets)

  const loadAssets = (options?: {
    page?: number
    pageSize?: number
    search?: string
    filters?: any
  }) => {
    return dispatch(fetchAssets(options || {}))
  }

  const loadAssetById = (assetId: string) => {
    return dispatch(fetchAssetById(assetId))
  }

  const removeAsset = (assetId: string) => {
    return dispatch(deleteAsset(assetId))
  }

  const updateSearchQuery = (query: string) => {
    dispatch(setSearchQuery(query))
  }

  const updateFilters = (newFilters: any) => {
    dispatch(setFilters(newFilters))
  }

  const changePage = (page: number) => {
    dispatch(setCurrentPage(page))
  }

  const clearAsset = () => {
    dispatch(clearCurrentAsset())
  }

  const clearAssetsError = () => {
    dispatch(clearError())
  }

  return {
    assets,
    currentAsset,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    searchQuery,
    filters,
    loadAssets,
    loadAssetById,
    removeAsset,
    updateSearchQuery,
    updateFilters,
    changePage,
    clearAsset,
    clearError: clearAssetsError,
  }
}
