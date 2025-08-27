"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useMousePosition } from "../../hooks/useMousePosition";
import { useCursor } from "./useCursor";
import styles from "../../styles/cursor.module.css";

export const CustomCursor: React.FC = () => {
  const { x, y } = useMousePosition();
  const { cursorVariant } = useCursor();
  const [isVisible, setIsVisible] = useState(false);
  
  const numCircles = 10; // Optimized for 60fps performance
  const circlesRef = useRef<Array<{ x: number; y: number }>>(
    Array.from({ length: numCircles }, () => ({ x: 0, y: 0 }))
  );
  const animatedSizeRef = useRef(26);
  const targetSizeRef = useRef(26);
  const mousePos = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(Date.now());
  const [isMoving, setIsMoving] = useState(false);
  const [, forceUpdate] = useState(0);
  const forceUpdateOptimized = useCallback(() => {
    forceUpdate(prev => prev + 1);
  }, []);

  useEffect(() => {
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    setIsVisible(true);

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Update mouse position ref and detect movement
  useEffect(() => {
    const prevX = mousePos.current.x;
    const prevY = mousePos.current.y;
    
    mousePos.current = { x, y };
    
    // Detect if mouse is moving
    const moved = Math.abs(x - prevX) > 0.5 || Math.abs(y - prevY) > 0.5;
    if (moved) {
      lastMoveTime.current = Date.now();
      setIsMoving(true);
    }
  }, [x, y]);

  // Optimized movement detection
  useEffect(() => {
    const checkMovement = () => {
      const timeSinceLastMove = Date.now() - lastMoveTime.current;
      if (timeSinceLastMove > 150) { // Increased delay to reduce checks
        setIsMoving(false);
      }
    };
    
    const interval = setInterval(checkMovement, 100); // Reduced frequency
    return () => clearInterval(interval);
  }, []);

  // Update target size when cursor variant changes
  useEffect(() => {
    targetSizeRef.current = cursorVariant === "hover" ? 120 : 26;
  }, [cursorVariant]);

  // High-performance 60fps animation loop with CPU optimizations
  useEffect(() => {
    let animationId: number;
    let hasChanges = false;
    let frameCounter = 0;

    const animate = () => {
      frameCounter++;
      hasChanges = false;

      // Update size animation - smooth and efficient
      const targetSize = targetSizeRef.current;
      const currentSize = animatedSizeRef.current;
      const sizeDiff = targetSize - currentSize;
      
      if (Math.abs(sizeDiff) > 0.5) {
        animatedSizeRef.current = currentSize + (sizeDiff * 0.2);
        hasChanges = true;
      }

      // Get current mouse position
      const currentX = mousePos.current.x;
      const currentY = mousePos.current.y;
      const circles = circlesRef.current;
      
      // Update main cursor position
      if (Math.abs(circles[0].x - currentX) > 0.1 || Math.abs(circles[0].y - currentY) > 0.1) {
        circles[0].x = currentX;
        circles[0].y = currentY;
        hasChanges = true;
      }
      
      // Update trail circles - optimized loop
      const lerpFactor = isMoving ? 0.3 : 0.15;
      for (let i = 1; i < numCircles; i++) {
        const target = circles[i - 1];
        const current = circles[i];
        
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        
        // Only update if movement is significant enough
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          current.x += dx * lerpFactor;
          current.y += dy * lerpFactor;
          hasChanges = true;
        }
      }

      // Only re-render if something changed
      if (hasChanges) {
        forceUpdateOptimized();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isMoving, numCircles]);

  if (!isVisible) return null;

  return (
    <>
      {/* High-performance goo effect */}
      <svg style={{ position: 'fixed', top: '-100%', left: '-100%' }}>
        <defs>
          <filter id="goo" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -6" result="goo" />
          </filter>
        </defs>
      </svg>

      {/* High-performance cursor container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          filter: 'url(#goo)',
          mixBlendMode: 'difference',
          transform: 'translate3d(0,0,0)', // Force GPU acceleration
          backfaceVisibility: 'hidden' // GPU optimization
        }}
      >
        {/* Optimized circle rendering */}
        {circlesRef.current.map((circle, index) => {
          const scale = 1 - (index * 0.03);
          const size = animatedSizeRef.current * scale;
          
          return (
            <div
              key={index}
              style={{
                position: 'fixed',
                left: `${circle.x}px`,
                top: `${circle.y}px`,
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                backgroundColor: '#fff',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                willChange: 'transform' // GPU optimization hint
              }}
            />
          );
        })}
      </div>
    </>
  );
};