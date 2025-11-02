'use client'

import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  Button,
} from '@chakra-ui/react'
import { Download, Edit, Trash2, Eye, Box as BoxIcon } from 'lucide-react'
import Link from 'next/link'
import { Asset } from '@/types'
import { formatFileSize, formatDate, getFileIcon, isImageFile } from '@/utils/format'
import { useAuth } from '@/contexts/AuthContext'
import { useColorMode } from '@/contexts/ColorModeContext'
import { useState } from 'react'
import { DeleteAssetModal } from './DeleteAssetModal'
import { BabylonViewerModal } from './BabylonViewerModal'

interface AssetCardProps {
  asset: Asset
  onDelete?: () => void
}

export function AssetCard({ asset, onDelete }: AssetCardProps) {
  const { user } = useAuth()
  const { colorMode } = useColorMode()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false)
  const [showActions, setShowActions] = useState(false)

  // Dark mode colors
  const cardBg = colorMode === 'dark' ? 'gray.800' : 'white'
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200'
  const textColor = colorMode === 'dark' ? 'gray.300' : 'gray.600'
  const secondaryTextColor = colorMode === 'dark' ? 'gray.400' : 'gray.500'
  const previewBg = colorMode === 'dark' ? 'gray.700' : 'gray.100'
  const actionsBg = colorMode === 'dark' ? 'gray.800' : 'white'

  // Admin and Editor can edit, delete, and download any asset
  // Viewer can only view (cannot edit/delete/download)
  const canEdit = user?.is_admin || user?.is_editor
  const canDelete = user?.is_admin || user?.is_editor
  const canDownload = user?.is_admin || user?.is_editor
  const is3DFile = asset.file_type === '3d'

  const handleDownload = async () => {
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

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete()
    }
    setIsDeleteModalOpen(false)
  }

  return (
    <>
      <Box
        border="1px"
        borderColor={borderColor}
        rounded="lg"
        overflow="hidden"
        bg={cardBg}
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <Box position="relative">
          {isImageFile(asset.file_type) ? (
            <Image
              src={asset.file_url}
              alt={asset.title}
              height="200px"
              width="100%"
              objectFit="cover"
            />
          ) : asset.file_type === '3d' ? (
            <Box
              height="200px"
              width="100%"
              bg="gray.900"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <Box
                position="absolute"
                fontSize="6xl"
                opacity={0.3}
                color="blue.400"
              >
                📦
              </Box>
              <Box
                position="absolute"
                bottom={2}
                left="50%"
                transform="translateX(-50%)"
                bg="rgba(0, 0, 0, 0.7)"
                px={2}
                py={1}
                borderRadius="md"
              >
                <Text fontSize="xs" color="white">
                  3D Model
                </Text>
              </Box>
            </Box>
          ) : (
            <Box
              height="200px"
              width="100%"
              bg={previewBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="4xl"
            >
              {getFileIcon(asset.file_type, asset.file_extension)}
            </Box>
          )}

          {showActions && (
            <Box
              position="absolute"
              top={2}
              right={2}
              display="flex"
              gap={2}
              bg={actionsBg}
              p={2}
              rounded="md"
              boxShadow="md"
            >
              {is3DFile && (
                <IconButton
                  size="sm"
                  colorPalette="purple"
                  onClick={() => setIs3DViewerOpen(true)}
                >
                  <BoxIcon size={16} />
                </IconButton>
              )}

              <IconButton
                size="sm"
                onClick={() => window.open(`/assets/${asset.asset_id}`, '_self')}
              >
                <Eye size={16} />
              </IconButton>

              {canDownload && (
                <IconButton
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download size={16} />
                </IconButton>
              )}

              {canEdit && (
                <IconButton
                  size="sm"
                  onClick={() => window.open(`/assets/${asset.asset_id}/edit`, '_self')}
                >
                  <Edit size={16} />
                </IconButton>
              )}

              {canDelete && (
                <IconButton
                  size="sm"
                  colorPalette="red"
                  onClick={handleDeleteClick}
                >
                  <Trash2 size={16} />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        <VStack align="stretch" p={4} gap={2}>
          <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
            {asset.title}
          </Text>

          {asset.description && (
            <Text fontSize="xs" color={textColor} noOfLines={2}>
              {asset.description}
            </Text>
          )}

          <HStack justify="space-between" fontSize="xs">
            <Badge colorScheme="blue" textTransform="lowercase">
              {asset.file_type}
            </Badge>
            <Text color={secondaryTextColor}>
              {formatFileSize(asset.file_size)}
            </Text>
          </HStack>

          {asset.tags && asset.tags.length > 0 && (
            <HStack gap={1} flexWrap="wrap">
              {asset.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="subtle" colorScheme="gray" fontSize="2xs">
                  {tag}
                </Badge>
              ))}
              {asset.tags.length > 3 && (
                <Text fontSize="2xs" color={secondaryTextColor}>
                  +{asset.tags.length - 3} more
                </Text>
              )}
            </HStack>
          )}

          <Text fontSize="xs" color={secondaryTextColor}>
            Uploaded {formatDate(asset.created_at)}
          </Text>
        </VStack>
      </Box>

      <DeleteAssetModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        asset={asset}
        onDelete={handleDeleteConfirm}
      />

      {is3DFile && (
        <BabylonViewerModal
          isOpen={is3DViewerOpen}
          onClose={() => setIs3DViewerOpen(false)}
          assetUrl={asset.file_url}
          fileName={asset.title}
        />
      )}
    </>
  )
}