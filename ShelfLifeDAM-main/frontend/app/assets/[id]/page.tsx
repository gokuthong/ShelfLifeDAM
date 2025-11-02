'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Box, Spinner, Text, VStack } from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'

const AssetDetailClient = dynamic(
  () => import('@/components/Assets/AssetDetailClient'),
  {
    ssr: false,
    loading: () => (
      <AppLayout>
        <Box display="flex" alignItems="center" justifyContent="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading asset...</Text>
          </VStack>
        </Box>
      </AppLayout>
    ),
  }
)

export default function AssetDetailPage() {
  const params = useParams()
  const assetId = params.id as string

  return <AssetDetailClient assetId={assetId} />
}
