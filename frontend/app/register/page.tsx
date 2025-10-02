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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'viewer',
    first_name: '',
    last_name: '',
    profile_info: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Check if passwords match
    if (formData.password !== formData.password2) {
      showToast({
        title: 'Registration failed',
        description: 'Passwords do not match',
        status: 'error',
      })
      setIsLoading(false)
      return
    }

    try {
      await register(formData)
      showToast({
        title: 'Registration successful',
        description: 'You can now log in with your credentials',
        status: 'success',
      })
      router.push('/login')
    } catch (error: any) {
      showToast({
        title: 'Registration failed',
        description: error.message,
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="md" py={10}>
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
            Create Account
          </Heading>
          <Text color="gray.600" textAlign="center">
            Join ShelfLifeDAM to manage your digital assets
          </Text>

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack spacing={4}>
              {/* Username */}
              <Box w="full">
                <Text mb={2} fontWeight="medium">Username *</Text>
                <Input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  size="lg"
                />
              </Box>

              {/* Email */}
              <Box w="full">
                <Text mb={2} fontWeight="medium">Email *</Text>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  size="lg"
                />
              </Box>

              {/* First Name */}
              <Box w="full">
                <Text mb={2} fontWeight="medium">First Name</Text>
                <Input
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  size="lg"
                />
              </Box>

              {/* Last Name */}
              <Box w="full">
                <Text mb={2} fontWeight="medium">Last Name</Text>
                <Input
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  size="lg"
                />
              </Box>

              {/* Role - Using HTML select instead of Chakra UI Select */}
              <Box w="full">
                <Text mb={2} fontWeight="medium">Role *</Text>
                <Box
                  as="select"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  w="full"
                  p={3}
                  border="1px"
                  borderColor="gray.300"
                  borderRadius="md"
                  fontSize="md"
                  bg="white"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </Box>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Viewer: Can browse and download assets<br/>
                  Editor: Can upload and manage assets<br/>
                  Admin: Full system access
                </Text>
              </Box>

              {/* Password */}
              <Box w="full">
                <Text mb={2} fontWeight="medium">Password *</Text>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  size="lg"
                />
              </Box>

              {/* Confirm Password */}
              <Box w="full">
                <Text mb={2} fontWeight="medium">Confirm Password *</Text>
                <Input
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  size="lg"
                />
              </Box>

              {/* Profile Info */}
              <Box w="full">
                <Text mb={2} fontWeight="medium">Profile Information</Text>
                <Box
                  as="textarea"
                  name="profile_info"
                  value={formData.profile_info}
                  onChange={handleChange}
                  placeholder="Tell us about yourself (optional)"
                  w="full"
                  p={3}
                  border="1px"
                  borderColor="gray.300"
                  borderRadius="md"
                  minH="80px"
                  resize="vertical"
                  fontSize="md"
                />
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                isLoading={isLoading}
                loadingText="Creating account..."
                size="lg"
              >
                Create Account
              </Button>
            </VStack>
          </Box>

          <Text textAlign="center">
            Already have an account?{' '}
            <Link as={NextLink} href="/login" color="blue.500">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}