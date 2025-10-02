'use client'

import {
  Box,
  VStack,
  Link,
  Text,
  Icon,
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
      <VStack align="stretch" spacing={2}>
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              as={NextLink}
              key={item.href}
              href={item.href}
              display="flex"
              alignItems="center"
              px={3}
              py={2}
              rounded="md"
              bg={isActive ? 'blue.50' : 'transparent'}
              color={isActive ? 'blue.700' : 'gray.700'}
              border={isActive ? '1px' : 'none'}
              borderColor="blue.200"
              _hover={{
                bg: 'blue.50',
                color: 'blue.700',
                textDecoration: 'none',
              }}
            >
              <Text mr={3}>{item.icon}</Text>
              <Text fontWeight={isActive ? 'semibold' : 'normal'}>
                {item.label}
              </Text>
            </Link>
          )
        })}
      </VStack>
    </Box>
  )
}