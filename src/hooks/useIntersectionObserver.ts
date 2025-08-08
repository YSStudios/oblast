import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!targetRef.current) return;

    const { threshold = 0.1, root = null, rootMargin = '0px' } = options;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        // Once it has intersected, keep it true
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold, root, rootMargin }
    );

    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options.threshold, options.root, options.rootMargin, hasIntersected]);

  const setTarget = (element: Element | null) => {
    if (observerRef.current && targetRef.current) {
      observerRef.current.unobserve(targetRef.current);
    }
    targetRef.current = element;
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  return { isIntersecting, hasIntersected, setTarget };
};