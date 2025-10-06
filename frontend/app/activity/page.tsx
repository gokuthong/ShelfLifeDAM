'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/Layout/AppLayout'
import {
  Box,
  Stack,
  Text,
  Card,
  Badge,
  Table,
  Avatar,
  Button,
  Select,
  Input,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { getActivityLogs } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface ActivityLog {
  id: number
  user: {
    username: string
    email: string
  }
  action: string
  asset_title?: string
  asset_id?: number
  timestamp: string
  details?: any
  ip_address?: string
}

export default function ActivityPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    action: 'all',
    user: '',
    dateFrom: '',
    dateTo: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchActivities()
  }, [page, filter])

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (filter.action !== 'all') params.append('action', filter.action)
      if (filter.user) params.append('user', filter.user)
      if (filter.dateFrom) params.append('date_from', filter.dateFrom)
      if (filter.dateTo) params.append('date_to', filter.dateTo)

      const response = await getActivityLogs(params.toString())
      setActivities(response.data.results || [])
      setTotalPages(Math.ceil(response.data.count / 20))
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload': return '⬆️'
      case 'download': return '⬇️'
      case 'edit': return '✏️'
      case 'delete': return '🗑️'
      case 'view': return '👁️'
      case 'share': return '🔗'
      case 'login': return '🔐'
      case 'logout': return '🚪'
      default: return '📝'
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'upload': return 'green'
      case 'download': return 'blue'
      case 'edit': return 'yellow'
      case 'delete': return 'red'
      case 'view': return 'gray'
      case 'share': return 'purple'
      case 'login': return 'teal'
      case 'logout': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <AppLayout>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Activity Log
          </Text>
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            Track user actions and system events
          </Text>
        </Box>

        {/* Filters */}
        <Card.Root>
          <Card.Body>
            <Stack direction={{ base: "column", md: "row" }} spacing={4}>
              <Box flex={1}>
                <Box
                  as="select"
                  value={filter.action}
                  onChange={(e) => setFilter(prev => ({
                    ...prev,
                    action: (e.target as HTMLSelectElement).value
                  }))}
                  w="full"
                  p={2}
                  border="1px"
                  borderColor={{ base: "gray.300", _dark: "gray.600" }}
                  borderRadius="md"
                  bg={{ base: "white", _dark: "gray.800" }}
                >
                  <option value="all">All Actions</option>
                  <option value="upload">Uploads</option>
                  <option value="download">Downloads</option>
                  <option value="edit">Edits</option>
                  <option value="delete">Deletions</option>
                  <option value="view">Views</option>
                  <option value="share">Shares</option>
                  <option value="login">Logins</option>
                </Box>
              </Box>

              <Box flex={1}>
                <Input
                  placeholder="Filter by username"
                  value={filter.user}
                  onChange={(e) => setFilter(prev => ({
                    ...prev,
                    user: e.target.value
                  }))}
                />
              </Box>

              <Box flex={1}>
                <Input
                  type="date"
                  placeholder="From date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(prev => ({
                    ...prev,
                    dateFrom: e.target.value
                  }))}
                />
              </Box>

              <Box flex={1}>
                <Input
                  type="date"
                  placeholder="To date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(prev => ({
                    ...prev,
                    dateTo: e.target.value
                  }))}
                />
              </Box>

              <Button
                onClick={() => {
                  setFilter({
                    action: 'all',
                    user: '',
                    dateFrom: '',
                    dateTo: '',
                  })
                  setPage(1)
                }}
                variant="outline"
              >
                Clear
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>

        {/* Activity Table */}
        <Card.Root>
          <Card.Body>
            {isLoading ? (
              <Center py={10}>
                <Spinner size="xl" color="blue.500" />
              </Center>
            ) : activities.length === 0 ? (
              <Center py={10}>
                <Stack spacing={3} align="center">
                  <Text fontSize="4xl">📝</Text>
                  <Text fontSize="lg" fontWeight="medium">
                    No activity found
                  </Text>
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    Activities will appear here as users interact with the system
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Box overflowX="auto">
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>User</Table.ColumnHeader>
                      <Table.ColumnHeader>Action</Table.ColumnHeader>
                      <Table.ColumnHeader>Asset</Table.ColumnHeader>
                      <Table.ColumnHeader>Timestamp</Table.ColumnHeader>
                      {user?.is_admin && (
                        <Table.ColumnHeader>IP Address</Table.ColumnHeader>
                      )}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {activities.map((activity) => (
                      <Table.Row key={activity.id}>
                        <Table.Cell>
                          <Stack direction="row" align="center" spacing={2}>
                            <Avatar
                              size="sm"
                              name={activity.user.username}
                            />
                            <Box>
                              <Text fontWeight="medium">
                                {activity.user.username}
                              </Text>
                              <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }}>
                                {activity.user.email}
                              </Text>
                            </Box>
                          </Stack>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorScheme={getActionBadgeColor(activity.action)}>
                            {getActionIcon(activity.action)} {activity.action}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          {activity.asset_title ? (
                            <Text>{activity.asset_title}</Text>
                          ) : (
                            <Text color={{ base: "gray.400", _dark: "gray.500" }}>-</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="sm">
                            {format(new Date(activity.timestamp), 'MMM d, yyyy HH:mm')}
                          </Text>
                        </Table.Cell>
                        {user?.is_admin && (
                          <Table.Cell>
                            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                              {activity.ip_address || '-'}
                            </Text>
                          </Table.Cell>
                        )}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Stack direction="row" justify="center" align="center" mt={4} spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>

                    <Text fontSize="sm">
                      Page {page} of {totalPages}
                    </Text>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </Stack>
                )}
              </Box>
            )}
          </Card.Body>
        </Card.Root>
      </Stack>
    </AppLayout>
  )
}