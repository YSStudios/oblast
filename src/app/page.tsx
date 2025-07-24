"use client"

import React, { Suspense, useRef, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import Model from "../components/Model"
import Overlay from "../components/Overlay"

export default function Home() {
  const overlay = useRef()
  const caption = useRef()
  const scroll = useRef(0)
  const videoRef = useRef()
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    // Create video element
    const video = document.createElement('video')
    video.src = 'https://res.cloudinary.com/dtps5ugbf/video/upload/v1753309009/Screen_Recording_2025-07-23_at_18.12.55_udrdbl.mp4'
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    
    // Set video loading handlers
    video.onloadeddata = () => {
      console.log('Video loaded successfully')
      setVideoLoaded(true)
      video.play().catch(console.error)
    }
    
    video.onerror = (error) => {
      console.error('Video loading error:', error)
    }
    
    videoRef.current = video
    
    // Start loading the video
    video.load()
    
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current = null
      }
    }
  }, [])

  return (
    <>
      <Canvas shadows eventPrefix="client">
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <Model 
            scroll={scroll} 
            videoElement={videoRef.current} 
            videoLoaded={videoLoaded} 
          />
        </Suspense>
      </Canvas>
      <Overlay ref={overlay} caption={caption} scroll={scroll} />
    </>
  )
}
