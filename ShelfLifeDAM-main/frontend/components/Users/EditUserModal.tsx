'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Badge,
} from '@chakra-ui/react'
import { X } from 'lucide-react'
import { authAPI } from '@/utils/api'

interface EditUserModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role: user.role || 'viewer',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      await authAPI.updateUser(user.id, formData)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={onClose}
    >
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="xl"
        minW="400px"
        maxW="500px"
        onClick={(e) => e.stopPropagation()}
      >
        <HStack justify="space-between" mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            Edit User
          </Text>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </HStack>

        {error && (
          <Box
            p={3}
            mb={4}
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

        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            <Box>
              <Text mb={2} fontWeight="medium" fontSize="sm">Username</Text>
              <Input
                value={user.username}
                disabled
                bg="gray.100"
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium" fontSize="sm">Email</Text>
              <Input
                value={user.email}
                disabled
                bg="gray.100"
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium" fontSize="sm">First Name</Text>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Enter first name"
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium" fontSize="sm">Last Name</Text>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Enter last name"
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium" fontSize="sm">Role</Text>
              <Box
                as="select"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                w="full"
                p={2}
                border="1px"
                borderColor="gray.300"
                borderRadius="md"
                bg="white"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </Box>
              <Text fontSize="xs" color="gray.600" mt={1}>
                Admin: Full access | Editor: Can upload & manage | Viewer: Read-only
              </Text>
            </Box>

            <HStack gap={3} pt={4}>
              <Button
                type="submit"
                colorScheme="blue"
                flex={1}
                loading={isSaving}
                disabled={isSaving}
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                flex={1}
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  )
}
