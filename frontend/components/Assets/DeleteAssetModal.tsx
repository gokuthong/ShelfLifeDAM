'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
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
  const handleDelete = () => {
    onDelete()
    onClose()
  }

  return (
    <Modal open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Asset</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" gap={4}>
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
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleDelete}>
            Delete Asset
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}