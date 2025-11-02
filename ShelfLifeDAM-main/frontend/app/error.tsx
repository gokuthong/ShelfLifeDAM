'use client'

import { useEffect } from 'react'
import { Box, Button, Text, VStack } from '@chakra-ui/react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bg="gray.50"
    >
      <VStack gap={4} p={8} bg="white" rounded="lg" boxShadow="lg" maxW="md">
        <Text fontSize="2xl" fontWeight="bold" color="red.600">
          Something went wrong!
        </Text>
        <Text color="gray.600" textAlign="center">
          {error.message || 'An unexpected error occurred'}
        </Text>
        <Button colorScheme="blue" onClick={reset}>
          Try again
        </Button>
      </VStack>
    </Box>
  )
}
