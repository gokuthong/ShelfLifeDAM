'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  Link,
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'

export function AppHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Box
      as="header"
      bg={{ base: "white", _dark: "gray.900" }}
      borderBottom="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      px={6}
      py={3}
      position="sticky"
      top={0}
      zIndex={999}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={4}>
          <Text fontSize="xl" fontWeight="bold" color={{ base: "blue.600", _dark: "blue.400" }}>
            DAM System
          </Text>

          {user && (
            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
              Welcome, {user.first_name || user.username}
            </Text>
          )}
        </Flex>

        <Flex align="center" gap={3}>
          {/* Theme Toggle */}
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? '☀️' : '🌙'}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" title="Notifications">
            🔔
          </Button>

          {/* User Menu */}
          {user && (
            <Box position="relative">
              <Button
                onClick={() => setShowDropdown(!showDropdown)}
                variant="ghost"
                padding={0}
              >
                <Avatar
                  size="sm"
                  name={`${user.first_name} ${user.last_name}`}
                  bg={{ base: "blue.500", _dark: "blue.600" }}
                />
              </Button>

              {showDropdown && (
                <Box
                  position="absolute"
                  right={0}
                  mt={2}
                  bg={{ base: "white", _dark: "gray.800" }}
                  border="1px"
                  borderColor={{ base: "gray.200", _dark: "gray.600" }}
                  borderRadius="md"
                  boxShadow="lg"
                  py={2}
                  minW="200px"
                  zIndex={1000}
                >
                  <Box px={4} py={2}>
                    <Text fontWeight="bold">{user.username}</Text>
                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                      {user.email}
                    </Text>
                  </Box>

                  <Box borderTop="1px" borderColor={{ base: "gray.200", _dark: "gray.600" }} my={2} />

                  <Link
                    as={NextLink}
                    href="/profile"
                    display="block"
                    px={4}
                    py={2}
                    _hover={{ bg: { base: "gray.50", _dark: "gray.700" } }}
                    onClick={() => setShowDropdown(false)}
                  >
                    My Profile
                  </Link>

                  <Link
                    as={NextLink}
                    href="/activity"
                    display="block"
                    px={4}
                    py={2}
                    _hover={{ bg: { base: "gray.50", _dark: "gray.700" } }}
                    onClick={() => setShowDropdown(false)}
                  >
                    Activity Log
                  </Link>

                  {user.is_admin && (
                    <Link
                      as={NextLink}
                      href="/users"
                      display="block"
                      px={4}
                      py={2}
                      _hover={{ bg: { base: "gray.50", _dark: "gray.700" } }}
                      onClick={() => setShowDropdown(false)}
                    >
                      User Management
                    </Link>
                  )}

                  <Box borderTop="1px" borderColor={{ base: "gray.200", _dark: "gray.600" }} my={2} />

                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    width="full"
                    justifyContent="flex-start"
                    px={4}
                    colorScheme="red"
                  >
                    Logout
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}