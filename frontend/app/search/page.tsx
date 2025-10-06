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
  Heading,
} from '@chakra-ui/react'
import { Search as SearchIcon, Filter } from 'lucide-react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { AssetCard } from '@/components/Assets/AssetCard'
import { useAssets, useDeleteAsset } from '@/hooks/useAssets'

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    file_type: '',
    ordering: '-created_at',
    date_from: '',
    date_to: '',
  })

  const { data: assetsData, isLoading } = useAssets(filters)
  const deleteAsset = useDeleteAsset()

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDelete = async (assetId: string) => {
    try {
      await deleteAsset.mutateAsync(assetId)
    } catch (error) {
      console.error('Failed to delete asset:', error)
    }
  }

  return (
    <AppLayout>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Search Assets
          </Heading>
          <Text color="gray.600">
            Search through all your digital assets using keywords, filters, and date ranges
          </Text>
        </Box>

        {/* Search Bar */}
        <HStack gap={3}>
          <Input
            placeholder="Search by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            size="lg"
          />
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleSearch}
            leftIcon={<SearchIcon size={20} />}
          >
            Search
          </Button>
        </HStack>

        {/* Advanced Filters */}
        <Box
          bg="gray.50"
          p={4}
          borderRadius="md"
          border="1px"
          borderColor="gray.200"
        >
          <HStack gap={4} flexWrap="wrap" alignItems="end">
            <Box>
              <Text mb={2} fontSize="sm" fontWeight="medium">File Type</Text>
              <Box
                as="select"
                value={filters.file_type}
                onChange={(e) => setFilters(prev => ({ ...prev, file_type: e.target.value }))}
                p={2}
                border="1px"
                borderColor="gray.300"
                borderRadius="md"
                bg="white"
                minW="150px"
              >
                <option value="">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="pdf">PDFs</option>
                <option value="doc">Documents</option>
                <option value="audio">Audio</option>
                <option value="other">Other</option>
              </Box>
            </Box>

            <Box>
              <Text mb={2} fontSize="sm" fontWeight="medium">Sort By</Text>
              <Box
                as="select"
                value={filters.ordering}
                onChange={(e) => setFilters(prev => ({ ...prev, ordering: e.target.value }))}
                p={2}
                border="1px"
                borderColor="gray.300"
                borderRadius="md"
                bg="white"
                minW="180px"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="-title">Title Z-A</option>
                <option value="file_size">Size: Small to Large</option>
                <option value="-file_size">Size: Large to Small</option>
              </Box>
            </Box>

            <Box>
              <Text mb={2} fontSize="sm" fontWeight="medium">Date From</Text>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                bg="white"
              />
            </Box>

            <Box>
              <Text mb={2} fontSize="sm" fontWeight="medium">Date To</Text>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                bg="white"
              />
            </Box>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setFilters({
                  search: '',
                  file_type: '',
                  ordering: '-created_at',
                  date_from: '',
                  date_to: '',
                })
              }}
            >
              Clear Filters
            </Button>
          </HStack>
        </Box>

        {/* Results */}
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
              Found {assetsData.count} result{assetsData.count !== 1 ? 's' : ''}
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
            <SearchIcon size={48} color="gray" style={{ margin: '0 auto 16px' }} />
            <Text fontSize="lg" color="gray.500" mb={2}>
              No assets found
            </Text>
            <Text color="gray.600">
              Try adjusting your search terms or filters
            </Text>
          </Box>
        )}
      </VStack>
    </AppLayout>
  )
}