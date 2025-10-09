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
import { UserPlus, Edit, Trash2, Search, Shield } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { authAPI } from '@/utils/api'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
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
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredUsers = users?.filter((user: any) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <AppLayout>
      <RoleGuard allowedRoles={['admin']}>
        <VStack align="stretch" gap={6}>
          <Box>
            <Heading size="lg" mb={2}>
              User Management
            </Heading>
            <Text color="gray.600">
              Manage user accounts, roles, and permissions
            </Text>
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

          {/* Search and Actions */}
          <HStack justify="space-between">
            <HStack flex={1} maxW="500px">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
              />
              <IconButton aria-label="Search" size="lg">
                <Search size={20} />
              </IconButton>
            </HStack>

            <Button
              colorScheme="blue"
              leftIcon={<UserPlus size={20} />}
              size="lg"
            >
              Add User
            </Button>
          </HStack>

          {/* Stats */}
          {!error && (
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <Box
                bg="white"
                p={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
              >
                <Text fontSize="sm" color="gray.600" mb={1}>Total Users</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {users?.length || 0}
                </Text>
              </Box>

              <Box
                bg="white"
                p={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
              >
                <Text fontSize="sm" color="gray.600" mb={1}>Admins</Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.600">
                  {users?.filter((u: any) => u.role === 'admin').length || 0}
                </Text>
              </Box>

              <Box
                bg="white"
                p={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
              >
                <Text fontSize="sm" color="gray.600" mb={1}>Editors</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {users?.filter((u: any) => u.role === 'editor').length || 0}
                </Text>
              </Box>

              <Box
                bg="white"
                p={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
              >
                <Text fontSize="sm" color="gray.600" mb={1}>Viewers</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {users?.filter((u: any) => u.role === 'viewer').length || 0}
                </Text>
              </Box>
            </Grid>
          )}

          {/* Users Table */}
          {isLoading ? (
            <Box textAlign="center" py={10}>
              <Text>Loading users...</Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={10}>
              <Shield size={48} color="red" style={{ margin: '0 auto 16px' }} />
              <Text fontSize="lg" color="red.500" mb={2}>
                Access Denied
              </Text>
              <Text color="gray.600">
                You need admin permissions to view users
              </Text>
            </Box>
          ) : filteredUsers.length > 0 ? (
            <Box
              bg="white"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              overflow="hidden"
            >
              {/* Table Header */}
              <Box
                bg="gray.50"
                p={4}
                borderBottom="1px"
                borderColor="gray.200"
              >
                <Grid
                  templateColumns="2fr 2fr 1fr 1.5fr 100px"
                  gap={4}
                  alignItems="center"
                >
                  <Text fontWeight="semibold" fontSize="sm">Username</Text>
                  <Text fontWeight="semibold" fontSize="sm">Email</Text>
                  <Text fontWeight="semibold" fontSize="sm">Role</Text>
                  <Text fontWeight="semibold" fontSize="sm">Joined</Text>
                  <Text fontWeight="semibold" fontSize="sm">Actions</Text>
                </Grid>
              </Box>

              {/* Table Body */}
              <VStack align="stretch" gap={0}>
                {filteredUsers.map((user: any) => (
                  <Box
                    key={user.id}
                    p={4}
                    borderBottom="1px"
                    borderColor="gray.100"
                    _hover={{ bg: 'gray.50' }}
                    transition="all 0.2s"
                  >
                    <Grid
                      templateColumns="2fr 2fr 1fr 1.5fr 100px"
                      gap={4}
                      alignItems="center"
                    >
                      <VStack align="start" gap={0}>
                        <Text fontWeight="medium">{user.username}</Text>
                        {(user.first_name || user.last_name) && (
                          <Text fontSize="sm" color="gray.600">
                            {user.first_name} {user.last_name}
                          </Text>
                        )}
                      </VStack>

                      <Text fontSize="sm" color="gray.600">{user.email}</Text>

                      <Badge
                        colorScheme={getRoleBadgeColor(user.role)}
                        textTransform="capitalize"
                      >
                        {user.role}
                      </Badge>

                      <Text fontSize="sm" color="gray.600">
                        {formatDate(user.date_joined)}
                      </Text>

                      <HStack gap={1}>
                        <IconButton
                          aria-label="Edit user"
                          size="sm"
                          variant="ghost"
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton
                          aria-label="Delete user"
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </HStack>
                    </Grid>
                  </Box>
                ))}
              </VStack>
            </Box>
          ) : (
            <Box textAlign="center" py={10}>
              <Shield size={48} color="gray" style={{ margin: '0 auto 16px' }} />
              <Text fontSize="lg" color="gray.500" mb={2}>
                No users found
              </Text>
              <Text color="gray.600">
                {searchTerm ? 'Try a different search term' : 'Add users to get started'}
              </Text>
            </Box>
          )}
        </VStack>
      </RoleGuard>
    </AppLayout>
  )
}