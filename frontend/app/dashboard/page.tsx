'use client'

import {
  Box,
  VStack,
  Heading,
  Text,
  Grid,
  Button,
  HStack,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAssets } from '@/hooks/useAssets'
import { Upload, Search, FolderOpen, Activity } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: assetsData } = useAssets({ ordering: '-created_at' })

  const stats = {
    totalAssets: assetsData?.count || 0,
    images: assetsData?.results?.filter(a => a.file_type === 'image').length || 0,
    videos: assetsData?.results?.filter(a => a.file_type === 'video').length || 0,
    documents: assetsData?.results?.filter(a => a.file_type === 'pdf' || a.file_type === 'doc').length || 0,
  }

  return (
    <AppLayout>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {user?.first_name || user?.username}!
          </Heading>
          <Text color="gray.600">
            {user?.is_admin && 'You have full admin access to the system'}
            {user?.is_editor && !user?.is_admin && 'You can upload and manage your assets'}
            {user?.is_viewer && !user?.is_editor && 'Browse and download digital assets'}
          </Text>
        </Box>

        {/* Statistics Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
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
            <Text fontSize="3xl" fontWeight="bold" color="blue.600">
              {stats.totalAssets}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              All files in library
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
            <Text fontSize="3xl" fontWeight="bold" color="purple.600">
              {stats.images}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Photos & graphics
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
              Videos
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="green.600">
              {stats.videos}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Video files
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
              Documents
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="orange.600">
              {stats.documents}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              PDFs & docs
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
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            {(user?.is_editor || user?.is_admin) && (
              <Button
                as={Link}
                href="/upload"
                colorScheme="blue"
                size="lg"
                leftIcon={<Upload size={20} />}
                w="full"
              >
                Upload Assets
              </Button>
            )}

            <Button
              as={Link}
              href="/assets"
              variant="outline"
              colorScheme="blue"
              size="lg"
              leftIcon={<FolderOpen size={20} />}
              w="full"
            >
              Browse Library
            </Button>

            <Button
              as={Link}
              href="/search"
              variant="outline"
              colorScheme="blue"
              size="lg"
              leftIcon={<Search size={20} />}
              w="full"
            >
              Search Assets
            </Button>

            <Button
              as={Link}
              href="/activity"
              variant="outline"
              colorScheme="blue"
              size="lg"
              leftIcon={<Activity size={20} />}
              w="full"
            >
              View Activity
            </Button>
          </Grid>
        </Box>

        {/* Role-specific info */}
        <Box
          bg={user?.is_admin ? 'red.50' : user?.is_editor ? 'blue.50' : 'green.50'}
          border="1px"
          borderColor={user?.is_admin ? 'red.200' : user?.is_editor ? 'blue.200' : 'green.200'}
          p={4}
          borderRadius="md"
        >
          <HStack mb={2}>
            <Text fontWeight="bold">
              Your Role: {user?.role.charAt(0).toUpperCase()}{user?.role.slice(1)}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.700">
            {user?.is_admin && 'As an admin, you have full access to all features including user management, asset control, and system settings.'}
            {user?.is_editor && !user?.is_admin && 'As an editor, you can upload new assets, edit your own content, and collaborate with the team.'}
            {user?.is_viewer && !user?.is_editor && 'As a viewer, you can browse the asset library, search for files, and download content for your projects.'}
          </Text>
        </Box>
      </VStack>
    </AppLayout>
  )
}