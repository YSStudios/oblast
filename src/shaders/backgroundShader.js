import * as THREE from "three"

export function createSphericalBackgroundMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uColor1: { value: new THREE.Color(1.0, 0.39, 0.59) }, // hot pink
      uColor2: { value: new THREE.Color(0.39, 0.59, 1.0) }, // bright blue
      uColor3: { value: new THREE.Color(1.0, 0.78, 0.2) }, // orange
      uColor4: { value: new THREE.Color(0.59, 0.2, 1.0) }, // purple
      uColor5: { value: new THREE.Color(0.2, 1.0, 0.59) }, // green
      uNoiseSpeed: { value: 0.08 },
      uNoiseStrength: { value: 1.2 },
      uWaveAmplitude: { value: 0.8 },
      uGrittiness: { value: 0.8 },
      uFilmGrain: { value: 0.6 },
      uFilmGrainSpeed: { value: 2.0 },
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        vPosition = position;
        vNormal = normal;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform vec3 uColor4;
      uniform vec3 uColor5;
      uniform float uNoiseSpeed;
      uniform float uNoiseStrength;
      uniform float uWaveAmplitude;
      uniform float uGrittiness;
      uniform float uFilmGrain;
      uniform float uFilmGrainSpeed;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      // Enhanced 3D Simplex noise based on the Stripe example
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
      }
      
      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      
      float snoise(vec3 v) {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }
      
      // Color blending functions inspired by Stripe
      vec3 blendNormal(vec3 base, vec3 blend) {
        return blend;
      }
      
      vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
        return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
      }
      
      // Enhanced dynamic film grain functions
      
      // Random high-frequency noise for grittiness
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      // Smooth TV static noise that updates continuously
      float tvStatic(vec2 uv, float time) {
        // Create smooth, continuous noise by using time directly
        vec2 coord = uv * 1500.0 + time * uFilmGrainSpeed * 10.0;
        return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      // Multiple layers of smooth static
      float staticNoise(vec2 uv, float time) {
        // Layer 1: Fast moving fine static
        float static1 = fract(sin(dot(uv * 2000.0 + time * uFilmGrainSpeed * 15.0, vec2(12.9898, 78.233))) * 43758.5453);
        
        // Layer 2: Medium speed static at different scale
        float static2 = fract(sin(dot(uv * 1200.0 + time * uFilmGrainSpeed * 8.5, vec2(93.9898, 67.345))) * 23421.631);
        
        // Layer 3: Slow moving coarse static
        float static3 = fract(sin(dot(uv * 800.0 + time * uFilmGrainSpeed * 4.2, vec2(56.7834, 34.289))) * 67543.789);
        
        // Combine with different weights for organic feel
        return (static1 * 0.5 + static2 * 0.3 + static3 * 0.2);
      }
      
      // Coarse grain for gritty texture
      float coarseGrain(vec2 p) {
        vec2 gridUV = floor(p * 200.0) / 200.0;
        return random(gridUV);
      }
      
      // Multiple octaves of gritty noise
      float grittiness(vec2 p) {
        float value = 0.0;
        float amplitude = 1.0;
        float frequency = 100.0;
        
        for(int i = 0; i < 4; i++) {
          value += amplitude * random(p * frequency);
          amplitude *= 0.6;
          frequency *= 2.5;
        }
        
        return value * 0.7;
      }
      
      // Edge-hiding noise that varies across the surface
      float edgeNoise(vec2 p, float time) {
        vec2 moving = p + vec2(sin(time * 0.1) * 0.1, cos(time * 0.15) * 0.1);
        float noise1 = random(moving * 150.0);
        float noise2 = random(moving * 300.0) * 0.5;
        float noise3 = random(moving * 600.0) * 0.25;
        return (noise1 + noise2 + noise3) / 1.75;
      }
      
      void main() {
        vec3 pos = normalize(vPosition);
        float time = uTime * uNoiseSpeed;
        
        // Create multiple flowing noise layers with gentle lava lamp speeds
        vec3 noiseCoord1 = pos * 1.2 + vec3(time * 0.15, time * 0.12, time * 0.08);
        vec3 noiseCoord2 = pos * 2.0 + vec3(time * 0.1, time * 0.14, time * 0.18);
        vec3 noiseCoord3 = pos * 3.2 + vec3(time * 0.2, time * 0.07, time * 0.16);
        
        // Generate flowing noise patterns
        float noise1 = snoise(noiseCoord1) * 0.5 + 0.5;
        float noise2 = snoise(noiseCoord2) * 0.5 + 0.5;
        float noise3 = snoise(noiseCoord3) * 0.5 + 0.5;
        
        // Create layered noise for thicker, more defined blobs
        float combinedNoise = (noise1 * 1.2 + noise2 * 0.8 + noise3 * 0.4) / 2.4;
        // More aggressive smoothstep for thicker, more defined regions
        combinedNoise = smoothstep(0.35, 0.65, combinedNoise);
        
        // Add wave distortions for fluid movement with visible lava lamp speeds
        float wave1 = sin(pos.x * 1.8 + time * 0.6 + noise1 * 2.5) * 0.5 + 0.5;
        float wave2 = cos(pos.y * 1.5 + time * 0.5 + noise2 * 2.2) * 0.5 + 0.5;
        float wave3 = sin(pos.z * 2.2 + time * 0.8 + noise3 * 2.8) * 0.5 + 0.5;
        
        // Create more defined blob boundaries
        wave1 = smoothstep(0.3, 0.7, wave1);
        wave2 = smoothstep(0.25, 0.75, wave2);
        wave3 = smoothstep(0.35, 0.65, wave3);
        
        // Balanced color distribution - ensure all colors are always present
        vec3 colors[5];
        colors[0] = uColor1;
        colors[1] = uColor2;
        colors[2] = uColor3;
        colors[3] = uColor4;
        colors[4] = uColor5;
        
        // Create spatial color regions based on position and noise
        // This ensures all colors are always visible somewhere on screen
        
        // Region 1: Top-left area (Color 1 dominant)
        float region1Weight = smoothstep(0.3, 0.7, noise1 + (pos.x + pos.y) * 0.2);
        
        // Region 2: Top-right area (Color 2 dominant)  
        float region2Weight = smoothstep(0.3, 0.7, noise2 + (pos.x - pos.y) * 0.2);
        
        // Region 3: Bottom area (Color 3 dominant)
        float region3Weight = smoothstep(0.3, 0.7, noise3 + (-pos.y) * 0.4);
        
        // Region 4: Left area (Color 4 dominant)
        float region4Weight = smoothstep(0.3, 0.7, combinedNoise + (-pos.x) * 0.3);
        
        // Region 5: Center area (Color 5 dominant)
        float region5Weight = smoothstep(0.3, 0.7, wave1 + (1.0 - length(pos.xy)) * 0.5);
        
        // Normalize weights so they always sum to 1.0 (ensures balanced distribution)
        float totalWeight = region1Weight + region2Weight + region3Weight + region4Weight + region5Weight + 0.1;
        region1Weight /= totalWeight;
        region2Weight /= totalWeight;
        region3Weight /= totalWeight;
        region4Weight /= totalWeight;
        region5Weight /= totalWeight;
        
        // Blend all colors based on their regional weights
        vec3 balancedColor = colors[0] * region1Weight +
                            colors[1] * region2Weight +
                            colors[2] * region3Weight +
                            colors[3] * region4Weight +
                            colors[4] * region5Weight;
        
        // Add gentle time-based evolution without losing any colors
        float timeEvolution = sin(time * 0.02) * 0.15 + 0.85; // gentle pulsing
        vec3 flowColor = balancedColor * timeEvolution;
        
        // Create depth and luminosity variations
        float depth = (noise1 + noise2 + noise3) / 3.0;
        float luminosity = 0.7 + 0.5 * depth * uNoiseStrength;
        
        // Final color with brightness modulation
        vec3 finalColor = flowColor * luminosity;
        
        // Add subtle glow effect at the edges
        float edgeGlow = 1.0 - dot(vNormal, normalize(vPosition));
        finalColor += vec3(0.1, 0.05, 0.15) * edgeGlow * 0.3;
        
        // Apply TV static noise for hiding edges
        vec2 textureCoord = vUv * 100.0; // Fixed scale for grittiness
        
        // TV static noise - smooth like analog TV
        float tvStaticNoise = staticNoise(vUv, time) * uFilmGrain;
        
        // Add subtle gritty noise layers
        float grittyNoise = grittiness(textureCoord) * uGrittiness;
        float edgeHidingNoise = edgeNoise(textureCoord, time) * 0.3;
        
        // Combine texture elements with TV static as primary
        float combinedTexture = tvStaticNoise;
        combinedTexture += grittyNoise * 0.3;
        combinedTexture += edgeHidingNoise * 0.2;
        
        // Apply as subtle brightness variation
        float textureModulation = 1.0 + (combinedTexture - 0.5) * 0.15;
        finalColor *= textureModulation;
        
        // Add pure TV static overlay
        float staticOverlay = (tvStaticNoise - 0.5) * uFilmGrain * 0.1;
        finalColor += vec3(staticOverlay);
        
        // Ensure vibrant, saturated colors
        finalColor = clamp(finalColor, 0.05, 1.2);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  })
}

export function updateBackgroundMaterial(material, time) {
  if (material) {
    material.uniforms.uTime.value = time
    material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
    
    // Dynamic animation parameters for gentle lava lamp effect
    material.uniforms.uNoiseSpeed.value = 0.08 + Math.sin(time * 0.02) * 0.03
    material.uniforms.uNoiseStrength.value = 1.2 + Math.cos(time * 0.04) * 0.25
    material.uniforms.uWaveAmplitude.value = 0.8 + Math.sin(time * 0.03) * 0.18
  }
}