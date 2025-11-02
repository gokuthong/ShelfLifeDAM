'use client'

import {
  Button,
  Text,
  VStack,
  HStack,
  Box,
} from '@chakra-ui/react'
import { Asset } from '@/types'
import { formatFileSize } from '@/utils/format'

interface DeleteAssetModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset
  onDelete: () => void
}

export function DeleteAssetModal({ isOpen, onClose, asset, onDelete }: DeleteAssetModalProps) {
  if (!isOpen) return null

  const handleDelete = () => {
    onDelete()
    onClose()
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={onClose}
    >
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="xl"
        minW="400px"
        maxW="500px"
        onClick={(e) => e.stopPropagation()}
      >
        <VStack align="stretch" gap={4}>
          <Text fontSize="xl" fontWeight="bold">
            Delete Asset
          </Text>

          <Text>
            Are you sure you want to delete this asset? This action cannot be undone.
          </Text>

          <Box p={3} bg="gray.50" rounded="md">
            <Text fontWeight="semibold">{asset.title}</Text>
            <HStack justify="space-between" fontSize="sm" color="gray.600">
              <Text>{asset.file_type}</Text>
              <Text>{formatFileSize(asset.file_size)}</Text>
            </HStack>
          </Box>

          <HStack gap={3} justify="flex-end" pt={4}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete Asset
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}