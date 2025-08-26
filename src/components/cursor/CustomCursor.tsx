"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useMousePosition } from "../../hooks/useMousePosition";
import { useCursor } from "./useCursor";
import styles from "../../styles/cursor.module.css";

export const CustomCursor: React.FC = () => {
  const { x, y } = useMousePosition();
  const { cursorVariant } = useCursor();
  const [isVisible, setIsVisible] = useState(false);
  
  const numCircles = 15;
  const circlesRef = useRef<Array<{ x: number; y: number }>>(Array(numCircles).fill({ x: 0, y: 0 }));
  const animatedSizeRef = useRef(26);
  const targetSizeRef = useRef(26);
  const mousePos = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(Date.now());
  const [isMoving, setIsMoving] = useState(false);
  const [, forceUpdate] = useState({});

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

  // Check if mouse stopped moving
  useEffect(() => {
    const checkMovement = () => {
      const timeSinceLastMove = Date.now() - lastMoveTime.current;
      if (timeSinceLastMove > 100) { // 100ms delay
        setIsMoving(false);
      }
    };
    
    const interval = setInterval(checkMovement, 50);
    return () => clearInterval(interval);
  }, []);

  // Update target size when cursor variant changes
  useEffect(() => {
    targetSizeRef.current = cursorVariant === "hover" ? 120 : 26;
  }, [cursorVariant]);

  // Optimized animation loop using refs to avoid state updates
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      let hasUpdates = false;

      // Update size animation
      const targetSize = targetSizeRef.current;
      const currentSize = animatedSizeRef.current;
      const sizeDiff = targetSize - currentSize;
      
      if (Math.abs(sizeDiff) > 0.5) {
        animatedSizeRef.current = currentSize + (sizeDiff * 0.15);
        hasUpdates = true;
      } else if (animatedSizeRef.current !== targetSize) {
        animatedSizeRef.current = targetSize;
        hasUpdates = true;
      }

      // Update trail animation
      const circles = circlesRef.current;
      let currentX = mousePos.current.x;
      let currentY = mousePos.current.y;
      
      // Update first circle (main cursor)
      if (circles[0].x !== currentX || circles[0].y !== currentY) {
        circles[0] = { x: currentX, y: currentY };
        hasUpdates = true;
      }
      
      // Update trail circles
      for (let i = 1; i < numCircles; i++) {
        const targetCircle = circles[i - 1];
        const currentCircle = circles[i];
        
        const lerpFactor = 0.35;
        const newX = currentCircle.x + (targetCircle.x - currentCircle.x) * lerpFactor;
        const newY = currentCircle.y + (targetCircle.y - currentCircle.y) * lerpFactor;
        
        if (Math.abs(newX - currentCircle.x) > 0.1 || Math.abs(newY - currentCircle.y) > 0.1) {
          circles[i] = { x: newX, y: newY };
          hasUpdates = true;
        }
      }

      // Only trigger re-render if something actually changed
      if (hasUpdates) {
        forceUpdate({});
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* SVG filter for goo effect */}
      <svg style={{ position: 'fixed', top: '-100%', left: '-100%' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Cursor container with goo filter */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          filter: 'url(#goo)',
          mixBlendMode: 'difference'
        }}
      >
        {/* All circles including main cursor */}
        {circlesRef.current.map((circle, index) => {
          // Scale factor - each circle gets smaller
          const scale = 1 - (index * 0.03); // Gradual scaling like the example
          const size = animatedSizeRef.current; // Use animated size from ref
          
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
                transform: `translate(-50%, -50%) scale(${scale})`,
                pointerEvents: 'none'
              }}
            />
          );
        })}
      </div>
    </>
  );
};