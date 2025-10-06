'use client'

import { Box, VStack, Heading, Text } from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { AssetUpload } from '@/components/Assets/AssetUpload'
import { RoleGuard } from '@/components/Auth/RoleGuard'

export default function UploadPage() {
  return (
    <AppLayout>
      <RoleGuard allowedRoles={['admin', 'editor']}>
        <VStack align="stretch" gap={6}>
          <Box>
            <Heading size="lg" mb={2}>
              Upload Assets
            </Heading>
            <Text color="gray.600">
              Upload images, videos, documents, and other digital assets
            </Text>
          </Box>

          <AssetUpload />
        </VStack>
      </RoleGuard>
    </AppLayout>
  )
}