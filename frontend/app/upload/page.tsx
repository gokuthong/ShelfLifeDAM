'use client'

import { AppLayout } from '@/components/Layout/AppLayout'
import { AssetUpload } from '@/components/Assets/AssetUpload'
import {
  Box,
  VStack,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'

export default function UploadPage() {
  const { user } = useAuth()

  if (!user?.is_admin && !user?.is_editor) {
    return (
      <AppLayout>
        <Alert status="error">
          <AlertIcon />
          You don't have permission to upload assets. Please contact an administrator.
        </Alert>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Upload Assets
          </Text>
          <Text color="gray.600">
            Upload images, videos, documents, and other digital assets
          </Text>
        </Box>

        <AssetUpload />
      </VStack>
    </AppLayout>
  )
}