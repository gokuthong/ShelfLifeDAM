'use client'

import { useState, useRef } from 'react'
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
import { User, Mail, Shield, Calendar, Camera } from 'lucide-react'
import { authAPI } from '@/utils/api'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' })
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      if (avatarFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('avatar', avatarFile)
        formDataToSend.append('first_name', formData.first_name)
        formDataToSend.append('last_name', formData.last_name)
        formDataToSend.append('profile_info', formData.profile_info)
        await authAPI.updateProfile(formDataToSend)
      } else {
        await updateProfile(formData)
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
      window.location.reload() // Reload to show new avatar
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
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
    setAvatarFile(null)
    setAvatarPreview(null)
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

            {/* Avatar Section */}
            <VStack gap={4} mb={6}>
              <Box position="relative">
                <Box
                  width="120px"
                  height="120px"
                  borderRadius="full"
                  overflow="hidden"
                  bg="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {(avatarPreview || user.avatar_url) ? (
                    <img
                      src={avatarPreview || user.avatar_url}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={48} color="gray" />
                  )}
                </Box>
                {isEditing && (
                  <Button
                    position="absolute"
                    bottom="0"
                    right="0"
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={16} />
                  </Button>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  display="none"
                />
              </Box>
              {isEditing && (
                <Text fontSize="sm" color="gray.600">
                  Click camera icon to upload avatar (max 5MB)
                </Text>
              )}
            </VStack>

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
                {user.role === 'admin' && (
                  <>
                    <Text>✓ Full system access</Text>
                    <Text>✓ User management</Text>
                    <Text>✓ Upload & manage all assets</Text>
                    <Text>✓ Delete any assets</Text>
                  </>
                )}
                {user.role === 'editor' && (
                  <>
                    <Text>✓ Upload assets</Text>
                    <Text>✓ Edit own assets</Text>
                    <Text>✓ Download assets</Text>
                    <Text>✗ User management</Text>
                  </>
                )}
                {user.role === 'viewer' && (
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
