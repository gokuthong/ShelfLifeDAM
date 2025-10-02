'use client'

import { useCallback, useState } from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  useToast,
  Progress,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { useCreateAsset } from '@/hooks/useAssets'

interface UploadFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export function AssetUpload() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const createAsset = useCreateAsset()
  const toast = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }))
    setFiles(prev => [...prev, ...newFiles])

    // Start uploading files
    newFiles.forEach(uploadFile => {
      handleUpload(uploadFile.file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    formData.append('description', `Uploaded ${new Date().toLocaleDateString()}`)

    setFiles(prev =>
      prev.map(f =>
        f.file === file ? { ...f, status: 'uploading', progress: 0 } : f
      )
    )

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setFiles(prev =>
          prev.map(f =>
            f.file === file
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        )
      }, 200)

      await createAsset.mutateAsync(formData)

      clearInterval(progressInterval)

      setFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'completed', progress: 100 }
            : f
        )
      )

      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded.`,
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      setFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
      )

      toast({
        title: 'Upload failed',
        description: `Failed to upload ${file.name}.`,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove))
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box
        {...getRootProps()}
        border="2px"
        borderColor={isDragActive ? 'blue.300' : 'gray.300'}
        borderStyle="dashed"
        rounded="lg"
        p={8}
        textAlign="center"
        cursor="pointer"
        bg={isDragActive ? 'blue.50' : 'gray.50'}
        transition="all 0.2s"
        _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
      >
        <input {...getInputProps()} />
        <Icon boxSize={12} color="gray.400" mb={4}>
          <path
            fill="currentColor"
            d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
          />
        </Icon>
        <Text fontSize="lg" fontWeight="semibold" mb={2}>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Text>
        <Text fontSize="sm" color="gray.600">
          or click to select files
        </Text>
        <Text fontSize="xs" color="gray.500" mt={2}>
          Maximum file size: 100MB
        </Text>
      </Box>

      {files.length > 0 && (
        <VStack spacing={3} align="stretch">
          <Text fontWeight="semibold">Uploading Files</Text>
          {files.map((uploadFile, index) => (
            <Box
              key={index}
              border="1px"
              borderColor="gray.200"
              rounded="md"
              p={4}
            >
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" noOfLines={1}>
                  {uploadFile.file.name}
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(uploadFile.file)}
                >
                  Remove
                </Button>
              </HStack>

              <Progress
                value={uploadFile.progress}
                colorScheme={
                  uploadFile.status === 'completed' ? 'green' :
                  uploadFile.status === 'error' ? 'red' : 'blue'
                }
                size="sm"
                rounded="full"
              />

              <HStack justify="space-between" mt={2}>
                <Text fontSize="xs" color="gray.600">
                  {uploadFile.status === 'completed' ? 'Completed' :
                   uploadFile.status === 'error' ? 'Failed' :
                   uploadFile.status === 'uploading' ? 'Uploading...' : 'Pending'}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {Math.round(uploadFile.progress)}%
                </Text>
              </HStack>

              {uploadFile.error && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  {uploadFile.error}
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  )
}