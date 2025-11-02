'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Grid,
  Image,
  IconButton,
} from '@chakra-ui/react'
import { Upload, X, FileText, Image as ImageIcon, Video as VideoIcon, File as FileIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { assetsAPI } from '@/utils/api'

interface FileWithPreview extends File {
  preview?: string
}

export function AssetUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const router = useRouter()

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  const addFilesWithPreview = (newFiles: File[]) => {
    const filesWithPreview = newFiles.map(file => {
      const fileWithPreview = file as FileWithPreview
      const fileType = getFileType(file.name)

      // Create preview URL for images and videos
      if (fileType === 'image' || fileType === 'video') {
        fileWithPreview.preview = URL.createObjectURL(file)
      }

      return fileWithPreview
    })

    setFiles(prev => [...prev, ...filesWithPreview])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      addFilesWithPreview(newFiles)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      addFilesWithPreview(newFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const removeFile = (index: number) => {
    // Revoke preview URL before removing
    const file = files[index]
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
      return 'image'
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
      return 'video'
    } else if (ext === 'pdf') {
      return 'pdf'
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return 'doc'
    } else if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
      return 'audio'
    } else if (['obj', 'fbx', 'gltf', 'glb', 'stl', '3ds', 'dae', 'blend'].includes(ext)) {
      return '3d'
    } else {
      return 'other'
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please select files to upload' })
      return
    }

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name.replace(/\.[^/.]+$/, "")) // Remove extension
        formData.append('description', '')
        formData.append('file_type', getFileType(file.name))
        formData.append('tags', JSON.stringify([]))

        console.log('Uploading file:', file.name)
        console.log('Detected file_type:', getFileType(file.name))

        // Use the API method that has the correct endpoint
        return await assetsAPI.create(formData)
      })

      const results = await Promise.all(uploadPromises)
      console.log('Upload success:', results)

      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}!`
      })
      setFiles([])

      // Redirect to assets page after 2 seconds
      setTimeout(() => {
        router.push('/assets')
      }, 2000)
    } catch (error: any) {
      console.error('Upload error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)

      let errorMessage = 'Upload failed. Please try again.'

      if (error.response?.data) {
        const errorData = error.response.data

        // Handle various error formats
        if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.file) {
          errorMessage = Array.isArray(errorData.file) ? errorData.file[0] : errorData.file
        } else if (errorData.title) {
          errorMessage = Array.isArray(errorData.title) ? errorData.title[0] : errorData.title
        } else if (errorData.file_type) {
          errorMessage = Array.isArray(errorData.file_type) ? errorData.file_type[0] : errorData.file_type
        } else {
          // Try to extract first error message
          const firstError = Object.values(errorData)[0]
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0]
          } else if (typeof firstError === 'string') {
            errorMessage = firstError
          }
        }
      }

      setUploadStatus({
        type: 'error',
        message: errorMessage
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <VStack align="stretch" gap={6} h="full">
      {/* Upload Status */}
      {uploadStatus && (
        <Box
          p={4}
          bg={uploadStatus.type === 'success' ? 'green.50' : 'red.50'}
          border="1px"
          borderColor={uploadStatus.type === 'success' ? 'green.200' : 'red.200'}
          borderRadius="xl"
        >
          <Text color={uploadStatus.type === 'success' ? 'green.700' : 'red.700'}>
            {uploadStatus.message}
          </Text>
        </Box>
      )}

      {/* Drop Zone / Preview Area */}
      <Box
        border="3px dashed"
        borderColor={{ base: 'gray.300', _dark: 'gray.600' }}
        borderRadius="xl"
        bg={{ base: 'gray.50', _dark: 'gray.800' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        cursor="pointer"
        transition="all 0.3s"
        _hover={{
          borderColor: 'blue.400',
          bg: { base: 'blue.50', _dark: 'blue.900' },
        }}
        minH="500px"
        boxShadow="lg"
        overflow="hidden"
      >
        {files.length === 0 ? (
          // Empty state - show drop zone
          <Box
            p={16}
            textAlign="center"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="500px"
          >
            <VStack gap={6}>
              <Box
                bg={{ base: 'blue.100', _dark: 'blue.800' }}
                p={8}
                borderRadius="full"
              >
                <Upload size={64} color="var(--chakra-colors-blue-500)" />
              </Box>
              <Box>
                <Text fontSize="2xl" fontWeight="bold" mb={3} color={{ base: 'black', _dark: 'white' }}>
                  Drag and drop files here
                </Text>
                <Text color={{ base: 'gray.600', _dark: 'gray.400' }} mb={6} fontSize="lg">
                  or click the button below to browse
                </Text>
                <Button
                  as="label"
                  colorScheme="blue"
                  cursor="pointer"
                  size="lg"
                  px={8}
                >
                  Browse Files
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    display="none"
                  />
                </Button>
              </Box>
              <Text fontSize="sm" color={{ base: 'gray.500', _dark: 'gray.500' }}>
                Supported: Images, Videos, PDFs, Documents, Audio, 3D Models
              </Text>
            </VStack>
          </Box>
        ) : (
          // Files loaded - show preview
          <Box p={6}>
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="semibold" color={{ base: 'black', _dark: 'white' }}>
                Selected Files ({files.length})
              </Text>
              <Button
                as="label"
                size="sm"
                colorScheme="blue"
                variant="outline"
                cursor="pointer"
              >
                Add More
                <Input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  display="none"
                />
              </Button>
            </HStack>

            <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
              {files.map((file, index) => {
                const fileType = getFileType(file.name)
                return (
                  <Box
                    key={index}
                    border="1px"
                    borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
                    borderRadius="lg"
                    overflow="hidden"
                    bg={{ base: 'white', _dark: 'gray.800' }}
                    position="relative"
                    _hover={{
                      boxShadow: 'lg',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Preview Section */}
                    <Box
                      h="150px"
                      bg={{ base: 'gray.100', _dark: 'gray.700' }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      overflow="hidden"
                    >
                      {fileType === 'image' && file.preview ? (
                        <Image
                          src={file.preview}
                          alt={file.name}
                          objectFit="cover"
                          w="100%"
                          h="100%"
                        />
                      ) : fileType === 'video' && file.preview ? (
                        <video
                          src={file.preview}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box textAlign="center">
                          {fileType === 'image' && <ImageIcon size={40} color="var(--chakra-colors-purple-500)" />}
                          {fileType === 'video' && <VideoIcon size={40} color="var(--chakra-colors-red-500)" />}
                          {!['image', 'video'].includes(fileType) && <FileIcon size={40} color="var(--chakra-colors-blue-500)" />}
                        </Box>
                      )}
                    </Box>

                    {/* Remove Button */}
                    <IconButton
                      position="absolute"
                      top={2}
                      right={2}
                      size="sm"
                      colorScheme="red"
                      onClick={() => removeFile(index)}
                      aria-label="Remove file"
                    >
                      <X size={16} />
                    </IconButton>

                    {/* File Info */}
                    <VStack align="start" p={3} gap={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        noOfLines={1}
                        color={{ base: 'black', _dark: 'white' }}
                        w="100%"
                      >
                        {file.name}
                      </Text>
                      <Text fontSize="xs" color={{ base: 'gray.500', _dark: 'gray.400' }}>
                        {formatFileSize(file.size)}
                      </Text>
                    </VStack>
                  </Box>
                )
              })}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Upload Actions */}
      {files.length > 0 && (
        <HStack justify="flex-end" gap={3}>
          <Button
            variant="outline"
            onClick={() => {
              // Clean up all preview URLs
              files.forEach(file => {
                if (file.preview) {
                  URL.revokeObjectURL(file.preview)
                }
              })
              setFiles([])
            }}
            disabled={isUploading}
          >
            Clear All
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleUpload}
            loading={isUploading}
            disabled={isUploading}
            size="lg"
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
          </Button>
        </HStack>
      )}
    </VStack>
  )
}