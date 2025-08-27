"use client";

import React, {
  Suspense,
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
  useMemo,
} from "react";
import { Canvas } from "@react-three/fiber";
import Model from "../components/Model";
import Overlay from "../components/Overlay";
import { VIDEO_URLS } from "../config/videos";

// Memoized Model component to prevent unnecessary re-renders
const MemoizedModel = memo(Model);

// Memoized Overlay wrapper
const MemoizedOverlay = memo(Overlay);

export default function Home() {
  const overlay = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  const videosRef = useRef<{ [key: number]: HTMLVideoElement }>({});
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const videoSwitchCallbackRef = useRef<
    ((video: HTMLVideoElement) => void) | null
  >(null);

  // Function to switch video and update state
  const switchVideo = useCallback((videoNumber: number) => {
    const targetVideo = videosRef.current[videoNumber];
    if (targetVideo && targetVideo !== currentVideoRef.current) {
      currentVideoRef.current = targetVideo;
      setCurrentVideo(targetVideo);
      targetVideo.currentTime = 0;
      targetVideo.play().catch(() => {});

      // Notify the shader to update texture
      if (videoSwitchCallbackRef.current) {
        videoSwitchCallbackRef.current(targetVideo);
      }

      console.log(`Switched to video ${videoNumber}`);
    }
  }, []);

  // Function to register video switch callback from Model
  const registerVideoSwitchCallback = useCallback(
    (callback: (video: HTMLVideoElement) => void) => {
      videoSwitchCallbackRef.current = callback;
    },
    []
  );

  useEffect(() => {
    const videoUrls = VIDEO_URLS;
    let loadedCount = 0;

    videoUrls.forEach((url, index) => {
      const videoNumber = index + 1;
      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      
      video.onloadeddata = () => {
        loadedCount++;
        console.log(`Video ${videoNumber} loaded successfully`);
        
        if (loadedCount === videoUrls.length) {
          setVideosLoaded(true);
          // Start with video 1 immediately
          const firstVideo = videosRef.current[1];
          if (firstVideo) {
            currentVideoRef.current = firstVideo;
            firstVideo.play().catch(() => {});
          }
        }
      };
      
      video.onerror = (error) => {
        console.warn(`Video ${videoNumber} failed to load:`, error);
      };
      
      videosRef.current[videoNumber] = video;
      video.load();
    });

    return () => {
      // Safely clean up videos
      Object.values(videosRef.current).forEach(video => {
        if (video) {
          video.pause();
          video.src = '';
        }
      });
      videosRef.current = {};
    };
  }, [videosLoaded]);

  // Memoize the onLoaded callback to prevent Model re-renders
  const handleModelLoaded = useMemo(() => () => setModelLoaded(true), []);

  // Memoize Canvas props to prevent re-creation
  const canvasProps = useMemo(() => ({
    shadows: true,
    eventPrefix: "client" as const
  }), []);

  // Create a state for current video to trigger re-renders
  const [currentVideo, setCurrentVideo] = useState<HTMLVideoElement | null>(null);

  // Update current video state when videos are loaded
  useEffect(() => {
    if (videosLoaded && videosRef.current[1]) {
      setCurrentVideo(videosRef.current[1]);
      currentVideoRef.current = videosRef.current[1];
    }
  }, [videosLoaded]);

  // Memoize Model props to prevent unnecessary re-renders
  const modelProps = useMemo(() => ({
    scroll,
    videoElement: currentVideo,
    videoLoaded: videosLoaded,
    onLoaded: handleModelLoaded,
    onRegisterVideoSwitchCallback: registerVideoSwitchCallback,
  }), [scroll, currentVideo, videosLoaded, handleModelLoaded, registerVideoSwitchCallback]);

  // Memoize Overlay props to prevent unnecessary re-renders  
  const overlayProps = useMemo(() => ({
    scroll,
    onVideoChange: switchVideo,
  }), [scroll, switchVideo]);

  return (
    <>
      <Canvas {...canvasProps}>
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <MemoizedModel {...modelProps} />
        </Suspense>
      </Canvas>
      {modelLoaded && (
        <MemoizedOverlay
          ref={overlay}
          {...overlayProps}
        />
      )}
    </>
  );
}
