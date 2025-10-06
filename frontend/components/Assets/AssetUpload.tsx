'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Grid,
} from '@chakra-ui/react'
import { Upload, X, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { assetsAPI } from '@/utils/api'

export function AssetUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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
        formData.append('title', file.name)
        formData.append('description', '')
        formData.append('tags', JSON.stringify([]))

        return assetsAPI.create(formData)
      })

      await Promise.all(uploadPromises)

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
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Upload failed. Please try again.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Upload Status */}
      {uploadStatus && (
        <Box
          p={4}
          bg={uploadStatus.type === 'success' ? 'green.50' : 'red.50'}
          border="1px"
          borderColor={uploadStatus.type === 'success' ? 'green.200' : 'red.200'}
          borderRadius="md"
        >
          <Text color={uploadStatus.type === 'success' ? 'green.700' : 'red.700'}>
            {uploadStatus.message}
          </Text>
        </Box>
      )}

      {/* Drop Zone */}
      <Box
        border="2px dashed"
        borderColor="gray.300"
        borderRadius="lg"
        p={10}
        textAlign="center"
        bg="gray.50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
      >
        <VStack gap={4}>
          <Upload size={48} color="gray" />
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Drag and drop files here
            </Text>
            <Text color="gray.600" mb={4}>
              or
            </Text>
            <Button
              as="label"
              colorScheme="blue"
              cursor="pointer"
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
          <Text fontSize="sm" color="gray.500">
            Supported: Images, Videos, PDFs, Documents
          </Text>
        </VStack>
      </Box>

      {/* Selected Files */}
      {files.length > 0 && (
        <Box>
          <Text fontWeight="semibold" mb={3}>
            Selected Files ({files.length})
          </Text>
          <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3}>
            {files.map((file, index) => (
              <Box
                key={index}
                p={3}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                bg="white"
              >
                <HStack justify="space-between">
                  <HStack flex={1} minW={0}>
                    <FileText size={20} color="blue" />
                    <VStack align="start" gap={0} flex={1} minW={0}>
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                        {file.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatFileSize(file.size)}
                      </Text>
                    </VStack>
                  </HStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    colorScheme="red"
                  >
                    <X size={16} />
                  </Button>
                </HStack>
              </Box>
            ))}
          </Grid>

          <HStack mt={6} justify="flex-end" gap={3}>
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Clear All
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpload}
              loading={isUploading}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
            </Button>
          </HStack>
        </Box>
      )}
    </VStack>
  )
}