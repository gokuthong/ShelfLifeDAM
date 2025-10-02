import { useQuery, useMutation, useQueryClient } from 'react-query'
import { assetsAPI } from '@/utils/api'
import { Asset } from '@/types'

export const useAssets = (params?: any) => {
  return useQuery(
    ['assets', params],
    () => assetsAPI.list(params),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}

export const useAsset = (id: string) => {
  return useQuery(
    ['asset', id],
    () => assetsAPI.get(id),
    {
      enabled: !!id,
    }
  )
}

export const useCreateAsset = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (data: FormData) => assetsAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('assets')
      },
    }
  )
}

export const useUpdateAsset = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }: { id: string; data: Partial<Asset> }) => assetsAPI.update(id, data),
    {
      onSuccess: (updatedAsset) => {
        queryClient.invalidateQueries('assets')
        queryClient.setQueryData(['asset', updatedAsset.asset_id], updatedAsset)
      },
    }
  )
}

export const useDeleteAsset = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (id: string) => assetsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('assets')
      },
    }
  )
}

export const useSearchAssets = () => {
  return useMutation(
    (params: any) => assetsAPI.search(params)
  )
}