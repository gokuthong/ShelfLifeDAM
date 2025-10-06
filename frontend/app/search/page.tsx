'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/Layout/AppLayout'
import {
  Box,
  Input,
  Button,
  Stack,
  Text,
  Card,
  Badge,
  SimpleGrid,
  Select,
  Checkbox,
  CheckboxGroup,
  Spinner,
  Center,
  EmptyState,
} from '@chakra-ui/react'
import { searchAssets } from '@/services/api'
import { Asset } from '@/types'
import { AssetCard } from '@/components/Assets/AssetCard'
import { format } from 'date-fns'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    fileType: 'all',
    dateFrom: '',
    dateTo: '',
    tags: [] as string[],
    uploadedBy: '',
  })
  const [results, setResults] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([
    'design', 'marketing', 'development', 'documentation',
    'presentation', 'video', 'image', 'report'
  ])

  const handleSearch = async () => {
    setIsLoading(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams()

      if (searchQuery) params.append('search', searchQuery)
      if (filters.fileType !== 'all') params.append('file_type', filters.fileType)
      if (filters.dateFrom) params.append('date_from', filters.dateFrom)
      if (filters.dateTo) params.append('date_to', filters.dateTo)
      if (filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag))
      }
      if (filters.uploadedBy) params.append('uploaded_by', filters.uploadedBy)

      const response = await searchAssets(params.toString())
      setResults(response.data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDownload = async (asset: Asset) => {
    // Implementation from AssetLibrary
    window.open(asset.file, '_blank')
  }

  const handleEdit = (asset: Asset) => {
    // Navigate to edit page or open modal
    console.log('Edit asset:', asset)
  }

  const handleDelete = async (asset: Asset) => {
    if (confirm(`Are you sure you want to delete "${asset.title}"?`)) {
      // Implementation for delete
      console.log('Delete asset:', asset)
    }
  }

  const clearFilters = () => {
    setFilters({
      fileType: 'all',
      dateFrom: '',
      dateTo: '',
      tags: [],
      uploadedBy: '',
    })
    setSearchQuery('')
  }

  return (
    <AppLayout>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Search Assets
          </Text>
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            Find assets using keywords, filters, and tags
          </Text>
        </Box>

        {/* Search Bar */}
        <Card.Root>
          <Card.Body>
            <Stack spacing={4}>
              <Box display="flex" gap={2}>
                <Input
                  placeholder="Search by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="lg"
                  flex={1}
                />
                <Button
                  onClick={handleSearch}
                  colorScheme="blue"
                  size="lg"
                  minW="120px"
                  loading={isLoading}
                >
                  Search
                </Button>
              </Box>

              {/* Advanced Filters */}
              <Box>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    const element = document.getElementById('advanced-filters')
                    if (element) {
                      element.style.display =
                        element.style.display === 'none' ? 'block' : 'none'
                    }
                  }}
                >
                  Advanced Filters ▼
                </Button>
              </Box>

              <Box id="advanced-filters" style={{ display: 'none' }}>
                <Stack spacing={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text mb={2} fontWeight="medium">File Type</Text>
                      <Box
                        as="select"
                        value={filters.fileType}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          fileType: (e.target as HTMLSelectElement).value
                        }))}
                        w="full"
                        p={2}
                        border="1px"
                        borderColor={{ base: "gray.300", _dark: "gray.600" }}
                        borderRadius="md"
                        bg={{ base: "white", _dark: "gray.800" }}
                      >
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="document">Documents</option>
                        <option value="pdf">PDFs</option>
                      </Box>
                    </Box>

                    <Box>
                      <Text mb={2} fontWeight="medium">Uploaded By</Text>
                      <Input
                        placeholder="Username"
                        value={filters.uploadedBy}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          uploadedBy: e.target.value
                        }))}
                      />
                    </Box>

                    <Box>
                      <Text mb={2} fontWeight="medium">Date From</Text>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateFrom: e.target.value
                        }))}
                      />
                    </Box>

                    <Box>
                      <Text mb={2} fontWeight="medium">Date To</Text>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateTo: e.target.value
                        }))}
                      />
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Text mb={2} fontWeight="medium">Tags</Text>
                    <Stack direction="row" flexWrap="wrap" spacing={2}>
                      {availableTags.map(tag => (
                        <Badge
                          key={tag}
                          colorScheme={filters.tags.includes(tag) ? "blue" : "gray"}
                          cursor="pointer"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              tags: prev.tags.includes(tag)
                                ? prev.tags.filter(t => t !== tag)
                                : [...prev.tags, tag]
                            }))
                          }}
                          px={3}
                          py={1}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Stack>
                  </Box>

                  <Box display="flex" gap={2}>
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      size="sm"
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>

        {/* Search Results */}
        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : hasSearched && results.length === 0 ? (
          <Card.Root>
            <Card.Body>
              <Center py={10}>
                <Stack spacing={3} align="center">
                  <Text fontSize="4xl">🔍</Text>
                  <Text fontSize="lg" fontWeight="medium">
                    No results found
                  </Text>
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    Try adjusting your search terms or filters
                  </Text>
                </Stack>
              </Center>
            </Card.Body>
          </Card.Root>
        ) : results.length > 0 ? (
          <Box>
            <Text mb={4} fontWeight="medium">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {results.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onDownload={handleDownload}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SimpleGrid>
          </Box>
        ) : null}
      </Stack>
    </AppLayout>
  )
}