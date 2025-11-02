'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Spinner,
  IconButton,
  Badge,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Asset } from '@/types'
import { authAPI, assetsAPI } from '@/utils/api'

interface EditAssetClientProps {
  assetId: string
}

export function EditAssetClient({ assetId }: EditAssetClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true)
        const response = await authAPI.getAsset(assetId)
        setAsset(response)
        setFormData({
          title: response.title || '',
          description: response.description || '',
          tags: response.tags || [],
        })
      } catch (err: any) {
        console.error('Error fetching asset:', err)
        setError(err.response?.data?.detail || 'Failed to load asset')
      } finally {
        setLoading(false)
      }
    }

    if (assetId) {
      fetchAsset()
    }
  }, [assetId])

  // Check if user can edit - Admin and Editor can edit any asset
  const canEdit = user?.is_admin || user?.is_editor

  useEffect(() => {
    if (!loading && asset && !canEdit) {
      alert('Access Denied: You do not have permission to edit this asset')
      router.push(`/assets/${assetId}`)
    }
  }, [loading, asset, canEdit, assetId, router])

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Validation Error: Title is required')
      return
    }

    try {
      setSaving(true)
      await assetsAPI.update(assetId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tags,
      })

      alert('Success: Asset updated successfully')
      router.push(`/assets/${assetId}`)
    } catch (err: any) {
      console.error('Error updating asset:', err)
      alert(`Error: ${err.response?.data?.detail || 'Failed to update asset'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Box display="flex" alignItems="center" justifyContent="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading asset...</Text>
          </VStack>
        </Box>
      </AppLayout>
    )
  }

  if (error || !asset) {
    return (
      <AppLayout>
        <Box textAlign="center" py={10}>
          <Text fontSize="xl" color="red.500" mb={4}>
            {error || 'Asset not found'}
          </Text>
          <Button onClick={() => router.push('/assets')}>
            <ArrowLeft size={20} style={{ marginRight: '8px' }} />
            Back to Assets
          </Button>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box maxW="1600px" mx="auto" w="full" px={8}>
        <VStack align="stretch" gap={6}>
          {/* Header */}
          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            border="1px"
            borderColor="gray.200"
            boxShadow="md"
          >
            <HStack justify="space-between" align="center">
              <HStack gap={4}>
                <IconButton
                  size="lg"
                  variant="outline"
                  onClick={() => router.push(`/assets/${assetId}`)}
                  borderRadius="lg"
                  colorPalette="gray"
                >
                  <ArrowLeft size={22} />
                </IconButton>
                <Box>
                  <Heading size="2xl" mb={2}>Edit Asset</Heading>
                  <Text fontSize="md" color="gray.600">
                    Update asset information, add tags, and manage metadata
                  </Text>
                </Box>
              </HStack>
              <HStack gap={3}>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/assets/${assetId}`)}
                  disabled={saving}
                  size="xl"
                  px={8}
                  borderRadius="lg"
                >
                  <X size={20} style={{ marginRight: '8px' }} />
                  Cancel
                </Button>
                <Button
                  colorPalette="blue"
                  loading={saving}
                  onClick={handleSubmit}
                  size="xl"
                  px={8}
                  borderRadius="lg"
                >
                  <Save size={20} style={{ marginRight: '8px' }} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Main Content Grid */}
          <Box
            as="form"
            onSubmit={handleSubmit}
            display="grid"
            gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            gap={6}
          >
            {/* Left Column - Asset Preview & Info */}
            <VStack align="stretch" gap={6}>
              {/* Asset Preview Card */}
              <Box
                bg="white"
                p={8}
                borderRadius="xl"
                border="1px"
                borderColor="gray.200"
                boxShadow="md"
              >
                <HStack justify="space-between" mb={6}>
                  <Heading size="lg">Asset Preview</Heading>
                  <Badge colorPalette="purple" variant="subtle" fontSize="sm" px={3} py={1}>
                    {asset.file_type.toUpperCase()}
                  </Badge>
                </HStack>
                <Box
                  borderRadius="lg"
                  overflow="hidden"
                  bg="gray.900"
                  border="2px"
                  borderColor="gray.300"
                  aspectRatio="16/9"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="inner"
                >
                  {asset.file_type === 'image' ? (
                    <Box
                      as="img"
                      src={asset.file_url}
                      alt={asset.title}
                      w="full"
                      h="full"
                      objectFit="cover"
                    />
                  ) : (
                    <VStack gap={4}>
                      <Text fontSize="6xl">📄</Text>
                      <VStack gap={2}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          {asset.file_type.toUpperCase()} File
                        </Text>
                        <Text fontSize="sm" color="gray.400" maxW="300px" textAlign="center" noOfLines={2}>
                          {asset.file?.split('/').pop() || 'Asset file'}
                        </Text>
                      </VStack>
                    </VStack>
                  )}
                </Box>
              </Box>

              {/* Asset Information Grid */}
              <Box
                bg="white"
                p={8}
                borderRadius="xl"
                border="1px"
                borderColor="gray.200"
                boxShadow="md"
              >
                <Heading size="lg" mb={6}>File Details</Heading>
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(2, 1fr)"
                  gap={6}
                >
                  <Box
                    p={4}
                    bg="blue.50"
                    borderRadius="lg"
                    border="1px"
                    borderColor="blue.100"
                  >
                    <Text fontSize="xs" color="blue.600" fontWeight="semibold" mb={2}>
                      FILE TYPE
                    </Text>
                    <Badge colorPalette="blue" variant="solid" fontSize="sm">
                      {asset.file_type}
                    </Badge>
                  </Box>

                  <Box
                    p={4}
                    bg="green.50"
                    borderRadius="lg"
                    border="1px"
                    borderColor="green.100"
                  >
                    <Text fontSize="xs" color="green.600" fontWeight="semibold" mb={2}>
                      FILE SIZE
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.700">
                      {(asset.file_size / 1024).toFixed(2)} KB
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    bg="purple.50"
                    borderRadius="lg"
                    border="1px"
                    borderColor="purple.100"
                  >
                    <Text fontSize="xs" color="purple.600" fontWeight="semibold" mb={2}>
                      UPLOADED BY
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="purple.700">
                      {asset.user?.username || 'Unknown'}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    bg="orange.50"
                    borderRadius="lg"
                    border="1px"
                    borderColor="orange.100"
                  >
                    <Text fontSize="xs" color="orange.600" fontWeight="semibold" mb={2}>
                      CREATED DATE
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="orange.700">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </VStack>

            {/* Right Column - Form Fields */}
            <VStack align="stretch" gap={6}>
              {/* Basic Details Card */}
              <Box
                bg="white"
                p={8}
                borderRadius="xl"
                border="1px"
                borderColor="gray.200"
                boxShadow="md"
              >
                <Heading size="lg" mb={6}>Basic Information</Heading>
                <VStack align="stretch" gap={6}>
                  {/* Title */}
                  <Box>
                    <HStack mb={3}>
                      <Text fontSize="md" fontWeight="bold" color="gray.700">
                        Asset Title
                      </Text>
                      <Badge colorPalette="red" variant="solid" fontSize="xs" px={2} py={1}>
                        Required
                      </Badge>
                    </HStack>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Product Photo - Summer Collection 2024"
                      size="xl"
                      required
                      borderRadius="lg"
                      border="2px"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    />
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      Give your asset a clear, descriptive name
                    </Text>
                  </Box>

                  {/* Description */}
                  <Box>
                    <Text mb={3} fontSize="md" fontWeight="bold" color="gray.700">
                      Description
                    </Text>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this asset in detail - what it is, its purpose, how it should be used, and any relevant context..."
                      rows={6}
                      resize="vertical"
                      size="xl"
                      borderRadius="lg"
                      border="2px"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    />
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      Help team members understand the context and usage
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {/* Tags and Metadata Card */}
              <Box
                bg="white"
                p={8}
                borderRadius="xl"
                border="1px"
                borderColor="gray.200"
                boxShadow="md"
              >
                <Heading size="lg" mb={6}>Tags & Categories</Heading>
                <VStack align="stretch" gap={5}>
                  <Box>
                    <Text mb={3} fontSize="md" fontWeight="bold" color="gray.700">
                      Add New Tag
                    </Text>
                    <HStack gap={3}>
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a tag name..."
                        size="xl"
                        borderRadius="lg"
                        border="2px"
                        flex={1}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      />
                      <Button
                        onClick={handleAddTag}
                        colorPalette="blue"
                        size="xl"
                        px={10}
                        borderRadius="lg"
                        fontWeight="bold"
                      >
                        Add Tag
                      </Button>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      Press Enter or click "Add Tag" to add
                    </Text>
                  </Box>

                  {formData.tags.length > 0 ? (
                    <Box>
                      <HStack justify="space-between" mb={4}>
                        <Text fontSize="md" fontWeight="bold" color="gray.700">
                          Active Tags
                        </Text>
                        <Badge colorPalette="blue" variant="solid" fontSize="sm" px={3} py={1}>
                          {formData.tags.length} {formData.tags.length === 1 ? 'Tag' : 'Tags'}
                        </Badge>
                      </HStack>
                      <Box
                        p={5}
                        bg="gradient-to-br from-blue.50 to-indigo.50"
                        borderRadius="lg"
                        border="2px"
                        borderColor="blue.200"
                      >
                        <HStack gap={3} flexWrap="wrap">
                          {formData.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="solid"
                              colorPalette="blue"
                              px={4}
                              py={2}
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              gap={2}
                              fontSize="md"
                              fontWeight="semibold"
                              boxShadow="md"
                              _hover={{ transform: 'scale(1.05)', transition: 'all 0.2s' }}
                            >
                              {tag}
                              <Box
                                as="button"
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                ml={1}
                                cursor="pointer"
                                _hover={{ opacity: 0.7 }}
                                display="flex"
                                alignItems="center"
                                bg="whiteAlpha.300"
                                borderRadius="full"
                                p={1}
                              >
                                <X size={14} />
                              </Box>
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      p={8}
                      bg="gradient-to-br from-blue.50 to-indigo.50"
                      borderRadius="lg"
                      border="2px"
                      borderColor="blue.200"
                      borderStyle="dashed"
                      textAlign="center"
                    >
                      <VStack gap={2}>
                        <Text fontSize="3xl">🏷️</Text>
                        <Text fontSize="md" color="blue.700" fontWeight="bold">
                          No tags yet
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          Add tags to help organize and find this asset easily
                        </Text>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </AppLayout>
  )
}
