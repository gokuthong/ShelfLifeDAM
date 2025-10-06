'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Box, Text } from '@chakra-ui/react'

interface RoleGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({ allowedRoles, children, redirectTo = '/dashboard' }: RoleGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      router.push(redirectTo)
    }
  }, [user, isLoading, allowedRoles, redirectTo, router])

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading...</Text>
      </Box>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500" fontSize="lg" mb={2}>
          Access Denied
        </Text>
        <Text color="gray.600">
          You don't have permission to access this page.
        </Text>
      </Box>
    )
  }

  return <>{children}</>
}