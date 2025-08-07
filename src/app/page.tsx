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
    // Preload all videos
    const videoNumbers = [1, 2, 3]
    let loadedCount = 0
    
    videoNumbers.forEach(num => {
      const video = document.createElement('video')
      video.src = `/videos/video${num}.mp4`
      video.crossOrigin = 'anonymous'
      video.loop = true
      video.muted = true
      video.playsInline = true
      
      video.onloadeddata = () => {
        loadedCount++
        console.log(`Video ${num} loaded successfully`)
        
        if (loadedCount === videoNumbers.length) {
          setVideosLoaded(true)
          // Start with video 1
          currentVideoRef.current = videosRef.current[1]
          currentVideoRef.current.play().catch(console.error)
        }
      }
      
      video.onerror = (error) => {
        console.error(`Video ${num} loading error:`, error)
      }
      
      videosRef.current[num] = video
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
