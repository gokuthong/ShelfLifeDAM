'use client'

import {
  Box,
  VStack,
  Heading,
  Text,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import Link from 'next/link'

export default function DashboardPage() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Mock data for now
  const stats = {
    totalAssets: 0,
    totalSize: 0,
    images: 0,
    videos: 0,
  }

  return (
    <AppLayout>
      <VStack align="stretch" spacing={6}>
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
          <GridItem>
            <Box
              bg={bgColor}
              border="1px"
              borderColor={borderColor}
              p={4}
              borderRadius="md"
            >
              <Stat>
                <StatLabel>Total Assets</StatLabel>
                <StatNumber>{stats.totalAssets}</StatNumber>
                <StatHelpText>All files</StatHelpText>
              </Stat>
            </Box>
          </GridItem>

          <GridItem>
            <Box
              bg={bgColor}
              border="1px"
              borderColor={borderColor}
              p={4}
              borderRadius="md"
            >
              <Stat>
                <StatLabel>Images</StatLabel>
                <StatNumber>{stats.images}</StatNumber>
                <StatHelpText>Photos & graphics</StatHelpText>
              </Stat>
            </Box>
          </GridItem>
        </Grid>

        {/* Quick Actions */}
        <Box
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          p={6}
          borderRadius="md"
        >
          <Heading size="md" mb={4}>Quick Actions</Heading>
          <VStack align="stretch" spacing={3}>
            <Button
              as={Link}
              href="/upload"
              colorScheme="blue"
              size="lg"
            >
              Upload Assets
            </Button>

            <Button
              as={Link}
              href="/assets"
              variant="outline"
              size="lg"
            >
              Browse Library
            </Button>
          </VStack>
        </Box>
      </VStack>
    </AppLayout>
  )
}