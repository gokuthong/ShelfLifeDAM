'use client'

import {
  Box,
  VStack,
  Heading,
  Text,
  Grid,
  Button,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import Link from 'next/link'

export default function DashboardPage() {
  // Mock data for now
  const stats = {
    totalAssets: 0,
    totalSize: 0,
    images: 0,
    videos: 0,
  }

  return (
    <AppLayout>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Dashboard
          </Heading>
          <Text color="gray.600">
            Welcome to your ShelfLifeDAM dashboard
          </Text>
        </Box>

        {/* Statistics Grid */}
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            p={6}
            borderRadius="md"
            boxShadow="sm"
          >
            <Text fontSize="sm" color="gray.600" mb={2}>
              Total Assets
            </Text>
            <Text fontSize="3xl" fontWeight="bold">
              {stats.totalAssets}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              All files
            </Text>
          </Box>

          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            p={6}
            borderRadius="md"
            boxShadow="sm"
          >
            <Text fontSize="sm" color="gray.600" mb={2}>
              Images
            </Text>
            <Text fontSize="3xl" fontWeight="bold">
              {stats.images}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Photos & graphics
            </Text>
          </Box>
        </Grid>

        {/* Quick Actions */}
        <Box
          bg="white"
          border="1px"
          borderColor="gray.200"
          p={6}
          borderRadius="md"
          boxShadow="sm"
        >
          <Heading size="md" mb={4}>Quick Actions</Heading>
          <VStack align="stretch" gap={3}>
            <Button
              as={Link}
              href="/upload"
              colorScheme="blue"
              size="lg"
              w="full"
            >
              Upload Assets
            </Button>

            <Button
              as={Link}
              href="/assets"
              variant="outline"
              size="lg"
              w="full"
            >
              Browse Library
            </Button>
          </VStack>
        </Box>
      </VStack>
    </AppLayout>
  )
}