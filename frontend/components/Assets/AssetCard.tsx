'use client'

import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from '@chakra-ui/react'
import { HamburgerIcon, DownloadIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { Asset } from '@/types'
import { formatFileSize, formatDate, getFileIcon, isImageFile } from '@/utils/format'
import { useAuth } from '@/contexts/AuthContext'
import { DeleteAssetModal } from './DeleteAssetModal'

interface AssetCardProps {
  asset: Asset
  onDelete?: () => void
}

export function AssetCard({ asset, onDelete }: AssetCardProps) {
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const canEdit = user?.is_admin || (user?.is_editor && asset.user.id === user.id)
  const canDelete = user?.is_admin || (user?.is_editor && asset.user.id === user.id)

  const handleDownload = () => {
    window.open(asset.file_url, '_blank')
  }

  return (
    <>
      <Box
        border="1px"
        borderColor="gray.200"
        rounded="lg"
        overflow="hidden"
        bg="white"
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      >
        <Box position="relative">
          {isImageFile(asset.file_type) ? (
            <Image
              src={asset.file_url}
              alt={asset.title}
              height="200px"
              width="100%"
              objectFit="cover"
            />
          ) : (
            <Box
              height="200px"
              width="100%"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="4xl"
            >
              {getFileIcon(asset.file_type, asset.file_extension)}
            </Box>
          )}

          <Box position="absolute" top={2} right={2}>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<HamburgerIcon />}
                variant="solid"
                size="sm"
                bg="white"
                _hover={{ bg: 'gray.100' }}
              />
              <MenuList>
                <MenuItem
                  as={Link}
                  href={`/assets/${asset.asset_id}`}
                  icon={<EditIcon />}
                >
                  View Details
                </MenuItem>
                <MenuItem
                  icon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download
                </MenuItem>
                {canEdit && (
                  <MenuItem
                    as={Link}
                    href={`/assets/${asset.asset_id}/edit`}
                    icon={<EditIcon />}
                  >
                    Edit
                  </MenuItem>
                )}
                {canDelete && (
                  <MenuItem
                    icon={<DeleteIcon />}
                    color="red.500"
                    onClick={onOpen}
                  >
                    Delete
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </Box>
        </Box>

        <VStack align="stretch" p={4} spacing={2}>
          <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
            {asset.title}
          </Text>

          <Text fontSize="xs" color="gray.600" noOfLines={2}>
            {asset.description}
          </Text>

          <HStack justify="space-between" fontSize="xs">
            <Badge colorScheme="blue" textTransform="lowercase">
              {asset.file_type}
            </Badge>
            <Text color="gray.500">
              {formatFileSize(asset.file_size)}
            </Text>
          </HStack>

          {asset.tags.length > 0 && (
            <HStack spacing={1} flexWrap="wrap">
              {asset.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="subtle" colorScheme="gray" fontSize="2xs">
                  {tag}
                </Badge>
              ))}
              {asset.tags.length > 3 && (
                <Text fontSize="2xs" color="gray.500">
                  +{asset.tags.length - 3} more
                </Text>
              )}
            </HStack>
          )}

          <Text fontSize="xs" color="gray.500">
            Uploaded {formatDate(asset.created_at)}
          </Text>
        </VStack>
      </Box>

      <DeleteAssetModal
        isOpen={isOpen}
        onClose={onClose}
        asset={asset}
        onDelete={onDelete}
      />
    </>
  )
}