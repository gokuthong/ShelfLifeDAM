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
import { Download, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { Asset } from '@/types'
import { formatFileSize, formatDate, getFileIcon, isImageFile } from '@/utils/format'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { DeleteAssetModal } from './DeleteAssetModal'

interface AssetCardProps {
  asset: Asset
  onDelete?: () => void
}

export function AssetCard({ asset, onDelete }: AssetCardProps) {
  const { user } = useAuth()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const canEdit = user?.is_admin || (user?.is_editor && asset.user.id === user.id)
  const canDelete = user?.is_admin || (user?.is_editor && asset.user.id === user.id)

  const handleDownload = () => {
    window.open(asset.file_url, '_blank')
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
        borderColor="gray.200"
        rounded="lg"
        overflow="hidden"
        bg="white"
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
          ) : (
            <Box
              height="200px"
              width="100%"
              bg="gray.100"
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
              bg="white"
              p={2}
              rounded="md"
              boxShadow="md"
            >
              <IconButton
                aria-label="View"
                size="sm"
                onClick={() => window.open(`/assets/${asset.asset_id}`, '_self')}
              >
                <Eye size={16} />
              </IconButton>

              <IconButton
                aria-label="Download"
                size="sm"
                onClick={handleDownload}
              >
                <Download size={16} />
              </IconButton>

              {canEdit && (
                <IconButton
                  aria-label="Edit"
                  size="sm"
                  onClick={() => window.open(`/assets/${asset.asset_id}/edit`, '_self')}
                >
                  <Edit size={16} />
                </IconButton>
              )}

              {canDelete && (
                <IconButton
                  aria-label="Delete"
                  size="sm"
                  colorScheme="red"
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
            <Text fontSize="xs" color="gray.600" noOfLines={2}>
              {asset.description}
            </Text>
          )}

          <HStack justify="space-between" fontSize="xs">
            <Badge colorScheme="blue" textTransform="lowercase">
              {asset.file_type}
            </Badge>
            <Text color="gray.500">
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
                <Text fontSize="2xs" color="gray.500">
                  +{asset.tags.length - 3} more
                </Text>
              )}
            </HStack>
          )}

          <Text fontSize="xs" color="gray.500">
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
    </>
  )
}