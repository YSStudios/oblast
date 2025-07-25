import * as THREE from "three"
import { GUI } from "dat.gui"

export function createGuiControls(
  sphericalBackgroundMaterial: THREE.ShaderMaterial,
  glassMaterial: THREE.MeshPhysicalMaterial,
  scene: THREE.Scene,
  videoMaterial: THREE.ShaderMaterial | null = null
) {
  const gui = new GUI()
  gui.domElement.style.position = "absolute"
  gui.domElement.style.top = "10px"
  gui.domElement.style.right = "10px"
  gui.domElement.style.zIndex = "1000"

  // Store base colors for GUI control
  const baseColorsRef = {
    current: [
      new THREE.Color('#FF6496'), // hot pink
      new THREE.Color('#63A0FF'), // bright blue
      new THREE.Color('#FFC633'), // orange
      new THREE.Color('#9633FF'), // purple
      new THREE.Color('#33FF96'), // green
    ]
  }

  // Background gradient controls folder
  const backgroundFolder = gui.addFolder("Background Gradient")
  
  // Color parameters for GUI interaction
  const backgroundParams = {
    color1: '#FF6496', // hot pink
    color2: '#63A0FF', // bright blue
    color3: '#FFC633', // orange
    color4: '#9633FF', // purple
    color5: '#33FF96', // green
    noiseSpeed: 0.08,
    noiseStrength: 1.2,
    waveAmplitude: 0.8,
    grittiness: 0.8,
    filmGrain: 0.6,
    filmGrainSpeed: 2.0
  }

  // Color picker controls with proper real-time updates
  backgroundFolder
    .addColor(backgroundParams, "color1")
    .name("Color 1 (Pink)")
    .onChange((value) => {
      const color = new THREE.Color(value)
      baseColorsRef.current[0] = color
      sphericalBackgroundMaterial.uniforms.uColor1.value.copy(color)
    })

  backgroundFolder
    .addColor(backgroundParams, "color2")
    .name("Color 2 (Blue)")
    .onChange((value) => {
      const color = new THREE.Color(value)
      baseColorsRef.current[1] = color
      sphericalBackgroundMaterial.uniforms.uColor2.value.copy(color)
    })

  backgroundFolder
    .addColor(backgroundParams, "color3")
    .name("Color 3 (Orange)")
    .onChange((value) => {
      const color = new THREE.Color(value)
      baseColorsRef.current[2] = color
      sphericalBackgroundMaterial.uniforms.uColor3.value.copy(color)
    })

  backgroundFolder
    .addColor(backgroundParams, "color4")
    .name("Color 4 (Purple)")
    .onChange((value) => {
      const color = new THREE.Color(value)
      baseColorsRef.current[3] = color
      sphericalBackgroundMaterial.uniforms.uColor4.value.copy(color)
    })

  backgroundFolder
    .addColor(backgroundParams, "color5")
    .name("Color 5 (Green)")
    .onChange((value) => {
      const color = new THREE.Color(value)
      baseColorsRef.current[4] = color
      sphericalBackgroundMaterial.uniforms.uColor5.value.copy(color)
    })

  // Animation controls
  const animationSubFolder = backgroundFolder.addFolder("Animation")
  
  animationSubFolder
    .add(backgroundParams, "noiseSpeed", 0.005, 0.15, 0.005)
    .name("Animation Speed")
    .onChange((value) => {
      sphericalBackgroundMaterial.uniforms.uNoiseSpeed.value = value
    })

  animationSubFolder
    .add(backgroundParams, "noiseStrength", 0.1, 3.0, 0.1)
    .name("Noise Strength")
    .onChange((value) => {
      sphericalBackgroundMaterial.uniforms.uNoiseStrength.value = value
    })

  animationSubFolder
    .add(backgroundParams, "waveAmplitude", 0.1, 2.0, 0.1)
    .name("Wave Amplitude")
    .onChange((value) => {
      sphericalBackgroundMaterial.uniforms.uWaveAmplitude.value = value
    })

  // Texture controls
  const textureSubFolder = backgroundFolder.addFolder("TV Static & Texture")
  
  textureSubFolder
    .add(backgroundParams, "filmGrain", 0.0, 1.5, 0.1)
    .name("Static Intensity")
    .onChange((value) => {
      sphericalBackgroundMaterial.uniforms.uFilmGrain.value = value
    })

  textureSubFolder
    .add(backgroundParams, "filmGrainSpeed", 0.1, 5.0, 0.1)
    .name("Static Speed")
    .onChange((value) => {
      sphericalBackgroundMaterial.uniforms.uFilmGrainSpeed.value = value
    })

  textureSubFolder
    .add(backgroundParams, "grittiness", 0.0, 2.0, 0.1)
    .name("Grittiness")
    .onChange((value) => {
      sphericalBackgroundMaterial.uniforms.uGrittiness.value = value
    })

  // Background preset buttons
  const backgroundPresets = {
    "Warm Sunset": () => {
      backgroundParams.color1 = '#FF6B6B'
      backgroundParams.color2 = '#FFE66D'
      backgroundParams.color3 = '#FF8E53'
      backgroundParams.color4 = '#C44569'
      backgroundParams.color5 = '#F8B500'
      updateBackgroundColors()
      backgroundFolder.updateDisplay()
    },
    "Ocean Depths": () => {
      backgroundParams.color1 = '#0077BE'
      backgroundParams.color2 = '#00A8CC'
      backgroundParams.color3 = '#7209B7'
      backgroundParams.color4 = '#2D82B7'
      backgroundParams.color5 = '#42E2B8'
      updateBackgroundColors()
      backgroundFolder.updateDisplay()
    },
    "Cosmic Purple": () => {
      backgroundParams.color1 = '#8E44AD'
      backgroundParams.color2 = '#E74C3C'
      backgroundParams.color3 = '#3498DB'
      backgroundParams.color4 = '#9B59B6'
      backgroundParams.color5 = '#E67E22'
      updateBackgroundColors()
      backgroundFolder.updateDisplay()
    },
    "Forest Dreams": () => {
      backgroundParams.color1 = '#27AE60'
      backgroundParams.color2 = '#F39C12'
      backgroundParams.color3 = '#2ECC71'
      backgroundParams.color4 = '#E67E22'
      backgroundParams.color5 = '#16A085'
      updateBackgroundColors()
      backgroundFolder.updateDisplay()
    },
    "Default": () => {
      backgroundParams.color1 = '#FF6496'
      backgroundParams.color2 = '#63A0FF'
      backgroundParams.color3 = '#FFC633'
      backgroundParams.color4 = '#9633FF'
      backgroundParams.color5 = '#33FF96'
      updateBackgroundColors()
      backgroundFolder.updateDisplay()
    }
  }

  function updateBackgroundColors() {
    const colors = [
      new THREE.Color(backgroundParams.color1),
      new THREE.Color(backgroundParams.color2),
      new THREE.Color(backgroundParams.color3),
      new THREE.Color(backgroundParams.color4),
      new THREE.Color(backgroundParams.color5)
    ]
    
    // Update both the base colors reference and the shader uniforms
    baseColorsRef.current = colors
    sphericalBackgroundMaterial.uniforms.uColor1.value.copy(colors[0])
    sphericalBackgroundMaterial.uniforms.uColor2.value.copy(colors[1])
    sphericalBackgroundMaterial.uniforms.uColor3.value.copy(colors[2])
    sphericalBackgroundMaterial.uniforms.uColor4.value.copy(colors[3])
    sphericalBackgroundMaterial.uniforms.uColor5.value.copy(colors[4])
  }

  // Add preset buttons
  Object.keys(backgroundPresets).forEach((presetName) => {
    backgroundFolder.add(backgroundPresets, presetName as keyof typeof backgroundPresets).name(`Preset: ${presetName}`)
  })

  backgroundFolder.open()

  // Material controls folder
  const materialFolder = gui.addFolder("Glass Material")

  materialFolder
    .add(glassMaterial, "transmission", 0, 1, 0.01)
    .name("Transmission")
    .onChange(() => (glassMaterial.needsUpdate = true))

  materialFolder
    .add(glassMaterial, "thickness", 0, 5, 0.1)
    .name("Thickness")
    .onChange(() => (glassMaterial.needsUpdate = true))

  materialFolder
    .add(glassMaterial, "roughness", 0, 1, 0.01)
    .name("Roughness")
    .onChange(() => (glassMaterial.needsUpdate = true))

  materialFolder
    .add(glassMaterial, "metalness", 0, 1, 0.01)
    .name("Metalness")
    .onChange(() => (glassMaterial.needsUpdate = true))

  materialFolder
    .add(glassMaterial, "clearcoat", 0, 1, 0.01)
    .name("Clearcoat")
    .onChange(() => (glassMaterial.needsUpdate = true))

  materialFolder
    .add(glassMaterial, "clearcoatRoughness", 0, 1, 0.01)
    .name("Clearcoat Roughness")
    .onChange(() => (glassMaterial.needsUpdate = true))

  materialFolder
    .add(glassMaterial, "ior", 1, 2.33, 0.01)
    .name("IOR (Index of Refraction)")
    .onChange(() => (glassMaterial.needsUpdate = true))

  materialFolder
    .add(glassMaterial, "envMapIntensity", 0, 3, 0.1)
    .name("Environment Intensity")
    .onChange(() => (glassMaterial.needsUpdate = true))

  // Color control
  const colorParams = { color: glassMaterial.color.getHex() }
  materialFolder
    .addColor(colorParams, "color")
    .name("Color")
    .onChange((value) => {
      glassMaterial.color.setHex(value)
      glassMaterial.needsUpdate = true
    })

  // Iridescence controls
  const iridescenceFolder = materialFolder.addFolder("Iridescence")

  iridescenceFolder
    .add(glassMaterial, "iridescence", 0, 1, 0.01)
    .name("Iridescence Amount")
    .onChange(() => (glassMaterial.needsUpdate = true))

  iridescenceFolder
    .add(glassMaterial, "iridescenceIOR", 1, 2.5, 0.01)
    .name("Iridescence IOR")
    .onChange(() => (glassMaterial.needsUpdate = true))

  // Iridescence thickness range controls
  const thicknessParams = {
    minThickness: glassMaterial.iridescenceThicknessRange[0],
    maxThickness: glassMaterial.iridescenceThicknessRange[1]
  }

  iridescenceFolder
    .add(thicknessParams, "minThickness", 50, 500, 10)
    .name("Min Thickness")
    .onChange((value) => {
      glassMaterial.iridescenceThicknessRange = [value, thicknessParams.maxThickness]
      glassMaterial.needsUpdate = true
    })

  iridescenceFolder
    .add(thicknessParams, "maxThickness", 200, 1200, 10)
    .name("Max Thickness")
    .onChange((value) => {
      glassMaterial.iridescenceThicknessRange = [thicknessParams.minThickness, value]
      glassMaterial.needsUpdate = true
    })

  // Preset buttons for different iridescence effects
  const iridescencePresets = {
    "Soap Bubble": () => {
      glassMaterial.iridescence = 1.0
      glassMaterial.iridescenceIOR = 1.3
      glassMaterial.iridescenceThicknessRange = [100, 400]
      thicknessParams.minThickness = 100
      thicknessParams.maxThickness = 400
      glassMaterial.needsUpdate = true
      iridescenceFolder.updateDisplay()
    },
    "Oil Slick": () => {
      glassMaterial.iridescence = 0.8
      glassMaterial.iridescenceIOR = 1.4
      glassMaterial.iridescenceThicknessRange = [400, 800]
      thicknessParams.minThickness = 400
      thicknessParams.maxThickness = 800
      glassMaterial.needsUpdate = true
      iridescenceFolder.updateDisplay()
    },
    "Metallic Rainbow": () => {
      glassMaterial.iridescence = 1.0
      glassMaterial.iridescenceIOR = 2.0
      glassMaterial.iridescenceThicknessRange = [200, 600]
      thicknessParams.minThickness = 200
      thicknessParams.maxThickness = 600
      glassMaterial.needsUpdate = true
      iridescenceFolder.updateDisplay()
    },
    "Subtle Shift": () => {
      glassMaterial.iridescence = 0.3
      glassMaterial.iridescenceIOR = 1.2
      glassMaterial.iridescenceThicknessRange = [300, 500]
      thicknessParams.minThickness = 300
      thicknessParams.maxThickness = 500
      glassMaterial.needsUpdate = true
      iridescenceFolder.updateDisplay()
    },
    "No Iridescence": () => {
      glassMaterial.iridescence = 0.0
      glassMaterial.needsUpdate = true
      iridescenceFolder.updateDisplay()
    }
  }

  // Add preset buttons
  Object.keys(iridescencePresets).forEach((presetName) => {
    iridescenceFolder.add(iridescencePresets, presetName as keyof typeof iridescencePresets).name(`Preset: ${presetName}`)
  })

  iridescenceFolder.open()
  materialFolder.open()

  // Video Controls
  if (videoMaterial) {
    const videoFolder = gui.addFolder("Video Controls")
    
    const videoParams = {
      widthScale: 1.0
    }
    
    videoFolder
      .add(videoParams, "widthScale", 0.5, 2.0, 0.05)
      .name("Width Scale")
      .onChange((value) => {
        videoMaterial.uniforms.uVideoWidthScale.value = value
      })
    
    videoFolder.open()
  }

  // Initialize shader uniforms with base colors
  if (sphericalBackgroundMaterial) {
    sphericalBackgroundMaterial.uniforms.uColor1.value.copy(baseColorsRef.current[0])
    sphericalBackgroundMaterial.uniforms.uColor2.value.copy(baseColorsRef.current[1])
    sphericalBackgroundMaterial.uniforms.uColor3.value.copy(baseColorsRef.current[2])
    sphericalBackgroundMaterial.uniforms.uColor4.value.copy(baseColorsRef.current[3])
    sphericalBackgroundMaterial.uniforms.uColor5.value.copy(baseColorsRef.current[4])
  }

  // Return cleanup function
  return () => {
    gui.destroy()
  }
}