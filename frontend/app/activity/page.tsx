'use client'

import { Box, VStack, HStack, Text, Heading, Badge } from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { Upload, Download, Edit, Trash2, Eye } from 'lucide-react'
import { useAssets } from '@/hooks/useAssets'
import { formatDate } from '@/utils/format'

export default function ActivityPage() {
  const { data: assetsData, isLoading } = useAssets({ ordering: '-created_at' })

  // Mock activity data - in a real app, this would come from an activity log API
  const getActivities = () => {
    if (!assetsData?.results) return []

    return assetsData.results.slice(0, 20).map(asset => ({
      id: asset.asset_id,
      type: 'upload',
      user: asset.user.username,
      asset: asset.title,
      timestamp: asset.created_at,
      icon: Upload,
      color: 'blue',
    }))
  }

  const activities = getActivities()

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'upload': return Upload
      case 'download': return Download
      case 'edit': return Edit
      case 'delete': return Trash2
      case 'view': return Eye
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
      default: return 'gray'
    }
  }

  return (
    <AppLayout>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Activity Log
          </Heading>
          <Text color="gray.600">
            Track all actions and changes made to your digital assets
          </Text>
        </Box>

        {isLoading ? (
          <VStack gap={3}>
            {[1, 2, 3, 4, 5].map(i => (
              <Box
                key={i}
                height="80px"
                bg="gray.100"
                rounded="md"
                w="full"
              />
            ))}
          </VStack>
        ) : activities.length > 0 ? (
          <VStack align="stretch" gap={3}>
            {activities.map((activity) => {
              const Icon = getActionIcon(activity.type)
              const color = getActionColor(activity.type)

              return (
                <Box
                  key={activity.id}
                  p={4}
                  bg="white"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  transition="all 0.2s"
                  _hover={{ boxShadow: 'sm', borderColor: 'blue.300' }}
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
                          <Text fontWeight="semibold">{activity.user}</Text>
                          <Badge colorScheme={color} textTransform="capitalize">
                            {activity.type}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {activity.asset}
                        </Text>
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
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.500" mb={2}>
              No activity yet
            </Text>
            <Text color="gray.600">
              Activity will appear here as you and your team work with assets
            </Text>
          </Box>
        )}
      </VStack>
    </AppLayout>
  )
}