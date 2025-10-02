'use client'

import { Flex } from '@chakra-ui/react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Flex direction="column" minH="100vh">
      <Header />
      <Flex flex={1}>
        <Sidebar />
        <Flex flex={1} p={6}>
          {children}
        </Flex>
      </Flex>
    </Flex>
  )
}