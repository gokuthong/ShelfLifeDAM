'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Badge,
  Grid,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { useAuth } from '@/contexts/AuthContext'
import { User, Mail, Shield, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    profile_info: user?.profile_info || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      await updateProfile(formData)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update profile'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      profile_info: user?.profile_info || '',
    })
    setIsEditing(false)
    setMessage(null)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red'
      case 'editor': return 'blue'
      case 'viewer': return 'green'
      default: return 'gray'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <AppLayout>
        <Box textAlign="center" py={10}>
          <Text>Loading...</Text>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Profile
          </Heading>
          <Text color="gray.600">
            Manage your account information and preferences
          </Text>
        </Box>

        {message && (
          <Box
            p={4}
            bg={message.type === 'success' ? 'green.50' : 'red.50'}
            border="1px"
            borderColor={message.type === 'success' ? 'green.200' : 'red.200'}
            borderRadius="md"
          >
            <Text color={message.type === 'success' ? 'green.700' : 'red.700'}>
              {message.text}
            </Text>
          </Box>
        )}

        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
          {/* Main Profile Info */}
          <Box
            bg="white"
            p={6}
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
          >
            <Heading size="md" mb={6}>
              Personal Information
            </Heading>

            {isEditing ? (
              <Box as="form" onSubmit={handleSubmit}>
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text mb={2} fontWeight="medium">First Name</Text>
                    <Input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="medium">Last Name</Text>
                    <Input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="medium">Bio</Text>
                    <Box
                      as="textarea"
                      name="profile_info"
                      value={formData.profile_info}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      w="full"
                      p={3}
                      border="1px"
                      borderColor="gray.300"
                      borderRadius="md"
                      minH="120px"
                      resize="vertical"
                    />
                  </Box>

                  <HStack gap={3} pt={4}>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      loading={isSaving}
                      disabled={isSaving}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            ) : (
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Username</Text>
                  <HStack>
                    <User size={18} color="gray" />
                    <Text fontWeight="medium">{user.username}</Text>
                  </HStack>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Email</Text>
                  <HStack>
                    <Mail size={18} color="gray" />
                    <Text fontWeight="medium">{user.email}</Text>
                  </HStack>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>First Name</Text>
                  <Text fontWeight="medium">
                    {user.first_name || 'Not set'}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Last Name</Text>
                  <Text fontWeight="medium">
                    {user.last_name || 'Not set'}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Bio</Text>
                  <Text>
                    {user.profile_info || 'No bio added yet'}
                  </Text>
                </Box>

                <Button
                  colorScheme="blue"
                  onClick={() => setIsEditing(true)}
                  mt={4}
                >
                  Edit Profile
                </Button>
              </VStack>
            )}
          </Box>

          {/* Account Details Sidebar */}
          <VStack gap={4} align="stretch">
            <Box
              bg="white"
              p={6}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
            >
              <Heading size="sm" mb={4}>
                Account Details
              </Heading>

              <VStack gap={4} align="stretch">
                <Box>
                  <HStack mb={2}>
                    <Shield size={18} color="gray" />
                    <Text fontSize="sm" fontWeight="medium">Role</Text>
                  </HStack>
                  <Badge
                    colorScheme={getRoleBadgeColor(user.role)}
                    fontSize="sm"
                    px={3}
                    py={1}
                    textTransform="capitalize"
                  >
                    {user.role}
                  </Badge>
                </Box>

                <Box>
                  <HStack mb={2}>
                    <Calendar size={18} color="gray" />
                    <Text fontSize="sm" fontWeight="medium">Member Since</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(user.date_joined)}
                  </Text>
                </Box>

                {user.last_login && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Last Login
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(user.last_login)}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>

            <Box
              bg="blue.50"
              p={4}
              border="1px"
              borderColor="blue.200"
              borderRadius="md"
            >
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Role Permissions
              </Text>
              <VStack align="start" gap={1} fontSize="sm" color="gray.700">
                {user.is_admin && (
                  <>
                    <Text>✓ Full system access</Text>
                    <Text>✓ User management</Text>
                    <Text>✓ Upload & manage all assets</Text>
                    <Text>✓ Delete any assets</Text>
                  </>
                )}
                {user.is_editor && !user.is_admin && (
                  <>
                    <Text>✓ Upload assets</Text>
                    <Text>✓ Edit own assets</Text>
                    <Text>✓ Download assets</Text>
                    <Text>✗ User management</Text>
                  </>
                )}
                {user.is_viewer && !user.is_editor && !user.is_admin && (
                  <>
                    <Text>✓ Browse assets</Text>
                    <Text>✓ Download assets</Text>
                    <Text>✗ Upload assets</Text>
                    <Text>✗ User management</Text>
                  </>
                )}
              </VStack>
            </Box>
          </VStack>
        </Grid>
      </VStack>
    </AppLayout>
  )
}