import * as THREE from "three"
import React, { useRef, useMemo, useEffect, useState } from "react"
import { useGLTF, useAnimations, Environment, Text } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { createSphericalBackgroundMaterial, updateBackgroundMaterial } from "../shaders/backgroundShader"
import { useVideoEffects } from "../app/hooks/useVideoEffects"

interface ModelProps {
  scroll: React.MutableRefObject<number>
  videoElement: HTMLVideoElement | null
  videoLoaded: boolean
  onLoaded?: () => void
  onRegisterVideoSwitchCallback?: (callback: (video: HTMLVideoElement) => void) => void
  [key: string]: unknown
}

export default function Model({ scroll, videoElement, videoLoaded, onLoaded, onRegisterVideoSwitchCallback, ...props }: ModelProps) {
  const group = useRef<THREE.Group>(null)
  const { nodes, animations } = useGLTF("/models/oblastbackground5_draco_transform.glb") as {
    nodes: { [key: string]: THREE.Object3D & { geometry?: THREE.BufferGeometry } }
    animations: THREE.AnimationClip[]
  }
  const { actions } = useAnimations(animations, group)
  const { set, scene } = useThree()
  const originalPositions = useRef<{ [key: string]: { x: number; y: number; z: number } }>({})
  const screenMeshRef = useRef<THREE.Mesh>(null)
  const [screenMaterial, setScreenMaterial] = useState<THREE.ShaderMaterial | null>(null)
  const textRef = useRef<THREE.Mesh>(null)
  const textOrienterRef = useRef<THREE.Mesh>(null)
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null)

  // Initialize video effects hook
  const { setupVideoEffects } = useVideoEffects({
    extendedArea: 0.4,
    basePixelSize: 200.0,
    minPixelSize: 25.0,
    maxPixelSize: 150.0,
    trailCount: 60,
    movementThreshold: 0.08,
  })


  // Create complex animated spherical background material
  const sphericalBackgroundMaterial = useMemo(() => createSphericalBackgroundMaterial(), [])

  // Glass material focused on refraction and iridescence
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      transmission: 1.0,
      thickness: 3.0,
      roughness: 0,
      metalness: 0,
      clearcoat: 0,
      clearcoatRoughness: 0,
      ior: 1.52,
      color: 0xffffff,
      envMapIntensity: 0.5,
      iridescence: 1.0,
      iridescenceIOR: 2.4,
      iridescenceThicknessRange: [100, 1000]
    })
  }, [])


  // Nokia screen emissive material
  const nokiaScreenMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 2
    })
  }, [])

  // Set up GLTF camera and animation
  useEffect(() => {
    console.log("Available animations:", Object.keys(actions))
    console.log("Available nodes:", Object.keys(nodes))
    console.log("Camera node exists:", !!nodes.Camera)
    
    // Call onLoaded when model is ready
    if (Object.keys(nodes).length > 0 && onLoaded) {
      onLoaded()
    }
    
    // Set the GLTF camera as the active camera and adjust FOV for mobile
    if (nodes.Camera && 'fov' in nodes.Camera && 'updateProjectionMatrix' in nodes.Camera) {
      console.log("Setting GLTF camera as active camera")
      const camera = nodes.Camera as THREE.PerspectiveCamera
      
      // Set proper aspect ratio for current viewport
      camera.aspect = window.innerWidth / window.innerHeight
      
      // Check if mobile device
      const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        const focalLength = 22 // mm
        const sensorHeight = 24 // mm (35mm film sensor height)
        const fov18mm = 2 * Math.atan(sensorHeight / (2 * focalLength)) * (180 / Math.PI)
        
        camera.fov = fov18mm
      }
      
      camera.updateProjectionMatrix()
      set({ camera })
    }
    
    // Start the camera animation from frame 12
    const cameraAction = actions["Action"] || actions["Camera"] || Object.values(actions)[0]
    if (cameraAction) {
      cameraAction.play()
      cameraAction.paused = true
      // Set starting frame to 12 (convert frame to time)
      const fps = 30 // Assuming 30fps, adjust if different
      const startFrame = 12
      const startTime = startFrame / fps
      cameraAction.time = startTime
    }
  }, [actions, nodes, set, onLoaded])

  // Setup GUI controls - DISABLED
  // useEffect(() => {
  //   let cleanup: (() => void) | undefined

  //   const setupGui = async () => {
  //     if (typeof window !== 'undefined') {
  //       try {
  //         const { createGuiControls } = await import('./GuiControls')
  //         cleanup = createGuiControls(sphericalBackgroundMaterial, glassMaterial, scene, screenMaterial)
          
  //         // Fix z-index for dat.gui
  //         setTimeout(() => {
  //           const guiElements = document.querySelectorAll('.dg.main')
  //           guiElements.forEach(element => {
  //             (element as HTMLElement).style.zIndex = '10000'
  //           })
  //         }, 100)
  //       } catch (error) {
  //         console.error('Failed to load GUI controls:', error)
  //       }
  //     }
  //   }

  //   setupGui()

  //   return () => {
  //     if (cleanup) cleanup()
  //   }
  // }, [sphericalBackgroundMaterial, glassMaterial, screenMaterial, scene])

  // Create video material when video is loaded
  useEffect(() => {
    if (videoElement && videoLoaded && screenMeshRef.current) {
      console.log('Setting up video effects on screen mesh')
      
      // Setup video effects using the hook
      const cleanup = setupVideoEffects(screenMeshRef.current, videoElement)
      
      // Get the material that was created by the hook
      if (screenMeshRef.current && screenMeshRef.current.material) {
        const material = screenMeshRef.current.material as THREE.ShaderMaterial
        setScreenMaterial(material)
        
        // Store the video texture reference
        if (material.uniforms.uTexture) {
          videoTextureRef.current = material.uniforms.uTexture.value
        }
      }

      return cleanup
    }
  }, [videoElement, videoLoaded, setupVideoEffects])

  // Register video switch callback
  useEffect(() => {
    if (onRegisterVideoSwitchCallback && screenMaterial) {
      const switchVideoTexture = (newVideo: HTMLVideoElement) => {
        if (videoTextureRef.current && screenMaterial.uniforms.uTexture) {
          // Update the existing texture with new video element
          videoTextureRef.current.image = newVideo
          videoTextureRef.current.needsUpdate = true
          console.log('Updated video texture')
        }
      }
      
      onRegisterVideoSwitchCallback(switchVideoTexture)
    }
  }, [onRegisterVideoSwitchCallback, screenMaterial])

  // Simple smooth scroll-to-camera animation frame update
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Update complex background shader
    updateBackgroundMaterial(sphericalBackgroundMaterial, time)

    // Update video shader if it exists
    if (screenMaterial && screenMaterial.uniforms && screenMaterial.uniforms.uTime) {
      screenMaterial.uniforms.uTime.value = time
      // Mouse tracking is handled by the useVideoEffects hook
    }

    // Update text position and rotation to match TextOrienter's world transform
    if (textRef.current && textOrienterRef.current) {
		const orienter = textOrienterRef.current
	
		// Get world position and quaternion
		const worldPos = orienter.getWorldPosition(new THREE.Vector3())
		const worldQuat = orienter.getWorldQuaternion(new THREE.Quaternion())
	
		// Apply base position and rotation
		textRef.current.position.copy(worldPos)
		textRef.current.quaternion.copy(worldQuat)
	
		// 🔧 Apply local rotation fix (90 degrees around X or Z, adjust as needed)
		const localFix = new THREE.Quaternion()
		localFix.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, Math.PI / 2)) // try X, Y, Z combos here
		textRef.current.quaternion.multiply(localFix)
	
		// Slight offset away from surface to avoid z-fighting
		const offset = new THREE.Vector3(0, .25, 0.01)
		offset.applyQuaternion(textRef.current.quaternion)
		textRef.current.position.add(offset)
	  }

    // Safe lerping with clamp, starting from frame 12
    const cameraAction = actions["Action"] || actions["Camera"] || Object.values(actions)[0]
    if (cameraAction) {
      const scrollAmount = THREE.MathUtils.clamp(scroll.current, 0, 1)
      const fps = 30 // Assuming 30fps, adjust if different
      const startFrame = 12
      const startTime = startFrame / fps
      const totalDuration = cameraAction.getClip().duration
      const availableDuration = totalDuration - startTime
      const targetTime = startTime + (availableDuration * scrollAmount)
      cameraAction.time = THREE.MathUtils.lerp(cameraAction.time, targetTime, 0.1)
    }

    // Add floating animations to objects (exclude camera) - preserve original positions
    if (group.current && group.current.children[0] && group.current.children[0].children) {
      group.current.children[0].children.forEach((child: THREE.Object3D, index: number) => {
        if (child.name !== "Camera") {
          // Store original position on first frame
          if (!originalPositions.current[child.uuid]) {
            originalPositions.current[child.uuid] = {
              x: child.position.x,
              y: child.position.y,
              z: child.position.z
            }
          }
          
          const original = originalPositions.current[child.uuid]
          const et = state.clock.elapsedTime
          
          // Apply floating animation relative to original position
          child.position.y = original.y + Math.sin((et + index * 2000) / 2) * 0.3
          child.rotation.x = Math.sin((et + index * 2000) / 3) / 10
          child.rotation.y = Math.cos((et + index * 2000) / 2) / 10
          child.rotation.z = Math.sin((et + index * 2000) / 3) / 10
        }
      })
    }
  })

  return (
    <>
      {/* Environment map for reflections */}
      <Environment preset="warehouse" />
      
      {/* Spherical background */}
      <mesh material={sphericalBackgroundMaterial}>
        <sphereGeometry args={[150, 64, 32]} />
      </mesh>

      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          {/* Central light */}
          <pointLight position={[0, 5, 0]} intensity={2} distance={50} decay={2} />
          
          {/* Directional light with shadows */}
          <directionalLight
            castShadow
            position={[10, 20, 15]}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-left={-8}
            shadow-camera-bottom={-8}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            intensity={2}
            shadow-bias={-0.0001}
          />
          
          {/* Use GLTF camera from the loaded model */}
          {nodes.Camera && (
            <primitive object={nodes.Camera} />
          )}

          {/* Spiral objects - restored with proper hierarchy */}
          <group name="Spiral" position={[2.782, -3.809, 3.189]} rotation={[-Math.PI, 1.31, -Math.PI]} scale={1.006} />
          <group name="Spiral2" position={[0, 1.18, 0]} rotation={[-Math.PI, 1.31, -Math.PI]} scale={0.689} />
          
          {/* Disk (floppy disk) - proper hierarchy restored */}
          <group name="disk" position={[10.241, 6.645, -1.916]} rotation={[-0.718, -0.025, 0.434]} scale={0.179}>
            <group name="floppyfbx" rotation={[Math.PI / 2, 0, 0]}>
              <group name="RootNode" scale={0.36}>
                <group name="Body" rotation={[-Math.PI / 2, 0, 0]} scale={36.03}>
                  <mesh name="Body_Material_0" geometry={nodes.Body_Material_0?.geometry} material={glassMaterial} />
                </group>
                <group name="Lock" rotation={[-Math.PI / 2, 0, 0]} scale={36.03}>
                  <mesh name="Lock_Material_0" geometry={nodes.Lock_Material_0?.geometry} material={glassMaterial} />
                </group>
                <group name="Metal" rotation={[-Math.PI / 2, 0, 0]} scale={36.03}>
                  <mesh name="Metal_Material_0" geometry={nodes.Metal_Material_0?.geometry} material={glassMaterial} />
                </group>
              </group>
            </group>
          </group>
          
          {/* TV - proper hierarchy restored */}
          <group name="tv">
            <group name="45ad4d5c495f40f489c1d75df1666aabfbx">
              <group name="RootNode001">
                <group name="back_case_low">
                  <mesh name="back_case_low_crt_back_0" geometry={nodes.back_case_low_crt_back_0?.geometry} material={glassMaterial} />
                </group>
                <group name="front_case_low">
                  <mesh name="front_case_low_crt_front_0" geometry={nodes.front_case_low_crt_front_0?.geometry} material={glassMaterial} />
                  <mesh 
                    ref={screenMeshRef}
                    name="screen" 
                    geometry={nodes.screen?.geometry} 
                    material={glassMaterial} // This will be replaced by the video material
                  />
                </group>
                <group name="top_case_low">
                  <mesh name="top_case_low_crt_top_0" geometry={nodes.top_case_low_crt_top_0?.geometry} material={glassMaterial} />
                </group>
              </group>
            </group>
            <group name="Empty" position={[-1.386, 8.395, -6.214]} />
          </group>
          
          {/* Main objects */}
          <mesh name="Venus_von_Milo" geometry={nodes.Venus_von_Milo?.geometry} material={glassMaterial} position={[9.347, 5.192, 5.565]} scale={1.003} />
          <mesh name="Brain" geometry={nodes.Brain?.geometry} material={glassMaterial} position={[4.279, 8.098, -7.947]} scale={1.001} />
          
          {/* Nokia group */}
          <group name="Nokia" position={[-6.852, 13.099, -1.151]}>
            <mesh name="Plane" geometry={nodes.Plane?.geometry} material={glassMaterial} />
            <mesh name="Plane_1" geometry={nodes.Plane_1?.geometry} material={glassMaterial} />
            <mesh name="Plane_2" geometry={nodes.Plane_2?.geometry} material={glassMaterial} />
            <mesh name="Plane_3" geometry={nodes.Plane_3?.geometry} material={glassMaterial} />
            <mesh name="Plane_4" geometry={nodes.Plane_4?.geometry} material={glassMaterial} />
            <mesh name="Plane_5" geometry={nodes.Plane_5?.geometry} material={glassMaterial} />
            <mesh name="NokiaScreen" geometry={nodes.NokiaScreen?.geometry} material={nokiaScreenMaterial}>
              <mesh name="TextOrienter" ref={textOrienterRef} geometry={nodes.TextOrienter?.geometry} material={(nodes.TextOrienter as THREE.Mesh)?.material} position={[-0.269, 0.794, -0.026]} rotation={[-3, 0.33, 1.637]} visible={false} />
            </mesh>
          </group>
          
          {/* Oblast with nested studio */}
          <mesh name="oblast" geometry={nodes.oblast?.geometry} material={glassMaterial} position={[2.344, 3.875, 8.979]}>
            <mesh name="studio" geometry={nodes.studio?.geometry} material={glassMaterial} position={[-0.327, -1.004, 0.783]} />
          </mesh>
        </group>
      </group>

      {/* Text positioned using TextOrienter's world transform */}
      <Text
        ref={textRef}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="top"
        font="/fonts/PressStart2P-Regular.ttf"
      >
        Contact Us!
      </Text>
    </>
  )
}

useGLTF.preload("/models/oblastbackground5_draco_transform.glb")