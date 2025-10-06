'use client'

import { Box, VStack, Heading, Text } from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { AssetUpload } from '@/components/Assets/AssetUpload'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UploadPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && !user.is_editor && !user.is_admin) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <AppLayout>
        <Box textAlign="center" py={10}>
          <Text>Loading...</Text>
        </Box>
      </AppLayout>
    )
  }

  if (!user?.is_editor && !user?.is_admin) {
    return (
      <AppLayout>
        <Box textAlign="center" py={10}>
          <Text color="red.500">Access Denied. Editor or Admin role required.</Text>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
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
    </AppLayout>
  )
}