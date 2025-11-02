"use client";

import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Grid,
  Text,
  Heading,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { AssetCard } from "@/components/Assets/AssetCard";
import { useAssets, useDeleteAsset } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import { useColorMode } from "@/contexts/ColorModeContext";

export default function AssetsPage() {
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const [filters, setFilters] = useState({
    search: "",
    file_type: "",
    ordering: "-created_at",
    user: "",
  });

  // Dark mode colors
  const cardBg = colorMode === 'dark' ? 'gray.800' : 'white';
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200';
  const textColor = colorMode === 'dark' ? 'gray.300' : 'gray.600';
  const headingColor = colorMode === 'dark' ? 'white' : 'gray.700';
  const statsBg = colorMode === 'dark' ? 'blue.900' : 'blue.50';
  const statsBorderColor = colorMode === 'dark' ? 'blue.700' : 'blue.200';
  const skeletonBg = colorMode === 'dark' ? 'gray.700' : 'gray.100';
  const selectBg = colorMode === 'dark' ? 'gray.700' : 'white';
  const selectBorder = colorMode === 'dark' ? '#4A5568' : '#E2E8F0';

  // For editors and admins, filter to show only their assets by default
  // For viewers, show all assets (no user filter)
  useEffect(() => {
    if (user?.id && (user?.is_editor || user?.is_admin)) {
      setFilters(prev => ({ ...prev, user: user.id }));
    }
  }, [user?.id, user?.is_editor, user?.is_admin]);

  const { data: assetsData, isLoading } = useAssets(filters);
  const deleteAsset = useDeleteAsset();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (assetId: string) => {
    try {
      await deleteAsset.mutateAsync(assetId);
      // The invalidateQueries in the hook will refresh the data
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  return (
    <AppLayout>
      <Box maxW="1600px" mx="auto" w="full">
        <VStack align="stretch" gap={8}>
          {/* Header */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            boxShadow="md"
          >
            <HStack justify="space-between" align="center">
              <Box>
                <Heading size="lg" mb={2}>
                  {user?.is_viewer && !user?.is_editor && !user?.is_admin ? "Asset Library" : "My Assets"}
                </Heading>
                <Text fontSize="md" color={textColor}>
                  {user?.is_viewer && !user?.is_editor && !user?.is_admin
                    ? "Browse and explore all digital assets in the library"
                    : "Manage and browse your uploaded digital assets"}
                </Text>
              </Box>
              {assetsData?.count && (
                <Box
                  bg={statsBg}
                  px={6}
                  py={4}
                  borderRadius="lg"
                  border="1px"
                  borderColor={statsBorderColor}
                  textAlign="center"
                >
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                    {assetsData.count}
                  </Text>
                  <Text fontSize="sm" color="blue.700" fontWeight="medium">
                    Total Assets
                  </Text>
                </Box>
              )}
            </HStack>
          </Box>

          {/* Filters */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <HStack gap={4} flexWrap="wrap">
              <Box flex={1} minW="250px">
                <Text fontSize="sm" fontWeight="semibold" mb={2} color={headingColor}>
                  Search Assets
                </Text>
                <Input
                  placeholder="Search by title, description, tags..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  size="lg"
                  borderRadius="lg"
                />
              </Box>

              <Box minW="200px">
                <Text fontSize="sm" fontWeight="semibold" mb={2} color={headingColor}>
                  File Type
                </Text>
                <select
                  value={filters.file_type}
                  onChange={(e) => handleFilterChange("file_type", e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${selectBorder}`,
                    borderRadius: '8px',
                    background: selectBg,
                    fontSize: '16px',
                  }}
                >
                  <option value="">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="pdf">PDFs</option>
                  <option value="doc">Documents</option>
                  <option value="audio">Audio</option>
                  <option value="3d">3D Models</option>
                  <option value="other">Other</option>
                </select>
              </Box>

              <Box minW="200px">
                <Text fontSize="sm" fontWeight="semibold" mb={2} color={headingColor}>
                  Sort By
                </Text>
                <select
                  value={filters.ordering}
                  onChange={(e) => handleFilterChange("ordering", e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${selectBorder}`,
                    borderRadius: '8px',
                    background: selectBg,
                    fontSize: '16px',
                  }}
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="-title">Title Z-A</option>
                  <option value="file_size">Size: Small to Large</option>
                  <option value="-file_size">Size: Large to Small</option>
                </select>
              </Box>
            </HStack>
          </Box>

          {/* Asset Grid */}
          {isLoading ? (
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(2, 1fr)',
                xl: 'repeat(3, 1fr)'
              }}
              gap={8}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Box
                  key={i}
                  height="400px"
                  bg={skeletonBg}
                  rounded="xl"
                  border="1px"
                  borderColor={borderColor}
                />
              ))}
            </Grid>
          ) : assetsData?.results && assetsData.results.length > 0 ? (
            <>
              <HStack justify="space-between" align="center">
                <Text color={textColor} fontSize="md">
                  Showing <strong>{assetsData.results.length}</strong> of <strong>{assetsData.count}</strong> assets
                </Text>
              </HStack>
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(2, 1fr)',
                  xl: 'repeat(3, 1fr)'
                }}
                gap={8}
              >
                {assetsData.results.map((asset) => (
                  <AssetCard
                    key={asset.asset_id}
                    asset={asset}
                    onDelete={() => handleDelete(asset.asset_id)}
                  />
                ))}
              </Grid>
            </>
          ) : (
            <Box
              textAlign="center"
              py={20}
              bg={cardBg}
              borderRadius="xl"
              border="2px"
              borderColor={borderColor}
              borderStyle="dashed"
            >
              <VStack gap={4}>
                <Text fontSize="6xl">📦</Text>
                <Text fontSize="2xl" fontWeight="bold" color={headingColor}>
                  No assets found
                </Text>
                <Text fontSize="md" color={textColor} maxW="400px">
                  {filters.search || filters.file_type
                    ? "Try adjusting your search filters to find what you're looking for"
                    : "Get started by uploading your first asset to the library"}
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </AppLayout>
  );
}
