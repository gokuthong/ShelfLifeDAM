'use client'

import {
  Box,
  VStack,
  Link,
  Text,
  Flex,
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'
import { useColorMode } from '@/contexts/ColorModeContext'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  Search,
  Activity,
  Users
} from 'lucide-react'

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'editor', 'viewer']
  },
  {
    href: '/assets',
    label: 'Asset Library',
    icon: FolderOpen,
    roles: ['admin', 'editor', 'viewer']
  },
  {
    href: '/upload',
    label: 'Upload',
    icon: Upload,
    roles: ['admin', 'editor']
  },
  {
    href: '/search',
    label: 'Search',
    icon: Search,
    roles: ['admin', 'editor', 'viewer']
  },
  {
    href: '/activity',
    label: 'Activity',
    icon: Activity,
    roles: ['admin', 'editor']
  },
  {
    href: '/users',
    label: 'User Management',
    icon: Users,
    roles: ['admin']
  },
]

export function Sidebar() {
  const { user, isLoading } = useAuth()
  const { colorMode } = useColorMode()
  const pathname = usePathname()

  // Show all items if loading, or filter based on user role
  const filteredMenuItems = isLoading
    ? menuItems.filter(item => item.roles.includes('viewer')) // Default to viewer items while loading
    : menuItems.filter(item => item.roles.includes(user?.role || 'viewer'))

  return (
    <Box
      as="nav"
      w={64}
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
      borderRight="1px"
      borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
      minH="calc(100vh - 64px)"
      p={4}
    >
      <VStack align="stretch" gap={2}>
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

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
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: isActive
                    ? (colorMode === 'dark' ? '#2D3748' : '#EBF8FF')
                    : 'transparent',
                  color: isActive
                    ? (colorMode === 'dark' ? '#90CDF4' : '#2C5282')
                    : (colorMode === 'dark' ? '#A0AEC0' : '#4A5568'),
                  border: isActive
                    ? (colorMode === 'dark' ? '1px solid #4A5568' : '1px solid #90CDF4')
                    : 'none',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={20} style={{ marginRight: '0.75rem' }} />
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