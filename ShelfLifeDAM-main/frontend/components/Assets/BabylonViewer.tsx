'use client'

import { useEffect, useRef, useState } from 'react'
import { Box, Text, Spinner, VStack } from '@chakra-ui/react'

interface BabylonViewerProps {
  assetUrl: string
  fileName: string
}

export const BabylonViewer: React.FC<BabylonViewerProps> = ({ assetUrl, fileName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const engineRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    let mounted = true
    const canvas = canvasRef.current
    let engine: any = null
    let scene: any = null

    // Dynamically import Babylon.js only on client-side
    const initBabylon = async () => {
      try {
        const BABYLON = await import('@babylonjs/core')
        await import('@babylonjs/loaders')

        if (!mounted || !canvasRef.current) return

        // Create engine and scene
        engine = new BABYLON.Engine(canvas, true, {
          preserveDrawingBuffer: true,
          stencil: true,
        })
        engineRef.current = engine

        scene = new BABYLON.Scene(engine)
        sceneRef.current = scene
        scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.25, 1)

        // Add camera
        const camera = new BABYLON.ArcRotateCamera(
          'camera',
          Math.PI / 2,
          Math.PI / 2.5,
          3,
          BABYLON.Vector3.Zero(),
          scene
        )
        camera.attachControl(canvas, true)
        camera.wheelPrecision = 50
        camera.minZ = 0.1
        camera.lowerRadiusLimit = 0.5
        camera.upperRadiusLimit = 20

        // Add lights
        const hemisphericLight = new BABYLON.HemisphericLight(
          'hemisphericLight',
          new BABYLON.Vector3(0, 1, 0),
          scene
        )
        hemisphericLight.intensity = 0.7

        const directionalLight = new BABYLON.DirectionalLight(
          'directionalLight',
          new BABYLON.Vector3(-1, -2, -1),
          scene
        )
        directionalLight.position = new BABYLON.Vector3(20, 40, 20)
        directionalLight.intensity = 0.5

        // Add ground grid for reference
        const ground = BABYLON.MeshBuilder.CreateGround(
          'ground',
          { width: 10, height: 10, subdivisions: 10 },
          scene
        )
        const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene)
        groundMaterial.alpha = 0.3
        groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3)
        ground.material = groundMaterial
        ground.position.y = -0.01

        // Load the 3D model
        BABYLON.SceneLoader.ImportMesh(
          '',
          '',
          assetUrl,
          scene,
          (meshes: any[]) => {
            if (!mounted) return

            if (meshes.length > 0) {
              // Calculate bounding box to frame the model
              let min = meshes[0].getBoundingInfo().boundingBox.minimumWorld
              let max = meshes[0].getBoundingInfo().boundingBox.maximumWorld

              meshes.forEach((mesh) => {
                const boundingInfo = mesh.getBoundingInfo()
                min = BABYLON.Vector3.Minimize(min, boundingInfo.boundingBox.minimumWorld)
                max = BABYLON.Vector3.Maximize(max, boundingInfo.boundingBox.maximumWorld)
              })

              const center = BABYLON.Vector3.Center(min, max)
              const size = max.subtract(min)
              const maxDimension = Math.max(size.x, size.y, size.z)

              // Center the model
              meshes.forEach((mesh) => {
                mesh.position.subtractInPlace(center)
              })

              // Adjust camera to frame the model
              camera.target = BABYLON.Vector3.Zero()
              camera.radius = maxDimension * 2
              camera.alpha = Math.PI / 4
              camera.beta = Math.PI / 3

              setLoading(false)
            }
          },
          null,
          (scene: any, message: string, exception: any) => {
            if (!mounted) return
            console.error('Error loading 3D model:', message, exception)
            setError(`Failed to load 3D model: ${message}`)
            setLoading(false)
          }
        )

        // Run the render loop
        engine.runRenderLoop(() => {
          if (scene && mounted) {
            scene.render()
          }
        })

        // Handle window resize
        const handleResize = () => {
          if (engine) {
            engine.resize()
          }
        }
        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
          if (scene) {
            scene.dispose()
          }
          if (engine) {
            engine.dispose()
          }
        }
      } catch (err) {
        if (!mounted) return
        console.error('Error initializing Babylon.js:', err)
        setError('Failed to initialize 3D viewer')
        setLoading(false)
      }
    }

    initBabylon()

    return () => {
      mounted = false
      if (scene) {
        scene.dispose()
      }
      if (engine) {
        engine.dispose()
      }
    }
  }, [assetUrl])

  if (error) {
    return (
      <Box
        width="100%"
        height="500px"
        bg="gray.900"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Text color="red.400" fontSize="lg" fontWeight="semibold">
            Error Loading 3D Model
          </Text>
          <Text color="gray.400" fontSize="sm" textAlign="center" maxW="400px">
            {error}
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box position="relative" width="100%" height="500px" borderRadius="md" overflow="hidden">
      {loading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="gray.900"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={10}
        >
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.400">Loading 3D model...</Text>
          </VStack>
        </Box>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          outline: 'none',
        }}
      />
      <Box
        position="absolute"
        bottom={4}
        right={4}
        bg="rgba(0, 0, 0, 0.7)"
        px={3}
        py={2}
        borderRadius="md"
      >
        <Text color="white" fontSize="xs">
          Left click: Rotate • Scroll: Zoom • Right click: Pan
        </Text>
      </Box>
    </Box>
  )
}
