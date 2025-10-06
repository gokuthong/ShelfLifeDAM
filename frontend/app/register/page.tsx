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
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear field-specific error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!formData.password2) {
      errors.password2 = 'Please confirm your password'
    } else if (formData.password !== formData.password2) {
      errors.password2 = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    // Client-side validation
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      console.log('Submitting registration...')
      await register(formData)
      // Success - will be redirected by the context
    } catch (error: any) {
      console.error('Registration error caught in component:', error)
      setError(error.message || 'Registration failed. Please try again.')

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <VStack gap={6}>
          <Heading size="lg" textAlign="center">
            Create Account
          </Heading>
          <Text color="gray.600" textAlign="center">
            Join ShelfLifeDAM to manage your digital assets
          </Text>

          {error && (
            <Box
              w="full"
              p={4}
              bg="red.50"
              border="1px"
              borderColor="red.200"
              borderRadius="md"
            >
              <Text color="red.700" fontSize="sm">
                {error}
              </Text>
            </Box>
          )}

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack gap={4}>
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
                  borderColor={validationErrors.username ? 'red.300' : 'gray.300'}
                />
                {validationErrors.username && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {validationErrors.username}
                  </Text>
                )}
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
                  borderColor={validationErrors.email ? 'red.300' : 'gray.300'}
                />
                {validationErrors.email && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {validationErrors.email}
                  </Text>
                )}
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

              {/* Role */}
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
                  placeholder="Create a password (min. 8 characters)"
                  required
                  size="lg"
                  borderColor={validationErrors.password ? 'red.300' : 'gray.300'}
                />
                {validationErrors.password && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {validationErrors.password}
                  </Text>
                )}
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
                  borderColor={validationErrors.password2 ? 'red.300' : 'gray.300'}
                />
                {validationErrors.password2 && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {validationErrors.password2}
                  </Text>
                )}
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
                loading={isLoading}
                size="lg"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </VStack>
          </Box>

          <Text textAlign="center">
            Already have an account?{' '}
            <Link asChild color="blue.500">
              <NextLink href="/login">Sign in</NextLink>
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}