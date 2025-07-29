# Oblast Performance Optimization Plan

## Project Overview
3D web application built with Next.js, React Three Fiber, and Three.js experiencing performance issues on lower-powered devices.

## Critical Performance Issues Identified

### 1. Massive Model Files (26MB each) - CRITICAL
**Problem**: GLB models are 26MB each, causing slow loading and memory issues
**Impact**: Long loading times, memory pressure on mobile devices
**Priority**: CRITICAL

**Optimization Steps**:
- [ ] **Step 1.1**: Analyze current model complexity and geometry
- [ ] **Step 1.2**: Implement Draco compression for GLB files
- [ ] **Step 1.3**: Create LOD (Level of Detail) versions for mobile
- [ ] **Step 1.4**: Split large models into smaller chunks if possible

**Checkpoint**: Validate model loading performance improvement after each step

---

### 2. Complex Shader Performance - CRITICAL
**Problem**: 400+ line fragment shader with 60-iteration loops causing GPU bottlenecks
**Impact**: Low FPS on integrated graphics and mobile GPUs
**Priority**: CRITICAL

**Optimization Steps**:
- [ ] **Step 2.1**: Reduce trail count from 60 to 20-30 for mobile devices
- [ ] **Step 2.2**: Implement performance-based shader quality switching
- [ ] **Step 2.3**: Optimize noise functions and reduce computational complexity
- [ ] **Step 2.4**: Add conditional compilation for mobile vs desktop shaders

**Checkpoint**: Measure FPS improvement on target low-end devices after each step

---

### 3. High-Resolution Geometry - HIGH
**Problem**: Background sphere uses 64x32 segments (2048 vertices)
**Impact**: Unnecessary vertex processing overhead
**Priority**: HIGH

**Optimization Steps**:
- [ ] **Step 3.1**: Implement device-based geometry LOD system
- [ ] **Step 3.2**: Reduce sphere segments to 32x16 for mobile (512 vertices)
- [ ] **Step 3.3**: Apply similar optimization to other high-poly meshes

**Checkpoint**: Verify visual quality remains acceptable while reducing vertex count

---

### 4. Video Loading Strategy - MEDIUM
**Problem**: Large external video loads synchronously without optimization
**Impact**: Network bottleneck and memory usage
**Priority**: MEDIUM

**Optimization Steps**:
- [ ] **Step 4.1**: Implement adaptive video quality based on device capabilities
- [ ] **Step 4.2**: Add video preloading with metadata-only option
- [ ] **Step 4.3**: Consider WebP/AVIF formats for better compression
- [ ] **Step 4.4**: Implement progressive loading and buffering strategies

**Checkpoint**: Test loading performance across different network conditions

---

### 5. Render Loop Optimizations - MEDIUM
**Problem**: Multiple useFrame callbacks and continuous updates
**Impact**: CPU overhead and battery drain
**Priority**: MEDIUM

**Optimization Steps**:
- [ ] **Step 5.1**: Consolidate multiple useFrame callbacks into single update loop
- [ ] **Step 5.2**: Implement frame rate throttling for lower-end devices
- [ ] **Step 5.3**: Add conditional animations based on device performance
- [ ] **Step 5.4**: Optimize floating animations with requestIdleCallback

**Checkpoint**: Monitor CPU usage and battery impact after optimizations

---

## Performance Testing Strategy

### Target Devices for Testing
- **Low-end mobile**: iPhone SE (2020), Android with 4GB RAM
- **Mid-range mobile**: iPhone 12, Samsung Galaxy A series
- **Low-end desktop**: Integrated graphics (Intel UHD, AMD Vega)

### Success Metrics
- **Loading time**: < 3 seconds on 3G connection
- **Frame rate**: > 30fps on target low-end devices
- **Memory usage**: < 512MB on mobile devices
- **Bundle size**: Maintain current 421KB or reduce

### Testing Commands
```bash
# Build and analyze bundle
npm run build

# Local testing
npm run dev

# Performance profiling (add if needed)
npm run analyze
```

## Implementation Notes

- Each step requires approval before proceeding to the next
- Performance testing should be conducted after each checkpoint
- Maintain visual quality while optimizing performance
- Consider feature flags for progressive enhancement
- Document all changes for future reference

## Current Status
- [x] Performance analysis completed
- [x] **Step 1.1**: Model analysis completed
- [x] **Step 1.2**: Model optimization completed (oblastbackground5.glb - 60% size reduction: 26MB → 10.6MB)
- [x] **Step 1.3**: Draco compression applied (90% additional reduction: 10.6MB → 1.02MB)
- [x] **Step 1.4**: Updated code to use Draco-compressed model (oblastbackground5_draco.glb)
- [x] **Step 1.5**: Build verification successful
- [x] **CHECKPOINT 1 COMPLETE** - Model optimization achieved **96% total reduction** (26MB → 1.02MB)
- [ ] Ready for approval to proceed to Step 2.1: Shader optimization