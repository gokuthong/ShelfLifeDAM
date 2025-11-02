'use client'

import { useState } from 'react'
import {
  Container,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Link,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useColorMode } from '@/contexts/ColorModeContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuth()
  const router = useRouter()
  const { colorMode } = useColorMode()

  // Dark mode colors
  const cardBg = colorMode === 'dark' ? 'gray.800' : 'white'
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200'
  const textColor = colorMode === 'dark' ? 'gray.300' : 'gray.600'
  const errorBg = colorMode === 'dark' ? 'red.900' : 'red.50'
  const errorBorder = colorMode === 'dark' ? 'red.700' : 'red.200'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(formData)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="md" py={20}>
      <Box
        bg={cardBg}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        border="1px"
        borderColor={borderColor}
      >
        <VStack gap={6}>
          <Heading size="lg" textAlign="center">
            Welcome to ShelfLifeDAM
          </Heading>
          <Text color={textColor} textAlign="center">
            Sign in to your account
          </Text>

          {error && (
            <Box
              w="full"
              p={4}
              bg={errorBg}
              border="1px"
              borderColor={errorBorder}
              borderRadius="md"
            >
              <Text color="red.700" fontSize="sm">
                {error}
              </Text>
            </Box>
          )}

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack gap={4}>
              <Box w="full">
                <Text mb={2} fontWeight="medium">Username</Text>
                <Input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  size="lg"
                />
              </Box>

              <Box w="full">
                <Text mb={2} fontWeight="medium">Password</Text>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  size="lg"
                />
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                loading={isLoading}
                size="lg"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </VStack>
          </Box>

          <Text textAlign="center">
            Don't have an account?{' '}
            <Link asChild color="blue.500">
              <NextLink href="/register">Sign up</NextLink>
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}