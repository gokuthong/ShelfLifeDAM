'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Grid,
  Text,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { AssetCard } from '@/components/Assets/AssetCard'
import { useAssets, useDeleteAsset } from '@/hooks/useAssets'

export default function AssetsPage() {
  const [filters, setFilters] = useState({
    search: '',
    file_type: '',
    ordering: '-created_at',
  })

  const { data: assetsData, isLoading } = useAssets(filters)
  const deleteAsset = useDeleteAsset()

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleDelete = async (assetId: string) => {
    try {
      await deleteAsset.mutateAsync(assetId)
      // The invalidateQueries in the hook will refresh the data
    } catch (error) {
      console.error('Failed to delete asset:', error)
    }
  }

  return (
    <AppLayout>
      <VStack align="stretch" gap={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Asset Library
          </Text>
          <Text color="gray.600">
            Manage and browse all your digital assets
          </Text>
        </Box>

        {/* Filters */}
        <HStack gap={4} flexWrap="wrap">
          <Input
            placeholder="Search assets..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            maxW="300px"
          />

          <Box
            as="select"
            value={filters.file_type}
            onChange={(e) => handleFilterChange('file_type', e.target.value)}
            maxW="200px"
            p={2}
            border="1px"
            borderColor="gray.300"
            borderRadius="md"
            bg="white"
          >
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="pdf">PDFs</option>
            <option value="doc">Documents</option>
            <option value="audio">Audio</option>
            <option value="other">Other</option>
          </Box>

          <Box
            as="select"
            value={filters.ordering}
            onChange={(e) => handleFilterChange('ordering', e.target.value)}
            maxW="200px"
            p={2}
            border="1px"
            borderColor="gray.300"
            borderRadius="md"
            bg="white"
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
            <option value="file_size">Size: Small to Large</option>
            <option value="-file_size">Size: Large to Small</option>
          </Box>
        </HStack>

        {/* Asset Grid */}
        {isLoading ? (
          <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={6}>
            {[1, 2, 3, 4].map(i => (
              <Box
                key={i}
                height="300px"
                bg="gray.100"
                rounded="lg"
              />
            ))}
          </Grid>
        ) : assetsData?.results && assetsData.results.length > 0 ? (
          <>
            <Text color="gray.600">
              Showing {assetsData.results.length} of {assetsData.count} assets
            </Text>
            <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={6}>
              {assetsData.results.map(asset => (
                <AssetCard
                  key={asset.asset_id}
                  asset={asset}
                  onDelete={() => handleDelete(asset.asset_id)}
                />
              ))}
            </Grid>
          </>
        ) : (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.500" mb={4}>
              No assets found
            </Text>
            <Text color="gray.600">
              {filters.search || filters.file_type
                ? 'Try adjusting your search filters'
                : 'Get started by uploading your first asset'
              }
            </Text>
          </Box>
        )}
      </VStack>
    </AppLayout>
  )
}