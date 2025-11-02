'use client'

import { Flex, Box } from '@chakra-ui/react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useColorMode } from '@/contexts/ColorModeContext'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { colorMode } = useColorMode()

  return (
    <Flex
      direction="column"
      minH="100vh"
      bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
      color={colorMode === 'dark' ? 'white' : 'gray.900'}
      position="relative"
    >
      {/* Optional background image overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgImage="url('/background-pattern.svg')"
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        opacity={colorMode === 'dark' ? 0.03 : 0.05}
        pointerEvents="none"
        zIndex={0}
      />

      {/* Content */}
      <Box position="relative" zIndex={1} w="full" minH="100vh" display="flex" flexDirection="column">
        <Header />
        <Flex flex={1}>
          <Sidebar />
          <Flex
            flex={1}
            p={6}
            bg={colorMode === 'dark' ? 'transparent' : 'transparent'}
          >
            {children}
          </Flex>
        </Flex>
      </Box>
    </Flex>
  )
}