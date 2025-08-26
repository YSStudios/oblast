"use client";

import { useEffect, useState, useRef } from "react";
import { useMousePosition } from "../../hooks/useMousePosition";
import { useCursor } from "./useCursor";
import styles from "../../styles/cursor.module.css";

export const CustomCursor: React.FC = () => {
  const { x, y } = useMousePosition();
  const { cursorVariant } = useCursor();
  const [isVisible, setIsVisible] = useState(false);
  const [circles, setCircles] = useState<Array<{ x: number; y: number }>>([]);
  const [isMoving, setIsMoving] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(Date.now());

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

  // Continuous animation loop with distance-based spacing
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      setCircles(prev => {
        const newCircles = [{ x: mousePos.current.x, y: mousePos.current.y }];
        const minDistance = 15; // Minimum distance between circles
        
        for (let i = 0; i < 5; i++) {
          const targetCircle = newCircles[i];
          const oldCircle = prev[i + 1] || targetCircle;
          
          // Calculate distance between target and old position
          const dx = targetCircle.x - oldCircle.x;
          const dy = targetCircle.y - oldCircle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          let newX, newY;
          
          if (distance > minDistance) {
            // Move towards target but maintain minimum distance
            const angle = Math.atan2(dy, dx);
            const maxDistance = distance - minDistance;
            const moveDistance = Math.min(maxDistance, distance * 0.1);
            
            newX = oldCircle.x + Math.cos(angle) * moveDistance;
            newY = oldCircle.y + Math.sin(angle) * moveDistance;
          } else {
            // If too close, push away slightly
            if (distance > 0) {
              const angle = Math.atan2(dy, dx);
              newX = targetCircle.x - Math.cos(angle) * minDistance;
              newY = targetCircle.y - Math.sin(angle) * minDistance;
            } else {
              newX = oldCircle.x;
              newY = oldCircle.y;
            }
          }
          
          newCircles.push({ x: newX, y: newY });
        }
        
        return newCircles;
      });

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
      {/* Main cursor */}
      <div
        className={`${styles.cursor} ${
          cursorVariant === "hover" ? styles.hover : ""
        }`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
      />
      
      {/* Trail circles - only show when moving and outside main cursor */}
      {isMoving && circles.slice(1).map((circle, index) => {
        // Calculate distance from main cursor
        const dx = circle.x - x;
        const dy = circle.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const mainCursorRadius = cursorVariant === "hover" ? 40 : 10; // Half of cursor size
        const isOutsideMainCursor = distance > mainCursorRadius + 5; // 5px buffer
        
        // Scale trails proportionally to main cursor
        const baseScale = (5 - index) / 5; // Original scale factor
        const cursorSizeMultiplier = cursorVariant === "hover" ? 4 : 1; // 80px/20px = 4x
        const proportionalScale = baseScale * cursorSizeMultiplier;
        
        return isOutsideMainCursor ? (
          <div
            key={index}
            className={styles.circle}
            style={{
              left: `${circle.x}px`,
              top: `${circle.y}px`,
              transform: `translate(-50%, -50%) scale(${proportionalScale})`,
              opacity: isMoving ? 1 : 0,
              transition: isMoving ? 'none' : 'opacity 0.2s ease-out'
            }}
          />
        ) : null;
      })}
    </>
  );
};