'use client'

import { Box, VStack, HStack, Heading, Text, Grid } from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { AssetUpload } from '@/components/Assets/AssetUpload'
import { RoleGuard } from '@/components/Auth/RoleGuard'
import { Upload, Image, Video, FileText, Music, Box as BoxIcon, File } from 'lucide-react'

export default function UploadPage() {
  const supportedFormats = [
    {
      icon: Image,
      title: 'Images',
      formats: 'JPG, PNG, GIF, BMP, WebP, SVG',
      color: 'purple'
    },
    {
      icon: Video,
      title: 'Videos',
      formats: 'MP4, AVI, MOV, WMV, FLV, MKV',
      color: 'red'
    },
    {
      icon: FileText,
      title: 'Documents',
      formats: 'PDF, DOC, DOCX, TXT, RTF',
      color: 'blue'
    },
    {
      icon: Music,
      title: 'Audio',
      formats: 'MP3, WAV, OGG, FLAC',
      color: 'green'
    },
    {
      icon: BoxIcon,
      title: '3D Models',
      formats: 'OBJ, FBX, GLTF, GLB, STL',
      color: 'orange'
    },
    {
      icon: File,
      title: 'Other Files',
      formats: 'Any other file types',
      color: 'gray'
    }
  ]

  return (
    <AppLayout>
      <RoleGuard allowedRoles={['admin', 'editor']}>
        <Box maxW="1600px" mx="auto" w="full">
          <VStack align="stretch" gap={8}>
          {/* Header with Gradient */}
          <Box
            bgGradient={{ base: 'linear(to-br, blue.100, purple.100)', _dark: 'linear(to-br, blue.500, purple.500)' }}
            borderRadius="xl"
            p={8}
            boxShadow="xl"
          >
            <VStack align="start" gap={2}>
              <Heading size="lg" color={{ base: 'black', _dark: 'white' }}>
                Upload Assets
              </Heading>
              <Text fontSize="md" color={{ base: 'gray.600', _dark: 'whiteAlpha.900' }}>
                Upload and manage your digital assets in one place. Supports multiple file types and batch uploads.
              </Text>
            </VStack>
          </Box>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 400px' }} gap={8}>
            {/* Main Upload Area */}
            <Box>
              <AssetUpload />
            </Box>

            {/* Sidebar with Info */}
            <VStack align="stretch" gap={6}>
              {/* Supported Formats Card */}
              <Box
                bg={{ base: 'white', _dark: 'gray.800' }}
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                border="1px"
                borderColor={{ base: 'gray.100', _dark: 'gray.700' }}
                h="full"
              >
                <Heading size="md" mb={4} color={{ base: 'black', _dark: 'white' }}>
                  Supported Formats
                </Heading>
                <VStack align="stretch" gap={4}>
                  {supportedFormats.map((format, index) => {
                    const Icon = format.icon
                    return (
                      <Box
                        key={index}
                        p={4}
                        bg={{ base: 'gray.50', _dark: 'gray.700' }}
                        borderRadius="lg"
                        transition="all 0.2s"
                        _hover={{
                          bg: { base: `${format.color}.50`, _dark: `${format.color}.900` },
                          transform: 'translateX(4px)'
                        }}
                      >
                        <HStack gap={3} mb={2}>
                          <Box
                            bg={{ base: `${format.color}.100`, _dark: `${format.color}.800` }}
                            p={2}
                            borderRadius="md"
                          >
                            <Icon size={20} color={`var(--chakra-colors-${format.color}-${format.color === 'gray' ? '500' : '400'})`} />
                          </Box>
                          <Text fontWeight="semibold" fontSize="sm" color={{ base: 'black', _dark: 'white' }}>
                            {format.title}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color={{ base: 'gray.600', _dark: 'gray.400' }} ml={12}>
                          {format.formats}
                        </Text>
                      </Box>
                    )
                  })}
                </VStack>
              </Box>
            </VStack>
          </Grid>
          </VStack>
        </Box>
      </RoleGuard>
    </AppLayout>
  )
}