'use client'

import {
  Box,
  Flex,
  Button,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  IconButton,
} from '@chakra-ui/react'
import { SunIcon, MoonIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, logout } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box as="header" borderBottom="1px" borderColor="gray.200" bg="white" px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Link href="/dashboard">
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              ShelfLifeDAM
            </Text>
          </Link>
        </Flex>

        <Flex alignItems="center" gap={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />

          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <Avatar size="sm" name={user?.username} />
            </MenuButton>
            <MenuList>
              <MenuItem as={Link} href="/profile">
                Profile
              </MenuItem>
              <MenuItem as={Link} href="/settings">
                Settings
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={logout}>
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  )
}