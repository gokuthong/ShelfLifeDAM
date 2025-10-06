'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/Layout/AppLayout'
import {
  Box,
  Stack,
  Text,
  Card,
  Avatar,
  Button,
  Input,
  Textarea,
  Badge,
  SimpleGrid,
  Divider,
  StatCard,
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile, getUserStats } from '@/services/api'
import { format } from 'date-fns'

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

interface UserStats {
  total_uploads: number
  total_downloads: number
  storage_used: number
  recent_activity: number
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    total_uploads: 0,
    total_downloads: 0,
    storage_used: 0,
    recent_activity: 0,
  })
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    profile_info: user?.profile_info || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        profile_info: user.profile_info || '',
      })
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      const response = await getUserStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateUserProfile(formData)
      await updateUser() // Refresh user context
      showToast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
        status: 'success',
      })
      setIsEditing(false)
    } catch (error: any) {
      showToast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red'
      case 'editor': return 'yellow'
      case 'viewer': return 'blue'
      default: return 'gray'
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <Box>Loading profile...</Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            My Profile
          </Text>
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            Manage your personal information and settings
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Profile Info Card */}
          <Box gridColumn={{ base: "1", lg: "span 2" }}>
            <Card.Root>
              <Card.Header>
                <Stack direction="row" justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="bold">
                    Profile Information
                  </Text>
                  <Button
                    size="sm"
                    variant={isEditing ? "outline" : "solid"}
                    onClick={() => {
                      if (isEditing) {
                        // Cancel editing
                        setFormData({
                          first_name: user.first_name || '',
                          last_name: user.last_name || '',
                          email: user.email || '',
                          profile_info: user.profile_info || '',
                        })
                      }
                      setIsEditing(!isEditing)
                    }}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Stack>
              </Card.Header>
              <Card.Body>
                <Stack spacing={4}>
                  <Stack direction="row" align="center" spacing={4}>
                    <Avatar
                      size="xl"
                      name={`${user.first_name} ${user.last_name}`}
                    />
                    <Box>
                      <Text fontSize="xl" fontWeight="bold">
                        {user.username}
                      </Text>
                      <Badge colorScheme={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </Box>
                  </Stack>

                  <Divider />

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontWeight="medium" mb={2}>First Name</Text>
                      {isEditing ? (
                        <Input
                          value={formData.first_name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            first_name: e.target.value
                          }))}
                        />
                      ) : (
                        <Text color={{ base: "gray.700", _dark: "gray.300" }}>
                          {user.first_name || '-'}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontWeight="medium" mb={2}>Last Name</Text>
                      {isEditing ? (
                        <Input
                          value={formData.last_name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            last_name: e.target.value
                          }))}
                        />
                      ) : (
                        <Text color={{ base: "gray.700", _dark: "gray.300" }}>
                          {user.last_name || '-'}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontWeight="medium" mb={2}>Email</Text>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            email: e.target.value
                          }))}
                        />
                      ) : (
                        <Text color={{ base: "gray.700", _dark: "gray.300" }}>
                          {user.email}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontWeight="medium" mb={2}>Member Since</Text>
                      <Text color={{ base: "gray.700", _dark: "gray.300" }}>
                        {format(new Date(user.date_joined), 'MMMM d, yyyy')}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Text fontWeight="medium" mb={2}>Bio / Additional Info</Text>
                    {isEditing ? (
                      <Textarea
                        value={formData.profile_info}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          profile_info: e.target.value
                        }))}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <Text color={{ base: "gray.700", _dark: "gray.300" }}>
                        {user.profile_info || 'No bio provided'}
                      </Text>
                    )}
                  </Box>

                  {isEditing && (
                    <Button
                      colorScheme="blue"
                      onClick={handleSave}
                      loading={isLoading}
                      width="full"
                    >
                      Save Changes
                    </Button>
                  )}
                </Stack>
              </Card.Body>
            </Card.Root>
          </Box>

          {/* Stats Card */}
          <Box>
            <Card.Root height="fit-content">
              <Card.Header>
                <Text fontSize="lg" fontWeight="bold">
                  Activity Statistics
                </Text>
              </Card.Header>
              <Card.Body>
                <Stack spacing={4}>
                  <Box>
                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                      Total Uploads
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stats.total_uploads}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                      Total Downloads
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stats.total_downloads}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                      Storage Used
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {formatStorageSize(stats.storage_used)}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                      Recent Activities
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stats.recent_activity}
                    </Text>
                    <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
                      Last 30 days
                    </Text>
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Box>
        </SimpleGrid>

        {/* Security Settings */}
        <Card.Root>
          <Card.Header>
            <Text fontSize="lg" fontWeight="bold">
              Security Settings
            </Text>
          </Card.Header>
          <Card.Body>
            <Stack spacing={4}>
              <Box>
                <Button variant="outline" colorScheme="blue">
                  Change Password
                </Button>
              </Box>
              <Box>
                <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                  Last login: {user.last_login ? format(new Date(user.last_login), 'MMMM d, yyyy HH:mm') : 'Never'}
                </Text>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </AppLayout>
  )
}