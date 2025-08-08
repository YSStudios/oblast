import { useRef, useCallback, useState, useEffect } from 'react';
import { gsap } from 'gsap';

// Utility functions
const map = (x: number, a: number, b: number, c: number, d: number) =>
  ((x - a) * (d - c)) / (b - a) + c;
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
const clamp = (num: number, min: number, max: number) =>
  num <= min ? min : num >= max ? max : num;

// Types
interface MousePos {
  x: number;
  y: number;
}

interface Direction {
  x: number;
  y: number;
}

interface AnimatableProperties {
  tx: { previous: number; current: number; amt: number };
  ty: { previous: number; current: number; amt: number };
  rotation: { previous: number; current: number; amt: number };
  brightness: { previous: number; current: number; amt: number };
}

interface UseVideoHoverOptions {
  videoUrls: string[];
  onVideoChange: (videoNumber: number) => void;
}

export const useVideoHover = ({ videoUrls, onVideoChange }: UseVideoHoverOptions) => {
  const [activeVideo, setActiveVideo] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const hoveredItemRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Mouse tracking
  const mousePos = useRef<MousePos>({ x: 0, y: 0 });
  const mousePosCache = useRef<MousePos>({ x: 0, y: 0 });
  const direction = useRef<Direction>({ x: 0, y: 0 });

  // Animation properties for video preview
  const animatableProperties = useRef<AnimatableProperties>({
    tx: { previous: 0, current: 0, amt: 0.08 },
    ty: { previous: 0, current: 0, amt: 0.08 },
    rotation: { previous: 0, current: 0, amt: 0.08 },
    brightness: { previous: 1, current: 1, amt: 0.08 },
  });

  // Refs for video preview elements
  const videoPreviewRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const requestIdRef = useRef<number | undefined>();
  const firstRAFCycle = useRef(true);
  const currentHoveredBounds = useRef<DOMRect | null>(null);
  const previewBounds = useRef<DOMRect | null>(null);

  const handleVideoChange = useCallback(
    (videoNumber: number) => {
      setActiveVideo(videoNumber);
      onVideoChange(videoNumber);
    },
    [onVideoChange]
  );

  // Log hoveredItem changes
  useEffect(() => {
    console.log('hoveredItem changed to:', hoveredItem);
  }, [hoveredItem]);

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Highly optimized animation loop
  const loopRender = useCallback(() => {
    if (!requestIdRef.current) {
      requestIdRef.current = requestAnimationFrame(render);
    }
  }, []);

  const stopRendering = useCallback(() => {
    if (requestIdRef.current) {
      window.cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = undefined;
    }
  }, []);

  const render = useCallback(() => {
    requestIdRef.current = undefined;

    const currentHoveredItem = hoveredItemRef.current;
    const previewElement = videoPreviewRefs.current[currentHoveredItem!];
    
    if (!currentHoveredItem || !previewElement) {
      return;
    }

    // Skip frame rate limiting and mouse movement checks for maximum smoothness
    // Direct mouse following with minimal interpolation
    const targetX = mousePos.current.x - 160; // Half of 320px width
    const targetY = mousePos.current.y - 90;  // Half of 180px height
    
    const props = animatableProperties.current;
    
    if (firstRAFCycle.current) {
      // Instant positioning on first frame
      props.tx.previous = targetX;
      props.ty.previous = targetY;
      props.rotation.previous = 0;
      props.brightness.previous = 1;
      firstRAFCycle.current = false;
    } else {
      // Very light interpolation for smoothness while maintaining responsiveness
      const lerpAmt = 0.25; // Higher for more responsive feel
      props.tx.previous = lerp(props.tx.previous, targetX, lerpAmt);
      props.ty.previous = lerp(props.ty.previous, targetY, lerpAmt);
      
      // Minimal rotation and brightness effects
      const mouseDistanceX = clamp(Math.abs(mousePosCache.current.x - mousePos.current.x), 0, 50);
      direction.current = {
        x: mousePosCache.current.x - mousePos.current.x, 
        y: mousePosCache.current.y - mousePos.current.y
      };
      
      const targetRotation = map(mouseDistanceX, 0, 50, 0, direction.current.x < 0 ? 4 : -4);
      const targetBrightness = map(mouseDistanceX, 0, 50, 1, 1.1);
      
      props.rotation.previous = lerp(props.rotation.previous, targetRotation, 0.2);
      props.brightness.previous = lerp(props.brightness.previous, targetBrightness, 0.1);
    }
    
    // Update mouse cache
    mousePosCache.current = { x: mousePos.current.x, y: mousePos.current.y };

    // Apply transforms with hardware acceleration
    previewElement.style.transform = `translate3d(${props.tx.previous}px, ${props.ty.previous}px, 0) rotate(${props.rotation.previous}deg)`;
    previewElement.style.filter = `brightness(${props.brightness.previous})`;
    
    requestIdRef.current = requestAnimationFrame(render);
  }, []);

  const showVideoPreview = useCallback(
    (videoNumber: number, element: HTMLElement) => {
      const preview = videoPreviewRefs.current[videoNumber];
      const video = preview?.querySelector('video') as HTMLVideoElement;

      if (!preview || !video) {
        return;
      }

      firstRAFCycle.current = true;

      // Lazy load video if not already loaded
      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src;
        video.load();
      }

      // Simple video playback
      video.currentTime = 0;
      video.play().catch(() => {});

      // Set initial styles for maximum performance
      preview.style.opacity = '1';
      preview.style.willChange = 'transform';
      preview.style.pointerEvents = 'none';

      // Start animation loop immediately
      loopRender();
    },
    [loopRender]
  );

  const hideVideoPreview = useCallback(
    (videoNumber: number, element: HTMLElement) => {
      const preview = videoPreviewRefs.current[videoNumber];
      const video = preview?.querySelector('video') as HTMLVideoElement;

      if (!preview || !video) return;

      // Stop animation loop
      stopRendering();

      // Pause video and hide preview
      video.pause();
      preview.style.opacity = '0';
      preview.style.willChange = 'auto';
    },
    [stopRendering]
  );

  // Cleanup and memory management
  useEffect(() => {
    return () => {
      stopRendering();
      
      // Comprehensive cleanup of all videos and refs
      Object.values(videoPreviewRefs.current).forEach((preview) => {
        if (preview) {
          const video = preview.querySelector('video') as HTMLVideoElement;
          if (video) {
            video.pause();
            video.currentTime = 0;
            video.removeAttribute('src');
            video.load(); // Clear the video from memory
          }
        }
      });
      
      // Clear all refs
      videoPreviewRefs.current = {};
      hoveredItemRef.current = null;
      
      // Clear animation properties
      animatableProperties.current = {
        tx: { previous: 0, current: 0, amt: 0.08 },
        ty: { previous: 0, current: 0, amt: 0.08 },
        rotation: { previous: 0, current: 0, amt: 0.08 },
        brightness: { previous: 1, current: 1, amt: 0.08 },
      };
    };
  }, [stopRendering]);

  const handleMouseEnter = useCallback((websiteId: number, element: HTMLElement) => {
    handleVideoChange(websiteId);
    
    // Update both state and ref immediately
    setHoveredItem(websiteId);
    hoveredItemRef.current = websiteId;
    showVideoPreview(websiteId, element);
  }, [handleVideoChange, showVideoPreview]);

  const handleMouseLeave = useCallback((websiteId: number, element: HTMLElement, e: React.MouseEvent) => {
    // Update both state and ref immediately  
    setHoveredItem(null);
    hoveredItemRef.current = null;
    hideVideoPreview(websiteId, element);
  }, [hideVideoPreview]);

  return {
    activeVideo,
    hoveredItem,
    videoPreviewRefs,
    videoUrls,
    handleMouseEnter,
    handleMouseLeave,
  };
};