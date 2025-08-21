import { useCallback, useState } from 'react';

// Types
interface UseVideoHoverOptions {
  videoUrls: string[];
  onVideoChange: (videoNumber: number) => void;
}

export const useVideoHover = ({ videoUrls, onVideoChange }: UseVideoHoverOptions) => {
  const [activeVideo, setActiveVideo] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  // Refs for video preview elements (kept for compatibility but unused)
  const videoPreviewRefs = { current: {} };

  const handleVideoChange = useCallback(
    (videoNumber: number) => {
      setActiveVideo(videoNumber);
      onVideoChange(videoNumber);
    },
    [onVideoChange]
  );

  const handleMouseEnter = useCallback((websiteId: number) => {
    handleVideoChange(websiteId);
    setHoveredItem(websiteId);
  }, [handleVideoChange]);

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  return {
    activeVideo,
    hoveredItem,
    videoPreviewRefs,
    videoUrls,
    handleMouseEnter,
    handleMouseLeave,
  };
};