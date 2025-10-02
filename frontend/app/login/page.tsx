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
import { useRouter } from 'next/navigation'

const showToast = (options: {
  title: string
  description?: string
  status: 'success' | 'error' | 'warning' | 'info'
}) => {
  if (options.status === 'error') {
    alert(`Error: ${options.title}${options.description ? ` - ${options.description}` : ''}`)
  } else if (options.status === 'success') {
    alert(`Success: ${options.title}`)
  } else {
    alert(`${options.title}${options.description ? ` - ${options.description}` : ''}`)
  }
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData)
      showToast({
        title: 'Login successful',
        status: 'success',
      })
      router.push('/dashboard')
    } catch (error: any) {
      showToast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="md" py={20}>
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        border="1px"
        borderColor="gray.200"
      >
        <VStack spacing={6}>
          <Heading size="lg" textAlign="center">
            Welcome to ShelfLifeDAM
          </Heading>
          <Text color="gray.600" textAlign="center">
            Sign in to your account
          </Text>

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack spacing={4}>
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
                isLoading={isLoading}
                loadingText="Signing in..."
                size="lg"
              >
                Sign In
              </Button>
            </VStack>
          </Box>

          <Text textAlign="center">
            Don't have an account?{' '}
            <Link as={NextLink} href="/register" color="blue.500">
              Sign up
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}