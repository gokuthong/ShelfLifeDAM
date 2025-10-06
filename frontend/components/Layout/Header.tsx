'use client'

import {
  Box,
  Flex,
  Button,
  Text,
  IconButton,
} from '@chakra-ui/react'
import { Sun, Moon, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useColorMode } from '@/contexts/ColorModeContext'

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { colorMode, toggleColorMode } = useColorMode()

  const handleLogoClick = () => {
    router.push('/dashboard')
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  return (
    <Box as="header" borderBottom="1px" borderColor="gray.200" bg="white" px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="blue.600"
            cursor="pointer"
            onClick={handleLogoClick}
          >
            ShelfLifeDAM
          </Text>
        </Flex>

        <Flex alignItems="center" gap={4}>
          <IconButton
            aria-label="Toggle color mode"
            onClick={toggleColorMode}
            variant="ghost"
          >
            {colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </IconButton>

          {user && (
            <Flex alignItems="center" gap={2}>
              <Text fontSize="sm" color="gray.600">
                {user.username}
              </Text>

              <IconButton
                aria-label="Profile"
                onClick={handleProfileClick}
                variant="ghost"
                size="sm"
              >
                <User size={18} />
              </IconButton>

              <IconButton
                aria-label="Logout"
                onClick={logout}
                variant="ghost"
                size="sm"
                colorScheme="red"
              >
                <LogOut size={18} />
              </IconButton>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}