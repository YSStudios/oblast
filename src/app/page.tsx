"use client"

import React, { Suspense, useRef, useEffect, useState, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import Model from "../components/Model"
import Overlay from "../components/Overlay"

export default function Home() {
  const overlay = useRef<HTMLDivElement>(null)
  const caption = useRef<HTMLSpanElement>(null)
  const scroll = useRef(0)
  const videosRef = useRef<{[key: number]: HTMLVideoElement}>({})
  const currentVideoRef = useRef<HTMLVideoElement | null>(null)
  const [videosLoaded, setVideosLoaded] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const videoSwitchCallbackRef = useRef<((video: HTMLVideoElement) => void) | null>(null)
  
  // Function to switch video without any React state changes
  const switchVideo = useCallback((videoNumber: number) => {
    const targetVideo = videosRef.current[videoNumber]
    if (targetVideo && targetVideo !== currentVideoRef.current) {
      currentVideoRef.current = targetVideo
      targetVideo.currentTime = 0
      targetVideo.play().catch(console.error)
      
      // Notify the shader to update texture
      if (videoSwitchCallbackRef.current) {
        videoSwitchCallbackRef.current(targetVideo)
      }
      
      console.log(`Switched to video ${videoNumber}`)
    }
  }, [])

  // Function to register video switch callback from Model
  const registerVideoSwitchCallback = useCallback((callback: (video: HTMLVideoElement) => void) => {
    videoSwitchCallbackRef.current = callback
  }, [])

  useEffect(() => {
    // Preload all videos using Cloudinary URLs
    const videoUrls = [
      'https://res.cloudinary.com/dtps5ugbf/video/upload/v1753309009/Screen_Recording_2025-07-23_at_18.12.55_udrdbl.mp4',
      'https://res.cloudinary.com/dtps5ugbf/video/upload/v1752459835/Screen_Recording_2025-07-13_at_22.20.14_online-video-cutter.com_zkcoxt.mp4',
      'https://res.cloudinary.com/dtps5ugbf/video/upload/v1752459122/Screen_Recording_2025-07-13_at_21.35.19_online-video-cutter.com_1_mb4ccx.mp4',
      'https://res.cloudinary.com/dtps5ugbf/video/upload/v1752458519/output_1_online-video-cutter.com_vkwiy7.mp4',
      'https://res.cloudinary.com/dtps5ugbf/video/upload/v1752458440/Screen_Recording_2025-07-13_at_21.48.28_online-video-cutter.com_uvx0xa.mp4'
    ]
    let loadedCount = 0
    
    videoUrls.forEach((url, index) => {
      const videoNumber = index + 1
      const video = document.createElement('video')
      video.src = url
      video.crossOrigin = 'anonymous'
      video.loop = true
      video.muted = true
      video.playsInline = true
      
      video.onloadeddata = () => {
        loadedCount++
        console.log(`Video ${videoNumber} loaded successfully`)
        
        if (loadedCount === videoUrls.length) {
          setVideosLoaded(true)
          // Start with video 1
          currentVideoRef.current = videosRef.current[1]
          currentVideoRef.current.play().catch(console.error)
        }
      }
      
      video.onerror = (error) => {
        console.error(`Video ${videoNumber} loading error:`, error)
      }
      
      videosRef.current[videoNumber] = video
      video.load()
    })
    
    return () => {
      Object.values(videosRef.current).forEach(video => {
        video.pause()
      })
      videosRef.current = {}
    }
  }, [])

  return (
    <>
      <Canvas shadows eventPrefix="client">
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <Model 
            scroll={scroll} 
            videoElement={currentVideoRef.current} 
            videoLoaded={videosLoaded}
            onLoaded={() => setModelLoaded(true)}
            onRegisterVideoSwitchCallback={registerVideoSwitchCallback}
          />
        </Suspense>
      </Canvas>
      {modelLoaded && <Overlay ref={overlay} caption={caption} scroll={scroll} onVideoChange={switchVideo} />}
    </>
  )
}
