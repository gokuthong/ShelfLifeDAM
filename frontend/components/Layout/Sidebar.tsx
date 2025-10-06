'use client'

import {
  Box,
  VStack,
  Link,
  Text,
  Flex,
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'editor', 'viewer'] },
  { href: '/assets', label: 'Asset Library', icon: '📁', roles: ['admin', 'editor', 'viewer'] },
  { href: '/upload', label: 'Upload', icon: '⬆️', roles: ['admin', 'editor'] },
  { href: '/search', label: 'Search', icon: '🔍', roles: ['admin', 'editor', 'viewer'] },
  { href: '/activity', label: 'Activity', icon: '📝', roles: ['admin', 'editor', 'viewer'] },
  { href: '/users', label: 'User Management', icon: '👥', roles: ['admin'] },
]

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || 'viewer')
  )

  return (
    <Box
      as="nav"
      w={64}
      bg="gray.50"
      borderRight="1px"
      borderColor="gray.200"
      minH="calc(100vh - 64px)"
      p={4}
    >
      <VStack align="stretch" gap={2}>
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              asChild
              key={item.href}
            >
              <NextLink
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: isActive ? '#EBF8FF' : 'transparent',
                  color: isActive ? '#2C5282' : '#4A5568',
                  border: isActive ? '1px solid #90CDF4' : 'none',
                  textDecoration: 'none',
                }}
              >
                <Text mr={3}>{item.icon}</Text>
                <Text fontWeight={isActive ? 'semibold' : 'normal'}>
                  {item.label}
                </Text>
              </NextLink>
            </Link>
          )
        })}
      </VStack>
    </Box>
  )
}