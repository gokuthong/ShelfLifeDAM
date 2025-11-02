'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  IconButton,
} from '@chakra-ui/react'
import { MessageCircle, Trash2, Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useColorMode } from '@/contexts/ColorModeContext'
import { activityAPI } from '@/utils/api'
import { Comment } from '@/types'
import { formatDate } from '@/utils/format'

interface AssetCommentsProps {
  assetId: string
}

export function AssetComments({ assetId }: AssetCommentsProps) {
  const { user } = useAuth()
  const { colorMode } = useColorMode()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dark mode colors
  const boxBg = colorMode === 'dark' ? 'gray.800' : 'white'
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200'
  const commentBg = colorMode === 'dark' ? 'gray.700' : 'gray.50'
  const textColor = colorMode === 'dark' ? 'gray.300' : 'gray.700'
  const headingColor = colorMode === 'dark' ? 'white' : 'gray.900'
  const secondaryTextColor = colorMode === 'dark' ? 'gray.400' : 'gray.500'

  useEffect(() => {
    fetchComments()
  }, [assetId])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const data = await activityAPI.getComments(assetId)
      setComments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)
      await activityAPI.createComment(assetId, newComment)
      setNewComment('')
      await fetchComments() // Refresh comments
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      await activityAPI.deleteComment(commentId)
      await fetchComments() // Refresh comments
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const canDeleteComment = (comment: Comment) => {
    return user?.is_admin || user?.is_editor || comment.user.id === user?.id
  }

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={5}
      bg={boxBg}
    >
      <HStack mb={4}>
        <MessageCircle size={20} />
        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
          Comments ({comments.length})
        </Text>
      </HStack>

      {/* Comment List */}
      <VStack align="stretch" gap={3} mb={4}>
        {isLoading ? (
          <Text fontSize="sm" color={secondaryTextColor}>Loading comments...</Text>
        ) : comments.length === 0 ? (
          <Text fontSize="sm" color={secondaryTextColor}>No comments yet. Be the first to comment!</Text>
        ) : (
          comments.map((comment) => (
            <Box
              key={comment.comment_id}
              p={3}
              bg={commentBg}
              borderRadius="md"
              border="1px"
              borderColor={borderColor}
            >
              <HStack justify="space-between" align="start" mb={2}>
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="semibold" color={headingColor}>
                    {comment.user.username}
                  </Text>
                  <Text fontSize="xs" color={secondaryTextColor}>
                    {formatDate(comment.created_at)}
                  </Text>
                </VStack>
                {canDeleteComment(comment) && (
                  <IconButton
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDelete(comment.comment_id)}
                    aria-label="Delete comment"
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </HStack>
              <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">
                {comment.content}
              </Text>
            </Box>
          ))
        )}
      </VStack>

      {/* New Comment Form */}
      <Box>
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          size="sm"
          rows={3}
          mb={2}
          resize="vertical"
        />
        <HStack justify="flex-end">
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!newComment.trim()}
          >
            <Send size={16} style={{ marginRight: '8px' }} />
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </HStack>
      </Box>
    </Box>
  )
}
