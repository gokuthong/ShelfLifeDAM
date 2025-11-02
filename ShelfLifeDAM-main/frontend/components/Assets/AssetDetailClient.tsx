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
  Badge,
  Image,
  Spinner,
  IconButton,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { BabylonViewer } from '@/components/Assets/BabylonViewer'
import { AssetComments } from '@/components/Assets/AssetComments'
import { Download, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useColorMode } from '@/contexts/ColorModeContext'
import { Asset } from '@/types'
import { formatFileSize, formatDate, getFileIcon } from '@/utils/format'
import { authAPI } from '@/utils/api'
import { useDeleteAsset } from '@/hooks/useAssets'
import { DeleteAssetModal } from '@/components/Assets/DeleteAssetModal'

interface AssetDetailClientProps {
  assetId: string
}

export default function AssetDetailClient({ assetId }: AssetDetailClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { colorMode } = useColorMode()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const deleteAsset = useDeleteAsset()

  // Dark mode colors
  const cardBg = colorMode === 'dark' ? 'gray.800' : 'white'
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200'
  const previewBg = colorMode === 'dark' ? 'gray.700' : 'gray.50'
  const textColor = colorMode === 'dark' ? 'gray.300' : 'gray.600'
  const headingColor = colorMode === 'dark' ? 'white' : 'gray.700'
  const secondaryTextColor = colorMode === 'dark' ? 'gray.400' : 'gray.500'

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true)
        const response = await authAPI.getAsset(assetId)
        setAsset(response)
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

  const handleDownload = async () => {
    if (!asset) return

    try {
      const response = await fetch(asset.file_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = asset.file || asset.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback to opening in new tab if download fails
      window.open(asset.file_url, '_blank')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteAsset.mutateAsync(assetId)
      router.push('/assets')
    } catch (error) {
      console.error('Failed to delete asset:', error)
    }
  }

  // Admin and Editor can edit, delete and download any asset
  // Viewer can only view (cannot edit/delete/download)
  const canEdit = user?.is_admin || user?.is_editor
  const canDelete = user?.is_admin || user?.is_editor
  const canDownload = user?.is_admin || user?.is_editor

  const is3DFile = asset?.file_type === '3d'
  const isImageFile = asset?.file_type === 'image'
  const isVideoFile = asset?.file_type === 'video'

  // Extract filename from file URL
  const fileName = asset?.file ? asset.file.split('/').pop() || asset.title : asset?.title || ''

  if (loading) {
    return (
      <AppLayout>
        <Box display="flex" alignItems="center" justifyContent="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textColor}>Loading asset...</Text>
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
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <HStack justify="space-between">
          <HStack>
            <IconButton
              size="sm"
              variant="ghost"
              onClick={() => router.push('/assets')}
            >
              <ArrowLeft size={20} />
            </IconButton>
            <Heading size="lg">{asset.title}</Heading>
          </HStack>
          <HStack gap={2}>
            {canDownload && (
              <Button onClick={handleDownload}>
                <Download size={20} style={{ marginRight: '8px' }} />
                Download
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => router.push(`/assets/${assetId}/edit`)}
              >
                <Edit size={20} style={{ marginRight: '8px' }} />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                colorPalette="red"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 size={20} style={{ marginRight: '8px' }} />
                Delete
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Main Content */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', lg: '2fr 1fr' }}
          gap={6}
        >
          {/* Preview Section */}
          <Box>
            {is3DFile ? (
              <BabylonViewer assetUrl={asset.file_url} fileName={asset.title} />
            ) : isImageFile ? (
              <Box
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
                bg={previewBg}
              >
                <Image
                  src={asset.file_url}
                  alt={asset.title}
                  width="100%"
                  height="auto"
                  maxH="600px"
                  objectFit="contain"
                />
              </Box>
            ) : isVideoFile ? (
              <Box
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
                bg="black"
              >
                <video
                  controls
                  style={{ width: '100%', height: 'auto', maxHeight: '600px' }}
                >
                  <source src={asset.file_url} type={`video/${asset.file_extension}`} />
                  Your browser does not support the video tag.
                </video>
              </Box>
            ) : (
              <Box
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                p={10}
                bg={previewBg}
                textAlign="center"
              >
                <Box fontSize="6xl" mb={4}>
                  {getFileIcon(asset.file_type, asset.file_extension)}
                </Box>
                <Text fontSize="lg" fontWeight="semibold" mb={2}>
                  {fileName}
                </Text>
                <Text color={textColor} mb={4}>
                  Preview not available for this file type
                </Text>
                {canDownload && (
                  <Button onClick={handleDownload}>
                    <Download size={20} style={{ marginRight: '8px' }} />
                    Download to View
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Details Section */}
          <VStack align="stretch" gap={4}>
            <Box
              border="1px"
              borderColor={borderColor}
              borderRadius="md"
              p={5}
              bg={cardBg}
            >
              <Text fontSize="sm" fontWeight="semibold" mb={3} color={headingColor}>
                Asset Details
              </Text>

              <VStack align="stretch" gap={3}>
                <Box>
                  <Text fontSize="xs" color={secondaryTextColor} mb={1}>
                    File Type
                  </Text>
                  <Badge colorScheme="blue" textTransform="uppercase">
                    {asset.file_type}
                  </Badge>
                </Box>

                <Box>
                  <Text fontSize="xs" color={secondaryTextColor} mb={1}>
                    File Name
                  </Text>
                  <Text fontSize="sm" fontFamily="mono">
                    {fileName}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="xs" color={secondaryTextColor} mb={1}>
                    File Size
                  </Text>
                  <Text fontSize="sm">{formatFileSize(asset.file_size)}</Text>
                </Box>

                <Box>
                  <Text fontSize="xs" color={secondaryTextColor} mb={1}>
                    Uploaded By
                  </Text>
                  <Text fontSize="sm">{asset.user.username}</Text>
                </Box>

                <Box>
                  <Text fontSize="xs" color={secondaryTextColor} mb={1}>
                    Upload Date
                  </Text>
                  <Text fontSize="sm">{formatDate(asset.created_at)}</Text>
                </Box>

                <Box>
                  <Text fontSize="xs" color={secondaryTextColor} mb={1}>
                    Last Modified
                  </Text>
                  <Text fontSize="sm">{formatDate(asset.updated_at)}</Text>
                </Box>
              </VStack>
            </Box>

            {/* Description */}
            {asset.description && (
              <Box
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                p={5}
                bg={cardBg}
              >
                <Text fontSize="sm" fontWeight="semibold" mb={2} color={headingColor}>
                  Description
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {asset.description}
                </Text>
              </Box>
            )}

            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <Box
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                p={5}
                bg={cardBg}
              >
                <Text fontSize="sm" fontWeight="semibold" mb={3} color={headingColor}>
                  Tags
                </Text>
                <HStack gap={2} flexWrap="wrap">
                  {asset.tags.map((tag, index) => (
                    <Badge key={index} variant="subtle" colorScheme="gray">
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            {/* Metadata */}
            {asset.metadata_fields && asset.metadata_fields.length > 0 && (
              <Box
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                p={5}
                bg={cardBg}
              >
                <Text fontSize="sm" fontWeight="semibold" mb={3} color={headingColor}>
                  Metadata
                </Text>
                <VStack align="stretch" gap={2}>
                  {asset.metadata_fields.map((field) => (
                    <HStack key={field.metadata_id} justify="space-between">
                      <Text fontSize="xs" color={secondaryTextColor}>
                        {field.field_name}:
                      </Text>
                      <Text fontSize="xs" fontFamily="mono">
                        {field.field_value}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Comments Section */}
        <AssetComments assetId={assetId} />
      </VStack>

      <DeleteAssetModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        asset={asset}
        onDelete={handleDelete}
      />
    </AppLayout>
  )
}
