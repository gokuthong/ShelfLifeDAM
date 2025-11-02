'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Badge,
  Grid,
  IconButton,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { RoleGuard } from '@/components/Auth/RoleGuard'
import { EditUserModal } from '@/components/Users/EditUserModal'
import { useAuth } from '@/contexts/AuthContext'
import { Edit, Trash2, Search, Shield, Users, UserCog, Eye, Mail, Calendar } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { authAPI } from '@/utils/api'

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const queryClient = useQueryClient()

  // Fetch users
  const { data: users, isLoading, error } = useQuery(
    'users',
    async () => {
      try {
        const response = await authAPI.getAllUsers()
        return response
      } catch (err: any) {
        console.error('Error fetching users:', err)
        console.error('Error response:', err.response?.data)
        throw err
      }
    },
    {
      retry: 1,
      onError: (err: any) => {
        console.error('Query error:', err)
      }
    }
  )

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (userId: number) => authAPI.deleteUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
      },
      onError: (error: any) => {
        alert(error.response?.data?.error || 'Failed to delete user')
      }
    }
  )

  const handleDeleteUser = async (user: any) => {
    if (confirm(`Are you sure you want to delete ${user.username}? This action cannot be undone.`)) {
      try {
        await deleteUserMutation.mutateAsync(user.id)
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red'
      case 'editor': return 'blue'
      case 'viewer': return 'green'
      default: return 'gray'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield
      case 'editor': return UserCog
      case 'viewer': return Eye
      default: return Users
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (username: string, firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return username.substring(0, 2).toUpperCase()
  }

  const filteredUsers = users?.filter((user: any) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <AppLayout>
      <RoleGuard allowedRoles={['admin']}>
        <Box maxW="1600px" mx="auto" w="full">
          <VStack align="stretch" gap={8}>
          {/* Header with Gradient */}
          <Box
            bgGradient="linear(to-br, purple.500, blue.500)"
            borderRadius="xl"
            p={8}
            color="black"
            boxShadow="xl"
          >
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={2}>
                <Heading size="lg">
                  User Management
                </Heading>
                <Text fontSize="md">
                  Manage user accounts, roles, and permissions across your organization
                </Text>
              </VStack>
              <Box
                bg="whiteAlpha.300"
                backdropFilter="blur(10px)"
                p={4}
                borderRadius="lg"
                textAlign="center"
              >
                <Text fontSize="3xl" fontWeight="bold">
                  {users?.length || 0}
                </Text>
                <Text fontSize="sm">
                  Total Users
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Error Message */}
          {error && (
            <Box
              p={4}
              bg="red.50"
              border="1px"
              borderColor="red.200"
              borderRadius="md"
            >
              <Text color="red.700" fontWeight="semibold" mb={2}>
                Error Loading Users
              </Text>
              <Text color="red.600" fontSize="sm">
                {(error as any).response?.data?.detail ||
                 'Failed to load users. Make sure you have admin permissions.'}
              </Text>
            </Box>
          )}

          {/* Search Bar */}
          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            border="1px"
            borderColor="gray.100"
          >
            <HStack gap={4}>
              <Box
                flex={1}
                position="relative"
              >
                <Box
                  position="absolute"
                  left={4}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={1}
                >
                  <Search size={20} color="#9ca3af" />
                </Box>
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="lg"
                  pl={12}
                  borderRadius="lg"
                  border="2px"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: 'purple.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)'
                  }}
                />
              </Box>
              {searchTerm && (
                <Button
                  size="lg"
                  variant="outline"
                  colorPalette="gray"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </Button>
              )}
            </HStack>
          </Box>

          {/* Stats Cards */}
          {!error && (
            <Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={6}>
              <Box
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                border="1px"
                borderColor="gray.100"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
              >
                <HStack justify="space-between" mb={3}>
                  <Box
                    bg="purple.50"
                    p={3}
                    borderRadius="lg"
                  >
                    <Users size={24} color="#9333ea" />
                  </Box>
                  <Badge colorScheme="purple" fontSize="xs">All</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600" mb={1}>Total Users</Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                  {users?.length || 0}
                </Text>
              </Box>

              <Box
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                border="1px"
                borderColor="gray.100"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
              >
                <HStack justify="space-between" mb={3}>
                  <Box
                    bg="red.50"
                    p={3}
                    borderRadius="lg"
                  >
                    <Shield size={24} color="#dc2626" />
                  </Box>
                  <Badge colorScheme="red" fontSize="xs">Admin</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600" mb={1}>Administrators</Text>
                <Text fontSize="3xl" fontWeight="bold" color="red.600">
                  {users?.filter((u: any) => u.role === 'admin').length || 0}
                </Text>
              </Box>

              <Box
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                border="1px"
                borderColor="gray.100"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
              >
                <HStack justify="space-between" mb={3}>
                  <Box
                    bg="blue.50"
                    p={3}
                    borderRadius="lg"
                  >
                    <UserCog size={24} color="#2563eb" />
                  </Box>
                  <Badge colorScheme="blue" fontSize="xs">Editor</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600" mb={1}>Editors</Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                  {users?.filter((u: any) => u.role === 'editor').length || 0}
                </Text>
              </Box>

              <Box
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                border="1px"
                borderColor="gray.100"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
              >
                <HStack justify="space-between" mb={3}>
                  <Box
                    bg="green.50"
                    p={3}
                    borderRadius="lg"
                  >
                    <Eye size={24} color="#16a34a" />
                  </Box>
                  <Badge colorScheme="green" fontSize="xs">Viewer</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600" mb={1}>Viewers</Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                  {users?.filter((u: any) => u.role === 'viewer').length || 0}
                </Text>
              </Box>
            </Grid>
          )}

          {/* Users Grid */}
          {isLoading ? (
            <Box textAlign="center" py={20}>
              <VStack gap={4}>
                <Box
                  w="16"
                  h="16"
                  border="4px"
                  borderColor="purple.500"
                  borderTopColor="transparent"
                  borderRadius="full"
                  animation="spin 1s linear infinite"
                />
                <Text fontSize="lg" color="gray.600">Loading users...</Text>
              </VStack>
            </Box>
          ) : error ? (
            <Box
              textAlign="center"
              py={20}
              bg="white"
              borderRadius="xl"
              boxShadow="lg"
            >
              <VStack gap={4}>
                <Box
                  bg="red.50"
                  p={6}
                  borderRadius="full"
                >
                  <Shield size={48} color="#dc2626" />
                </Box>
                <Text fontSize="2xl" fontWeight="bold" color="red.600">
                  Access Denied
                </Text>
                <Text color="gray.600" maxW="md">
                  You need admin permissions to view users. Please contact your administrator.
                </Text>
              </VStack>
            </Box>
          ) : filteredUsers.length > 0 ? (
            <Grid
              templateColumns="repeat(auto-fill, minmax(350px, 1fr))"
              gap={6}
            >
              {filteredUsers.map((user: any) => {
                const RoleIcon = getRoleIcon(user.role)
                return (
                  <Box
                    key={user.id}
                    bg="white"
                    borderRadius="xl"
                    boxShadow="lg"
                    border="1px"
                    borderColor="gray.100"
                    overflow="hidden"
                    transition="all 0.3s"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: '2xl',
                      borderColor: 'purple.200'
                    }}
                  >
                    {/* Card Header with Role Color */}
                    <Box
                      h="3"
                      bgGradient={
                        user.role === 'admin'
                          ? 'linear(to-r, red.500, red.400)'
                          : user.role === 'editor'
                          ? 'linear(to-r, blue.500, blue.400)'
                          : 'linear(to-r, green.500, green.400)'
                      }
                    />

                    <VStack align="stretch" p={6} gap={4}>
                      {/* User Info */}
                      <HStack gap={4}>
                        <Box position="relative">
                          <Box
                            w="60px"
                            h="60px"
                            borderRadius="full"
                            bg={
                              user.role === 'admin'
                                ? 'red.500'
                                : user.role === 'editor'
                                ? 'blue.500'
                                : 'green.500'
                            }
                            color="white"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xl"
                            fontWeight="bold"
                          >
                            {getInitials(user.username, user.first_name, user.last_name)}
                          </Box>
                        </Box>

                        <VStack align="start" gap={1} flex={1}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold" fontSize="lg">
                              {user.username}
                            </Text>
                            {currentUser?.id === user.id && (
                              <Badge colorScheme="purple" fontSize="xs">
                                You
                              </Badge>
                            )}
                          </HStack>
                          {(user.first_name || user.last_name) && (
                            <Text fontSize="sm" color="gray.600">
                              {user.first_name} {user.last_name}
                            </Text>
                          )}
                        </VStack>
                      </HStack>

                      {/* Email */}
                      <HStack
                        bg="gray.50"
                        p={3}
                        borderRadius="lg"
                        gap={2}
                      >
                        <Mail size={16} color="#6b7280" />
                        <Text fontSize="sm" color="gray.700" noOfLines={1}>
                          {user.email}
                        </Text>
                      </HStack>

                      {/* Role Badge */}
                      <HStack justify="space-between">
                        <HStack
                          bg={
                            user.role === 'admin'
                              ? 'red.50'
                              : user.role === 'editor'
                              ? 'blue.50'
                              : 'green.50'
                          }
                          px={3}
                          py={2}
                          borderRadius="lg"
                          gap={2}
                        >
                          <RoleIcon
                            size={16}
                            color={
                              user.role === 'admin'
                                ? '#dc2626'
                                : user.role === 'editor'
                                ? '#2563eb'
                                : '#16a34a'
                            }
                          />
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                              user.role === 'admin'
                                ? 'red.700'
                                : user.role === 'editor'
                                ? 'blue.700'
                                : 'green.700'
                            }
                            textTransform="capitalize"
                          >
                            {user.role}
                          </Text>
                        </HStack>

                        {/* Join Date */}
                        <HStack gap={1}>
                          <Calendar size={14} color="#6b7280" />
                          <Text fontSize="xs" color="gray.600">
                            {formatDate(user.date_joined)}
                          </Text>
                        </HStack>
                      </HStack>

                      {/* Actions */}
                      <HStack
                        pt={2}
                        borderTop="1px"
                        borderColor="gray.100"
                        gap={2}
                      >
                        <Button
                          flex={1}
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                          leftIcon={<Edit size={16} />}
                        >
                          Edit
                        </Button>
                        {currentUser?.id !== user.id && (
                          <IconButton
                            size="sm"
                            colorPalette="red"
                            variant="outline"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deleteUserMutation.isLoading}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                )
              })}
            </Grid>
          ) : (
            <Box
              textAlign="center"
              py={20}
              bg="white"
              borderRadius="xl"
              boxShadow="lg"
            >
              <VStack gap={4}>
                <Box
                  bg="gray.50"
                  p={6}
                  borderRadius="full"
                >
                  <Users size={48} color="#6b7280" />
                </Box>
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  No users found
                </Text>
                <Text color="gray.600" maxW="md">
                  {searchTerm
                    ? 'Try adjusting your search terms or filters'
                    : 'Get started by adding users to your organization'}
                </Text>
              </VStack>
            </Box>
          )}
          </VStack>
        </Box>

        {/* Edit User Modal */}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            onSuccess={() => {
              queryClient.invalidateQueries('users')
              setEditingUser(null)
            }}
          />
        )}
      </RoleGuard>
    </AppLayout>
  )
}