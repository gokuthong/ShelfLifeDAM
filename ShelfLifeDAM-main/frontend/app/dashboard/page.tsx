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
import { useColorMode } from '@/contexts/ColorModeContext'
import { useAssets } from '@/hooks/useAssets'
import { Upload, Search, FolderOpen, Activity } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { colorMode } = useColorMode()
  const { data: assetsData } = useAssets({ ordering: '-created_at' })

  // Dark mode colors
  const cardBg = colorMode === 'dark' ? 'gray.800' : 'white'
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200'
  const textColor = colorMode === 'dark' ? 'gray.300' : 'gray.600'
  const secondaryTextColor = colorMode === 'dark' ? 'gray.400' : 'gray.500'
  const headingColor = colorMode === 'dark' ? 'white' : 'gray.700'

  // Role-specific colors
  const roleBgAdmin = colorMode === 'dark' ? 'red.900' : 'red.50'
  const roleBorderAdmin = colorMode === 'dark' ? 'red.700' : 'red.200'
  const roleBgEditor = colorMode === 'dark' ? 'blue.900' : 'blue.50'
  const roleBorderEditor = colorMode === 'dark' ? 'blue.700' : 'blue.200'
  const roleBgViewer = colorMode === 'dark' ? 'green.900' : 'green.50'
  const roleBorderViewer = colorMode === 'dark' ? 'green.700' : 'green.200'

  // Feature card colors
  const featureRedBg = colorMode === 'dark' ? 'red.900' : 'red.50'
  const featureRedBorder = colorMode === 'dark' ? 'red.700' : 'red.200'
  const featureBlueBg = colorMode === 'dark' ? 'blue.900' : 'blue.50'
  const featureBlueBorder = colorMode === 'dark' ? 'blue.700' : 'blue.200'
  const featurePurpleBg = colorMode === 'dark' ? 'purple.900' : 'purple.50'
  const featurePurpleBorder = colorMode === 'dark' ? 'purple.700' : 'purple.200'
  const featureGreenBg = colorMode === 'dark' ? 'green.900' : 'green.50'
  const featureGreenBorder = colorMode === 'dark' ? 'green.700' : 'green.200'
  const featureOrangeBg = colorMode === 'dark' ? 'orange.900' : 'orange.50'
  const featureOrangeBorder = colorMode === 'dark' ? 'orange.700' : 'orange.200'
  const featureTealBg = colorMode === 'dark' ? 'teal.900' : 'teal.50'
  const featureTealBorder = colorMode === 'dark' ? 'teal.700' : 'teal.200'
  const featurePinkBg = colorMode === 'dark' ? 'pink.900' : 'pink.50'
  const featurePinkBorder = colorMode === 'dark' ? 'pink.700' : 'pink.200'
  const featureCyanBg = colorMode === 'dark' ? 'cyan.900' : 'cyan.50'
  const featureCyanBorder = colorMode === 'dark' ? 'cyan.700' : 'cyan.200'

  const stats = {
    totalAssets: assetsData?.count || 0,
    images: assetsData?.results?.filter(a => a.file_type === 'image').length || 0,
    videos: assetsData?.results?.filter(a => a.file_type === 'video').length || 0,
    documents: assetsData?.results?.filter(a => a.file_type === 'pdf' || a.file_type === 'doc').length || 0,
  }

  return (
    <AppLayout>
      <Box maxW="1600px" mx="auto" w="full">
        <VStack align="stretch" gap={6} minH="calc(100vh - 200px)">
        {/* Welcome Header */}
        <Box
          bg={cardBg}
          p={8}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
          boxShadow="md"
        >
          <Heading size="lg" mb={2}>
            Welcome back, {user?.first_name || user?.username}!
          </Heading>
          <Text fontSize="md" color={textColor}>
            {user?.is_admin && 'You have full admin access to the system'}
            {user?.is_editor && !user?.is_admin && 'You can upload and manage your assets'}
            {user?.is_viewer && !user?.is_editor && 'Browse and view digital assets'}
          </Text>
        </Box>

        {/* Statistics Grid */}
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          <Box
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            h="full"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
          >
            <Text fontSize="sm" color={textColor} mb={3} fontWeight="medium">
              Total Assets
            </Text>
            <Text fontSize="4xl" fontWeight="bold" color="blue.600" mb={2}>
              {stats.totalAssets}
            </Text>
            <Text fontSize="sm" color={secondaryTextColor}>
              All files in library
            </Text>
          </Box>

          <Box
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            h="full"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
          >
            <Text fontSize="sm" color={textColor} mb={3} fontWeight="medium">
              Images
            </Text>
            <Text fontSize="4xl" fontWeight="bold" color="purple.600" mb={2}>
              {stats.images}
            </Text>
            <Text fontSize="sm" color={secondaryTextColor}>
              Photos & graphics
            </Text>
          </Box>

          <Box
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            h="full"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
          >
            <Text fontSize="sm" color={textColor} mb={3} fontWeight="medium">
              Videos
            </Text>
            <Text fontSize="4xl" fontWeight="bold" color="green.600" mb={2}>
              {stats.videos}
            </Text>
            <Text fontSize="sm" color={secondaryTextColor}>
              Video files
            </Text>
          </Box>

          <Box
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            h="full"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
          >
            <Text fontSize="sm" color={textColor} mb={3} fontWeight="medium">
              Documents
            </Text>
            <Text fontSize="4xl" fontWeight="bold" color="orange.600" mb={2}>
              {stats.documents}
            </Text>
            <Text fontSize="sm" color={secondaryTextColor}>
              PDFs & docs
            </Text>
          </Box>
        </Grid>

        {/* Quick Actions */}
        <Box
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
          p={8}
          borderRadius="xl"
          boxShadow="lg"
        >
          <Heading size="md" mb={6}>Quick Actions</Heading>
          <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
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

            {(user?.is_editor || user?.is_admin) && (
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
            )}
          </Grid>
        </Box>

        {/* Role-specific info */}
        <Box
          bg={user?.is_admin ? roleBgAdmin : user?.is_editor ? roleBgEditor : roleBgViewer}
          border="1px"
          borderColor={user?.is_admin ? roleBorderAdmin : user?.is_editor ? roleBorderEditor : roleBorderViewer}
          p={8}
          borderRadius="xl"
          boxShadow="md"
        >
          <HStack mb={3}>
            <Text fontWeight="bold" fontSize="lg">
              Your Role: {user?.role.charAt(0).toUpperCase()}{user?.role.slice(1)}
            </Text>
          </HStack>
          <Text fontSize="md" color={headingColor} lineHeight="tall">
            {user?.is_admin && 'As an admin, you have full access to all features including user management, asset control, and system settings.'}
            {user?.is_editor && !user?.is_admin && 'As an editor, you can upload new assets, edit your own content, download assets, and collaborate with the team.'}
            {user?.is_viewer && !user?.is_editor && 'As a viewer, you can browse and search the asset library, view asset details, and leave comments on assets.'}
          </Text>
        </Box>

        {/* Admin-specific features info */}
        {user?.is_admin && (
          <Box
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
          >
            <Heading size="md" mb={4}>What You Can Do</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
              <Box
                p={4}
                bg={featureRedBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureRedBorder}
              >
                <Text fontWeight="semibold" mb={2} color="red.900">
                  ✓ User Management
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Create, edit, and manage user accounts and permissions
                </Text>
              </Box>
              <Box
                p={4}
                bg={featureBlueBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureBlueBorder}
              >
                <Text fontWeight="semibold" mb={2} color="blue.900">
                  ✓ Full Asset Control
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Upload, edit, delete, and download all assets
                </Text>
              </Box>
              <Box
                p={4}
                bg={featurePurpleBg}
                borderRadius="lg"
                border="1px"
                borderColor={featurePurpleBorder}
              >
                <Text fontWeight="semibold" mb={2} color="purple.900">
                  ✓ Activity Monitoring
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  View all system activity and track changes
                </Text>
              </Box>
              <Box
                p={4}
                bg={featureGreenBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureGreenBorder}
              >
                <Text fontWeight="semibold" mb={2} color="green.900">
                  ✓ Search & Browse
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Access all assets with advanced search capabilities
                </Text>
              </Box>
              <Box
                p={4}
                bg={featureOrangeBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureOrangeBorder}
              >
                <Text fontWeight="semibold" mb={2} color="orange.900">
                  ✓ Comments & Collaboration
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Add, edit, and manage comments on any asset
                </Text>
              </Box>
              <Box
                p={4}
                bg={featureTealBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureTealBorder}
              >
                <Text fontWeight="semibold" mb={2} color="teal.900">
                  ✓ System Configuration
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Configure system settings and preferences
                </Text>
              </Box>
            </Grid>
          </Box>
        )}

        {/* Editor-specific features info */}
        {user?.is_editor && !user?.is_admin && (
          <Box
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
          >
            <Heading size="md" mb={4}>What You Can Do</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
              <Box
                p={4}
                bg={featureBlueBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureBlueBorder}
              >
                <Text fontWeight="semibold" mb={2} color="blue.900">
                  ✓ Upload Assets
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Add new digital assets to the library
                </Text>
              </Box>
              <Box
                p={4}
                bg={featurePurpleBg}
                borderRadius="lg"
                border="1px"
                borderColor={featurePurpleBorder}
              >
                <Text fontWeight="semibold" mb={2} color="purple.900">
                  ✓ Edit Your Assets
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Modify metadata, tags, and details of your uploads
                </Text>
              </Box>
              <Box
                p={4}
                bg={featureGreenBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureGreenBorder}
              >
                <Text fontWeight="semibold" mb={2} color="green.900">
                  ✓ Download Assets
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Download any asset for use in your projects
                </Text>
              </Box>
              <Box
                p={4}
                bg={featureOrangeBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureOrangeBorder}
              >
                <Text fontWeight="semibold" mb={2} color="orange.900">
                  ✓ Search & Browse
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Access the full library with advanced filters
                </Text>
              </Box>
              <Box
                p={4}
                bg={featurePinkBg}
                borderRadius="lg"
                border="1px"
                borderColor={featurePinkBorder}
              >
                <Text fontWeight="semibold" mb={2} color="pink.900">
                  ✓ Activity Log
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Track changes and activities on your assets
                </Text>
              </Box>
              <Box
                p={4}
                bg={featureCyanBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureCyanBorder}
              >
                <Text fontWeight="semibold" mb={2} color="cyan.900">
                  ✓ Add Comments
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Collaborate by leaving feedback on assets
                </Text>
              </Box>
            </Grid>
          </Box>
        )}

        {/* Viewer-specific features info */}
        {user?.is_viewer && !user?.is_editor && !user?.is_admin && (
          <Box
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
          >
            <Heading size="md" mb={4}>What You Can Do</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <Box
                p={4}
                bg={featureBlueBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureBlueBorder}
              >
                <Text fontWeight="semibold" mb={2} color="blue.900">
                  ✓ Browse & Search
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Access the full asset library and use advanced search filters
                </Text>
              </Box>
              <Box
                p={4}
                bg={featurePurpleBg}
                borderRadius="lg"
                border="1px"
                borderColor={featurePurpleBorder}
              >
                <Text fontWeight="semibold" mb={2} color="purple.900">
                  ✓ View Details
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  See full metadata, tags, and version information
                </Text>
              </Box>
              <Box
                p={4}
                bg={featureOrangeBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureOrangeBorder}
              >
                <Text fontWeight="semibold" mb={2} color="orange.900">
                  ✓ Add Comments
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  Collaborate by leaving feedback and comments on assets
                </Text>
              </Box>
              <Box
                p={4}
                bg={featureGreenBg}
                borderRadius="lg"
                border="1px"
                borderColor={featureGreenBorder}
              >
                <Text fontWeight="semibold" mb={2} color="green.900">
                  ✓ Preview Assets
                </Text>
                <Text fontSize="sm" color={headingColor}>
                  View images, videos, and 3D models in the browser
                </Text>
              </Box>
            </Grid>
          </Box>
        )}
        </VStack>
      </Box>
    </AppLayout>
  )
}