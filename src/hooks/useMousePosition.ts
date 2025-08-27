import { useState, useEffect, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
}

export const useMousePosition = (): MousePosition => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const pendingPosition = useRef<MousePosition | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (pendingPosition.current) {
        setMousePosition(pendingPosition.current);
        pendingPosition.current = null;
      }
      animationFrameId.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Store the latest position
      pendingPosition.current = { x: e.clientX, y: e.clientY };
      
      // Only schedule update if not already scheduled
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(updatePosition);
      }
    };

    // Use passive listener for better performance
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return mousePosition;
};