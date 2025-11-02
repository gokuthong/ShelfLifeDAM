'use client'

import { Box, VStack, HStack, Text, Heading, Badge } from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { RoleGuard } from '@/components/Auth/RoleGuard'
import { Upload, Download, Edit, Trash2, Eye, Share } from 'lucide-react'
import { useQuery } from 'react-query'
import { activityAPI } from '@/utils/api'
import { formatDate } from '@/utils/format'

export default function ActivityPage() {
  const { data: activitiesData, isLoading } = useQuery(
    'activityLogs',
    () => activityAPI.getLogs(),
    {
      staleTime: 30000, // 30 seconds
    }
  )

  const activities = activitiesData?.results || []

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'upload': return Upload
      case 'download': return Download
      case 'edit': return Edit
      case 'delete': return Trash2
      case 'view': return Eye
      case 'share': return Share
      default: return Upload
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'upload': return 'blue'
      case 'download': return 'green'
      case 'edit': return 'orange'
      case 'delete': return 'red'
      case 'view': return 'gray'
      case 'share': return 'purple'
      default: return 'gray'
    }
  }

  const formatActivityDetails = (action: string, details: any): string | null => {
    if (!details || Object.keys(details).length === 0) {
      return null
    }

    // Format details based on action type
    switch (action) {
      case 'edit':
        const changes = []
        if (details.old_title !== details.new_title && details.new_title) {
          changes.push(`Title changed to "${details.new_title}"`)
        }
        if (details.description_changed) {
          changes.push('Description updated')
        }
        if (details.tags_changed) {
          changes.push('Tags updated')
        }
        if (details.fields_changed) {
          changes.push('Metadata updated')
        }
        return changes.length > 0 ? changes.join(', ') : null

      case 'download':
        if (details.file_size) {
          return `Downloaded (${details.file_size})`
        }
        return null

      case 'share':
        if (details.shared_with) {
          return `Shared with ${details.shared_with}`
        }
        return null

      case 'upload':
        if (details.file_size) {
          return `File size: ${details.file_size}`
        }
        return null

      default:
        // For unknown details structure, don't show anything
        return null
    }
  }

  return (
    <AppLayout>
      <RoleGuard allowedRoles={['admin', 'editor']}>
        <Box maxW="1600px" mx="auto" w="full">
          <VStack align="stretch" gap={6} minH="calc(100vh - 200px)">
          {/* Header */}
          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            border="1px"
            borderColor="gray.200"
            boxShadow="md"
          >
            <Heading size="lg" mb={2}>
              Activity Log
            </Heading>
            <Text fontSize="md" color="gray.600">
              Track all actions and changes made to your digital assets
            </Text>
          </Box>

        {/* Activity List Container */}
        <Box
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="xl"
          boxShadow="lg"
          p={6}
          minH="600px"
        >
          {isLoading ? (
            <VStack gap={3}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Box
                  key={i}
                  height="100px"
                  bg="gray.100"
                  rounded="lg"
                  w="full"
                />
              ))}
            </VStack>
          ) : activities.length > 0 ? (
            <VStack align="stretch" gap={3}>
            {activities.map((activity: any) => {
              const Icon = getActionIcon(activity.action)
              const color = getActionColor(activity.action)

              return (
                <Box
                  key={activity.log_id}
                  p={5}
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="lg"
                  transition="all 0.2s"
                  _hover={{
                    boxShadow: 'md',
                    borderColor: 'blue.300',
                    bg: 'white',
                    transform: 'translateX(4px)'
                  }}
                >
                  <HStack justify="space-between">
                    <HStack gap={4} flex={1}>
                      <Box
                        p={2}
                        bg={`${color}.50`}
                        borderRadius="md"
                      >
                        <Icon size={20} color={color} />
                      </Box>

                      <VStack align="start" gap={1} flex={1}>
                        <HStack>
                          <Text fontWeight="semibold">{activity.user?.username || 'Unknown'}</Text>
                          <Badge colorScheme={color} textTransform="capitalize">
                            {activity.action}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {activity.asset?.title || 'Asset'}
                        </Text>
                        {(() => {
                          const formattedDetails = formatActivityDetails(activity.action, activity.details)
                          return formattedDetails ? (
                            <Text fontSize="xs" color="gray.500">
                              {formattedDetails}
                            </Text>
                          ) : null
                        })()}
                      </VStack>
                    </HStack>

                    <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                      {formatDate(activity.timestamp)}
                    </Text>
                  </HStack>
                </Box>
              )
            })}
            </VStack>
          ) : (
            <Box textAlign="center" py={20}>
              <VStack gap={4}>
                <Text fontSize="6xl">📊</Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  No activity yet
                </Text>
                <Text fontSize="md" color="gray.600" maxW="400px">
                  Activity will appear here as you and your team work with assets
                </Text>
              </VStack>
            </Box>
          )}
        </Box>
          </VStack>
        </Box>
      </RoleGuard>
    </AppLayout>
  )
}