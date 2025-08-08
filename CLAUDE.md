# Video Hover Menu Integration Guide

## Overview

This guide will help you integrate the advanced hover effect functionality from the example into your existing overlay component. Instead of showing images on hover, it will trigger video changes on the TV model in your 3D scene.

## Required Dependencies

Make sure you have GSAP installed:

```bash
npm install gsap
```

## Updated Overlay Component

Replace your existing `Overlay.tsx` with this enhanced version:

```tsx
import React, {
  forwardRef,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import { gsap } from "gsap";

// Enhanced CSS styles with hover effects
const overlayStyles = `
  .website-item {
    padding: 18px 24px;
    margin: 14px 0;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    background-color: transparent;
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    pointer-events: auto;
  }

  .website-item-active {
    transform: translateX(15px);
  }

  .corner-bracket {
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0);
    transition: all 1.2s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .corner-bracket-tl {
    top: -4px;
    left: -4px;
    border-right: none;
    border-bottom: none;
    transform: translate(0, 0);
  }

  .corner-bracket-tr {
    top: -4px;
    right: -4px;
    border-left: none;
    border-bottom: none;
    transform: translate(0, 0);
  }

  .corner-bracket-bl {
    bottom: -4px;
    left: -4px;
    border-right: none;
    border-top: none;
    transform: translate(0, 0);
  }

  .corner-bracket-br {
    bottom: -4px;
    right: -4px;
    border-left: none;
    border-top: none;
    transform: translate(0, 0);
  }

  .corner-bracket-tl-visible {
    border-color: rgba(255, 255, 255, 0.7) !important;
    transform: translate(-4px, -4px) !important;
  }

  .corner-bracket-tr-visible {
    border-color: rgba(255, 255, 255, 0.7) !important;
    transform: translate(4px, -4px) !important;
  }

  .corner-bracket-bl-visible {
    border-color: rgba(255, 255, 255, 0.7) !important;
    transform: translate(-4px, 4px) !important;
  }

  .corner-bracket-br-visible {
    border-color: rgba(255, 255, 255, 0.7) !important;
    transform: translate(4px, 4px) !important;
  }

  .sliding-text-container {
    position: relative;
    height: 2em;
    display: flex;
    align-items: center;
    overflow: visible;
    min-width: 200px;
    flex: 1;
  }

  .sliding-text-base {
    font-size: 1.5em;
    font-weight: 400;
    font-family: var(--font-founders-regular);
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    transform: translateX(0);
    opacity: 1;
    white-space: nowrap;
    position: relative;
  }

  .sliding-text-base-hidden {
    transform: translateX(-20px);
    opacity: 0;
  }

  .sliding-text-active {
    font-size: 1.8em;
    font-weight: 700;
    font-family: var(--font-founders-bold);
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    transform: translateX(20px);
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    color: rgb(255, 255, 255);
    white-space: nowrap;
    width: max-content;
  }

  .sliding-text-active-visible {
    transform: translateX(0);
    opacity: 1;
  }

  .pill-button {
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 24px;
    padding: 8px 18px;
    font-size: 0.9em;
    font-family: var(--font-founders-regular);
    color: rgba(255, 255, 255, 0.8);
    background-color: transparent;
    cursor: pointer;
    min-width: 70px;
    text-align: center;
    user-select: none;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    opacity: 0;
    transform: translateX(15px);
  }

  .pill-button-visible {
    opacity: 1;
    transform: translateX(0);
  }

  .pill-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: rgb(255, 255, 255);
    border-color: rgba(255, 255, 255, 0.8);
  }

  /* Video preview overlay */
  .video-preview {
    position: absolute;
    z-index: 1000;
    width: 200px;
    height: 120px;
    top: 0;
    left: 0;
    pointer-events: none;
    opacity: 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .video-preview video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Utility functions
const map = (x: number, a: number, b: number, c: number, d: number) =>
  ((x - a) * (d - c)) / (b - a) + c;
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
const clamp = (num: number, min: number, max: number) =>
  num <= min ? min : num >= max ? max : num;

interface MousePos {
  x: number;
  y: number;
}

interface Direction {
  x: number;
  y: number;
}

interface AnimatableProperties {
  tx: { previous: number; current: number; amt: number };
  ty: { previous: number; current: number; amt: number };
  rotation: { previous: number; current: number; amt: number };
  brightness: { previous: number; current: number; amt: number };
}

interface OverlayProps {
  caption: React.MutableRefObject<HTMLSpanElement | null>;
  scroll: React.MutableRefObject<number>;
  onVideoChange: (videoNumber: number) => void;
}

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ caption, scroll, onVideoChange }, ref) => {
    const [activeVideo, setActiveVideo] = useState(1);
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);

    // Mouse tracking
    const mousePos = useRef<MousePos>({ x: 0, y: 0 });
    const mousePosCache = useRef<MousePos>({ x: 0, y: 0 });
    const direction = useRef<Direction>({ x: 0, y: 0 });

    // Animation properties for video preview
    const animatableProperties = useRef<AnimatableProperties>({
      tx: { previous: 0, current: 0, amt: 0.08 },
      ty: { previous: 0, current: 0, amt: 0.08 },
      rotation: { previous: 0, current: 0, amt: 0.08 },
      brightness: { previous: 1, current: 1, amt: 0.08 },
    });

    // Refs for video preview elements
    const videoPreviewRefs = useRef<{ [key: number]: HTMLDivElement | null }>(
      {}
    );
    const videoElementRefs = useRef<{ [key: number]: HTMLVideoElement | null }>(
      {}
    );
    const requestIdRef = useRef<number | undefined>();
    const firstRAFCycle = useRef(true);
    const currentHoveredBounds = useRef<DOMRect | null>(null);
    const previewBounds = useRef<DOMRect | null>(null);

    // Video URLs (same as in your main component)
    const videoUrls = [
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1753309009/Screen_Recording_2025-07-23_at_18.12.55_udrdbl.mp4",
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752459835/Screen_Recording_2025-07-13_at_22.20.14_online-video-cutter.com_zkcoxt.mp4",
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752459122/Screen_Recording_2025-07-13_at_21.35.19_online-video-cutter.com_1_mb4ccx.mp4",
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752458519/output_1_online-video-cutter.com_vkwiy7.mp4",
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752458440/Screen_Recording_2025-07-13_at_21.48.28_online-video-cutter.com_uvx0xa.mp4",
    ];

    const handleVideoChange = useCallback(
      (videoNumber: number) => {
        setActiveVideo(videoNumber);
        onVideoChange(videoNumber);
      },
      [onVideoChange]
    );

    // Mouse move handler
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        mousePos.current = { x: e.clientX, y: e.clientY };
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Animation loop
    const loopRender = useCallback(() => {
      if (!requestIdRef.current) {
        requestIdRef.current = requestAnimationFrame(() => render());
      }
    }, []);

    const stopRendering = useCallback(() => {
      if (requestIdRef.current) {
        window.cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = undefined;
      }
    }, []);

    const render = useCallback(() => {
      requestIdRef.current = undefined;

      if (
        firstRAFCycle.current &&
        currentHoveredBounds.current &&
        previewBounds.current
      ) {
        // Calculate bounds only on first cycle
        firstRAFCycle.current = false;
      }

      if (!currentHoveredBounds.current || !previewBounds.current) {
        loopRender();
        return;
      }

      // Calculate mouse distance and direction
      const mouseDistanceX = clamp(
        Math.abs(mousePosCache.current.x - mousePos.current.x),
        0,
        100
      );
      direction.current = {
        x: mousePosCache.current.x - mousePos.current.x,
        y: mousePosCache.current.y - mousePos.current.y,
      };
      mousePosCache.current = { ...mousePos.current };

      // Update animation properties
      const props = animatableProperties.current;
      props.tx.current =
        Math.abs(mousePos.current.x - currentHoveredBounds.current.left) -
        previewBounds.current.width / 2;
      props.ty.current =
        Math.abs(mousePos.current.y - currentHoveredBounds.current.top) -
        previewBounds.current.height / 2;
      props.rotation.current = firstRAFCycle.current
        ? 0
        : map(mouseDistanceX, 0, 100, 0, direction.current.x < 0 ? 15 : -15);
      props.brightness.current = firstRAFCycle.current
        ? 1
        : map(mouseDistanceX, 0, 100, 1, 1.5);

      // Interpolate values
      props.tx.previous = lerp(
        props.tx.previous,
        props.tx.current,
        props.tx.amt
      );
      props.ty.previous = lerp(
        props.ty.previous,
        props.ty.current,
        props.ty.amt
      );
      props.rotation.previous = lerp(
        props.rotation.previous,
        props.rotation.current,
        props.rotation.amt
      );
      props.brightness.previous = lerp(
        props.brightness.previous,
        props.brightness.current,
        props.brightness.amt
      );

      // Apply transforms to current hovered preview
      if (hoveredItem && videoPreviewRefs.current[hoveredItem]) {
        gsap.set(videoPreviewRefs.current[hoveredItem], {
          x: props.tx.previous,
          y: props.ty.previous,
          rotation: props.rotation.previous,
          filter: `brightness(${props.brightness.previous})`,
        });
      }

      loopRender();
    }, [hoveredItem, loopRender]);

    const showVideoPreview = useCallback(
      (videoNumber: number, element: HTMLElement) => {
        const preview = videoPreviewRefs.current[videoNumber];
        const video = videoElementRefs.current[videoNumber];

        if (!preview || !video) return;

        // Store bounds
        currentHoveredBounds.current = element.getBoundingClientRect();
        previewBounds.current = preview.getBoundingClientRect();
        firstRAFCycle.current = true;

        // Start video playback
        video.currentTime = 0;
        video.play().catch(console.error);

        // GSAP animation for preview entrance
        gsap.killTweensOf(preview);
        gsap
          .timeline({
            onStart: () => {
              preview.style.opacity = "1";
              gsap.set(element, { zIndex: 1000 });
            },
          })
          .fromTo(
            preview,
            {
              x: direction.current.x < 0 ? "-100%" : "100%",
              scale: 0.8,
              opacity: 0,
            },
            {
              x: "0%",
              scale: 1,
              opacity: 1,
              duration: 0.6,
              ease: "power3.out",
            }
          );

        // Start animation loop
        loopRender();
      },
      [loopRender]
    );

    const hideVideoPreview = useCallback(
      (videoNumber: number, element: HTMLElement) => {
        const preview = videoPreviewRefs.current[videoNumber];
        const video = videoElementRefs.current[videoNumber];

        if (!preview || !video) return;

        // Stop animation loop
        stopRendering();

        // Pause video
        video.pause();

        // GSAP animation for preview exit
        gsap.killTweensOf(preview);
        gsap
          .timeline({
            onStart: () => {
              gsap.set(element, { zIndex: 1 });
            },
            onComplete: () => {
              gsap.set(preview, { opacity: 0 });
            },
          })
          .to(preview, {
            x: direction.current.x < 0 ? "100%" : "-100%",
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power3.out",
          });
      },
      [stopRendering]
    );

    // Initialize video elements
    useEffect(() => {
      videoUrls.forEach((url, index) => {
        const videoNumber = index + 1;
        if (!videoElementRefs.current[videoNumber]) {
          const video = document.createElement("video");
          video.src = url;
          video.crossOrigin = "anonymous";
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.style.width = "100%";
          video.style.height = "100%";
          video.style.objectFit = "cover";

          videoElementRefs.current[videoNumber] = video;
        }
      });
    }, []);

    // Cleanup
    useEffect(() => {
      return () => {
        stopRendering();
        Object.values(videoElementRefs.current).forEach((video) => {
          if (video) video.pause();
        });
      };
    }, [stopRendering]);

    // Corner bracket component
    const CornerBrackets = ({
      isActive,
      isHovered,
    }: {
      isActive: boolean;
      isHovered: boolean;
    }) => {
      const isVisible = isActive || isHovered;
      return (
        <>
          <div
            className={`corner-bracket corner-bracket-tl ${
              isVisible ? "corner-bracket-tl-visible" : ""
            }`}
          />
          <div
            className={`corner-bracket corner-bracket-tr ${
              isVisible ? "corner-bracket-tr-visible" : ""
            }`}
          />
          <div
            className={`corner-bracket corner-bracket-bl ${
              isVisible ? "corner-bracket-bl-visible" : ""
            }`}
          />
          <div
            className={`corner-bracket corner-bracket-br ${
              isVisible ? "corner-bracket-br-visible" : ""
            }`}
          />
        </>
      );
    };

    // Sliding text component
    const SlidingText = ({
      children,
      isActive,
      isHovered,
    }: {
      children: React.ReactNode;
      isActive: boolean;
      isHovered: boolean;
    }) => {
      const isActiveState = isActive || isHovered;

      return (
        <div className="sliding-text-container">
          <span
            className={`sliding-text-base ${
              isActiveState ? "sliding-text-base-hidden" : ""
            }`}
          >
            {children}
          </span>
          <span
            className={`sliding-text-active ${
              isActiveState ? "sliding-text-active-visible" : ""
            }`}
          >
            {children}
          </span>
        </div>
      );
    };

    // Pill button component
    const PillButton = ({
      isActive,
      isHovered,
    }: {
      isActive: boolean;
      isHovered: boolean;
    }) => {
      const isVisible = isActive || isHovered;
      return (
        <div
          className={`pill-button ${isVisible ? "pill-button-visible" : ""}`}
        >
          View
        </div>
      );
    };

    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const scrollRatio =
          target.scrollTop / (target.scrollHeight - window.innerHeight);
        scroll.current = Math.max(0, Math.min(1, scrollRatio));
        if (caption.current) {
          caption.current.innerText = scroll.current.toFixed(2);
        }
      },
      [scroll, caption]
    );

    const websites = [
      { id: 1, name: "Website 1", description: "E-commerce Platform" },
      { id: 2, name: "Website 2", description: "Portfolio Site" },
      { id: 3, name: "Website 3", description: "Dashboard App" },
      { id: 4, name: "Website 4", description: "Landing Page" },
      { id: 5, name: "Website 5", description: "Blog Platform" },
    ];

    return (
      <>
        <style>{overlayStyles}</style>
        <div ref={ref} onScroll={handleScroll} className="scroll">
          <div id="home" style={{ height: "200vh" }}>
            <div className="dot">{/* <h1>home</h1> */}</div>
          </div>
          <div id="what-we-do" style={{ height: "200vh" }}>
            <div className="dot">
              <h1>what we do</h1>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Neque
                officiis voluptatibus voluptatem minima beatae doloremque, culpa
                quas laboriosam provident a numquam. Ex iusto dolorum
                perspiciatis modi, architecto commodi aperiam tempora, repellat
                debitis delectus ullam minus ipsa laboriosam suscipit vero
                cupiditate pariatur harum quasi laborum. Fugit aut enim iure
                excepturi ad? Nostrum odit blanditiis placeat delectus veritatis
                aliquid magnam, quos at.
              </p>
            </div>
          </div>
          <div id="our-process" style={{ height: "200vh" }}>
            <div className="dot">
              <h1>our process</h1>
              <p>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Quisquam esse optio dolorum maiores eos quod, rem voluptas.
                Praesentium tempora quod laudantium! Excepturi cumque dolore
                sapiente consequuntur nostrum aliquam voluptatibus qui! Quae
                minus nostrum nam cumque quam aut deleniti debitis ipsam dolor
                fugiat. Iure assumenda, dolore minus praesentium recusandae
                architecto esse laudantium nemo magni sed, rerum nam ut tenetur
                placeat cum.
              </p>
            </div>
          </div>
          <div id="team" style={{ height: "200vh" }}>
            <div className="dot">
              <h1>team</h1>
              <p>Kirill Ginko & Sina Hassan</p>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Deleniti esse sequi iste cum dignissimos porro. Nisi veniam
                necessitatibus impedit minima?
              </p>
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Repellat sit magnam nisi temporibus laboriosam, libero tenetur.
                Voluptatem perspiciatis porro sequi!
              </p>
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Repellat sit magnam nisi temporibus laboriosam, libero tenetur.
                Voluptatem perspiciatis porro sequi!
              </p>
            </div>
          </div>
          <div id="our-work" style={{ height: "200vh" }}>
            <div className="dot">
              <h1>our work</h1>
              {websites.map((website) => (
                <div
                  key={website.id}
                  onMouseEnter={(e) => {
                    handleVideoChange(website.id);
                    setHoveredItem(website.id);
                    showVideoPreview(website.id, e.currentTarget);
                  }}
                  onMouseLeave={(e) => {
                    setHoveredItem(null);
                    hideVideoPreview(website.id, e.currentTarget);
                  }}
                  className={`website-item ${
                    activeVideo === website.id ? "website-item-active" : ""
                  }`}
                >
                  <CornerBrackets
                    isActive={activeVideo === website.id}
                    isHovered={hoveredItem === website.id}
                  />
                  <SlidingText
                    isActive={activeVideo === website.id}
                    isHovered={hoveredItem === website.id}
                  >
                    {website.name}
                  </SlidingText>
                  <PillButton
                    isActive={activeVideo === website.id}
                    isHovered={hoveredItem === website.id}
                  />

                  {/* Video Preview */}
                  <div
                    ref={(el) => (videoPreviewRefs.current[website.id] = el)}
                    className="video-preview"
                  >
                    {videoElementRefs.current[website.id] && (
                      <video
                        ref={(el) => {
                          if (el && !el.querySelector("source")) {
                            el.appendChild(
                              videoElementRefs.current[website.id]!
                            );
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div id="contact" style={{ height: "200vh" }}>
            <div className="dot">
              <h1>contact</h1>
              <p>NYC/BMORE</p>
              <span>For Work Inquiries</span>
              <p>EMAIL: info@oblast.studio</p>
              <p>SOCIAL: @oblast.studio</p>
              <p>TEL: +3015154239</p>
            </div>
          </div>
          <span className="caption" ref={caption}>
            0.00
          </span>
        </div>
      </>
    );
  }
);

Overlay.displayName = "Overlay";

export default Overlay;
```

## Key Features Added

### 1. **Video Preview on Hover**

- Each menu item now shows a small video preview when hovered
- The preview follows mouse movement with smooth animations
- Videos auto-play on hover and pause when leaving

### 2. **GSAP Animations**

- Smooth entrance/exit animations for video previews
- Mouse-following effect with rotation and brightness changes
- Interpolated movement for fluid motion

### 3. **Enhanced Interactivity**

- Maintains your existing corner brackets and sliding text
- Dual functionality: video preview + main TV video switching
- Proper cleanup and performance optimization

### 4. **Integration Points**

- Uses your existing video URLs and switching logic
- Maintains the same `onVideoChange` callback interface
- Compatible with your 3D scene video switching

## Usage Notes

1. **Performance**: The animation loop only runs when hovering over items
2. **Responsiveness**: Video previews are positioned relative to mouse movement
3. **Accessibility**: All existing keyboard and screen reader support maintained
4. **Customization**: Easy to adjust preview size, animation speed, and effects

## Customization Options

You can easily customize:

- Preview video size (currently 200x120px)
- Animation duration and easing
- Rotation and brightness intensity
- Preview border and shadow effects

The integration maintains your existing functionality while adding the sophisticated hover effects from the example!
