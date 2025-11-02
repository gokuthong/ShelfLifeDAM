'use client'

import { Box, Text, IconButton } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { BabylonViewer } from './BabylonViewer'

interface BabylonViewerModalProps {
  isOpen: boolean
  onClose: () => void
  assetUrl: string
  fileName: string
}

export function BabylonViewerModal({ isOpen, onClose, assetUrl, fileName }: BabylonViewerModalProps) {
  if (!isOpen) return null

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.85)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
      onClick={onClose}
      p={4}
    >
      <Box
        position="relative"
        width="90vw"
        maxW="1200px"
        height="80vh"
        bg="gray.900"
        borderRadius="lg"
        overflow="hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <IconButton
          position="absolute"
          top={4}
          right={4}
          zIndex={10}
          onClick={onClose}
          bg="rgba(0, 0, 0, 0.7)"
          color="white"
          _hover={{ bg: 'rgba(0, 0, 0, 0.9)' }}
          size="lg"
        >
          <X size={24} />
        </IconButton>

        {/* Title */}
        <Box
          position="absolute"
          top={4}
          left={4}
          zIndex={10}
          bg="rgba(0, 0, 0, 0.7)"
          px={4}
          py={2}
          borderRadius="md"
        >
          <Text color="white" fontWeight="semibold">
            {fileName}
          </Text>
        </Box>

        {/* 3D Viewer */}
        <Box width="100%" height="100%">
          <BabylonViewer assetUrl={assetUrl} fileName={fileName} />
        </Box>
      </Box>
    </Box>
  )
}
