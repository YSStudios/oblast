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

  // Animation loop
  const loopRender = useCallback(() => {
    if (!requestIdRef.current) {
      requestIdRef.current = requestAnimationFrame(() => render());
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
      console.log('❌ No hovered item or preview ref:', currentHoveredItem, !!previewElement, 'Available refs:', Object.keys(videoPreviewRefs.current));
      return;
    }

    // calculate the mouse distance (current vs previous cycle)
    const mouseDistanceX = clamp(Math.abs(mousePosCache.current.x - mousePos.current.x), 0, 100);
    
    // direction where the mouse is moving
    direction.current = {x: mousePosCache.current.x - mousePos.current.x, y: mousePosCache.current.y - mousePos.current.y};
    
    // updated cache values
    mousePosCache.current = {x: mousePos.current.x, y: mousePos.current.y};

    // DIRECT mouse position - center the preview on the mouse
    const props = animatableProperties.current;
    props.tx.current = mousePos.current.x - 100; // offset by half width (200/2)
    props.ty.current = mousePos.current.y - 60;  // offset by half height (120/2)
    
    // Log every frame to debug
    console.log('🔄 RENDER - Item:', currentHoveredItem, 'Mouse:', mousePos.current.x, mousePos.current.y, 'Target pos:', props.tx.current, props.ty.current);
    
    // new rotation value
    props.rotation.current = firstRAFCycle.current ? 0 : map(mouseDistanceX,0,100,0,direction.current.x < 0 ? 15 : -15);
    
    // new filter value
    props.brightness.current = firstRAFCycle.current ? 1 : map(mouseDistanceX,0,100,1,1.5);

    // set up the interpolated values
    props.tx.previous = firstRAFCycle.current ? props.tx.current : lerp(props.tx.previous, props.tx.current, props.tx.amt);
    props.ty.previous = firstRAFCycle.current ? props.ty.current : lerp(props.ty.previous, props.ty.current, props.ty.amt);
    props.rotation.previous = firstRAFCycle.current ? props.rotation.current : lerp(props.rotation.previous, props.rotation.current, props.rotation.amt);
    props.brightness.previous = firstRAFCycle.current ? props.brightness.current : lerp(props.brightness.previous, props.brightness.current, props.brightness.amt);

    // Apply transforms directly
    gsap.set(previewElement, {
      x: props.tx.previous,
      y: props.ty.previous,
      rotation: props.rotation.previous,
      filter: `brightness(${props.brightness.previous})`,
      opacity: 1 // Ensure it's visible
    });
    console.log('✅ Applied transform to preview:', currentHoveredItem, 'Final pos:', props.tx.previous, props.ty.previous);

    firstRAFCycle.current = false;
    loopRender();
  }, [loopRender]);

  const showVideoPreview = useCallback(
    (videoNumber: number, element: HTMLElement) => {
      console.log('📹 SHOW VIDEO PREVIEW for:', videoNumber);
      const preview = videoPreviewRefs.current[videoNumber];
      const video = preview?.querySelector('video') as HTMLVideoElement;

      if (!preview || !video) {
        console.log('❌ Missing preview or video element');
        return;
      }

      firstRAFCycle.current = true;

      // Start video playback
      video.currentTime = 0;
      video.play().catch(console.error);

      // Set initial position directly at mouse
      const initialX = mousePos.current.x - 100; // half of 200px width
      const initialY = mousePos.current.y - 60;  // half of 120px height
      
      console.log('🎯 Initial position:', initialX, initialY, 'Mouse:', mousePos.current.x, mousePos.current.y);
      
      gsap.set(preview, {
        x: initialX,
        y: initialY,
        opacity: 1,
      });

      // Start animation loop
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

      // Pause video
      video.pause();

      // Hide preview
      gsap.set(preview, {
        opacity: 0,
      });
    },
    [stopRendering]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      stopRendering();
      // Pause all videos on cleanup
      Object.values(videoPreviewRefs.current).forEach((preview) => {
        if (preview) {
          const video = preview.querySelector('video') as HTMLVideoElement;
          if (video) video.pause();
        }
      });
    };
  }, [stopRendering]);

  const handleMouseEnter = useCallback((websiteId: number, element: HTMLElement) => {
    console.log('🖱️ MOUSE ENTER for website:', websiteId);
    handleVideoChange(websiteId);
    
    // Update both state and ref immediately
    setHoveredItem(websiteId);
    hoveredItemRef.current = websiteId;
    showVideoPreview(websiteId, element);
  }, [handleVideoChange, showVideoPreview]);

  const handleMouseLeave = useCallback((websiteId: number, element: HTMLElement, e: React.MouseEvent) => {
    console.log('🖱️ MOUSE LEAVE for website:', websiteId);
    
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