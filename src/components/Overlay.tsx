import React, { forwardRef, useCallback, useRef, memo, useMemo, useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { gsap } from "gsap";
import styles from "../styles/Overlay.module.css";
import { useVideoHover } from "../hooks/useVideoHover";
import { VIDEO_URLS } from "../config/videos";

interface OverlayProps {
  scroll: React.MutableRefObject<number>;
  onVideoChange: (videoNumber: number) => void;
}

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ scroll, onVideoChange }, ref) => {
    const [scrollProgress, setScrollProgress] = useState(0);
    
    // Refs for process section animations
    const processGridRef = useRef<HTMLDivElement>(null);
    const processItemRefs = useRef<HTMLDivElement[]>([]);
    const processTimelineRef = useRef<gsap.core.Timeline | null>(null);
    
    // Memoize hook options to prevent unnecessary re-creations
    const videoHoverOptions = useMemo(
      () => ({
        videoUrls: VIDEO_URLS,
        onVideoChange,
      }),
      [onVideoChange]
    );

    // Use the custom hook
    const {
      activeVideo,
      hoveredItem,
      handleMouseEnter,
      handleMouseLeave,
    } = useVideoHover(videoHoverOptions);

    // Initialize process section timeline
    useEffect(() => {
      if (processItemRefs.current.length === 4 && !processTimelineRef.current) {
        // Create timeline for scroll-based animations
        const tl = gsap.timeline({ paused: true });
        
        // Set initial states
        gsap.set(processItemRefs.current, {
          opacity: 0,
          y: 60,
          scale: 0.9
        });

        // Add staggered animations to timeline
        tl.to(processItemRefs.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: "power3.out"
        }, 0);

        // Add floating animations for pills
        processItemRefs.current.forEach((item, index) => {
          const pill = item.querySelector(`.${styles.processPill}`);
          if (pill) {
            tl.to(pill, {
              y: -5,
              duration: 0.3,
              ease: "power2.out"
            }, index * 0.1 + 0.2);
          }
        });

        processTimelineRef.current = tl;
      }

      // Cleanup timeline on unmount
      return () => {
        if (processTimelineRef.current) {
          processTimelineRef.current.kill();
          processTimelineRef.current = null;
        }
      };
    }, []);

    // Update animations based on scroll progress
    useEffect(() => {
      if (processTimelineRef.current) {
        // Calculate scroll progress for the process section
        // Assuming the process section starts around scroll 0.4 (40% down the page)
        // and should be fully animated by scroll 0.6 (60% down the page)
        const processStart = 0.4;
        const processEnd = 0.5;
        const processProgress = Math.max(0, Math.min(1, 
          (scroll.current - processStart) / (processEnd - processStart)
        ));

        // Update timeline progress
        processTimelineRef.current.progress(processProgress);
      }
    }, [scrollProgress, scroll]);

    // Process item hover animations
    const handleProcessItemHover = useCallback((index: number, isEntering: boolean) => {
      const item = processItemRefs.current[index];
      if (!item) return;

      const pill = item.querySelector(`.${styles.processPill}`);
      const description = item.querySelector(`.${styles.processDescription}`);

      if (isEntering) {
        // Hover in animation
        gsap.to(item, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(pill, {
          scale: 1.1,
          rotationY: 5,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(description, {
          opacity: 0.8,
          duration: 0.2,
          ease: "power2.out"
        });
      } else {
        // Hover out animation
        gsap.to(item, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(pill, {
          scale: 1,
          rotationY: 0,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(description, {
          opacity: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      }
    }, []);

    // Memoized corner bracket component
    const CornerBrackets = memo(
      ({ isActive, isHovered }: { isActive: boolean; isHovered: boolean }) => {
        const isVisible = isActive || isHovered;
        return (
          <>
            <div
              className={`${styles.cornerBracket} ${styles.cornerBracketTl} ${
                isVisible ? styles.cornerBracketTlVisible : ""
              }`}
            />
            <div
              className={`${styles.cornerBracket} ${styles.cornerBracketTr} ${
                isVisible ? styles.cornerBracketTrVisible : ""
              }`}
            />
            <div
              className={`${styles.cornerBracket} ${styles.cornerBracketBl} ${
                isVisible ? styles.cornerBracketBlVisible : ""
              }`}
            />
            <div
              className={`${styles.cornerBracket} ${styles.cornerBracketBr} ${
                isVisible ? styles.cornerBracketBrVisible : ""
              }`}
            />
          </>
        );
      }
    );
    CornerBrackets.displayName = "CornerBrackets";

    // Memoized sliding text component
    const SlidingText = memo(
      ({
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
          <div className={styles.slidingTextContainer}>
            <span
              className={`${styles.slidingTextBase} ${
                isActiveState ? styles.slidingTextBaseHidden : ""
              }`}
            >
              {children}
            </span>
            <span
              className={`${styles.slidingTextActive} ${
                isActiveState ? styles.slidingTextActiveVisible : ""
              }`}
            >
              {children}
            </span>
          </div>
        );
      }
    );
    SlidingText.displayName = "SlidingText";

    // Memoized pill button component
    const PillButton = memo(
      ({ isActive, isHovered }: { isActive: boolean; isHovered: boolean }) => {
        const isVisible = isActive || isHovered;
        return (
          <div
            className={`${styles.pillButton} ${
              isVisible ? styles.pillButtonVisible : ""
            }`}
          >
            View
          </div>
        );
      }
    );
    PillButton.displayName = "PillButton";

    // Memoize website IDs array to prevent re-creation
    const websiteIds = useMemo(() => [1, 2, 3, 4, 5], []);

    const lastScrollTime = useRef<number>(0);

    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const now = performance.now();

        // Throttle scroll handling to ~60fps max
        if (now - lastScrollTime.current < 16) {
          return;
        }
        lastScrollTime.current = now;

        const target = e.target as HTMLDivElement;
        const scrollRatio =
          target.scrollTop / (target.scrollHeight - window.innerHeight);
        scroll.current = Math.max(0, Math.min(1, scrollRatio));

        // Update progress line
        setScrollProgress(scroll.current);
      },
      [scroll]
    );

    return (
      <>
        {/* Marquee at top of viewport */}
        <div className={styles.marqueeContainer}>
          <Marquee speed={50} gradient={false}>
            <div className={styles.marqueeText}>
              OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;
            </div>
          </Marquee>
        </div>

        {/* Progress line */}
        <div className={styles.progressLineContainer}>
          <div 
            className={styles.progressLine}
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>

        {/* Global video previews container - DISABLED */}
        {/* <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          {websiteIds.map((websiteId) => (
            <div
              key={websiteId}
              ref={(el) => {
                videoPreviewRefs.current[websiteId] = el;
              }}
              className={styles.videoPreview}
            >
              <video
                crossOrigin="anonymous"
                loop
                muted
                playsInline
                preload="none"
                data-src={VIDEO_URLS[websiteId - 1]}
              />
            </div>
          ))}
        </div> */}

        <div ref={ref} onScroll={handleScroll} className="scroll">
          <div id="home" style={{ height: "200vh" }}>
            <div className="dot">
              {/* <h1>home</h1> */}
              {/* Virtual reality (VR) is a simulated experience that can be similar to or completely different from the real world. */}
            </div>
          </div>
          <div id="what-we-do" style={{ height: "200vh" }}>
            <div className="dot fullwidth">
              <h1>what we do</h1>
              <div className={styles.whatWeDoContent}>
                <div className={styles.logoSection}>
                  <div className={styles.logo}>◐◐◐</div>
                </div>
                <div className={styles.mainContent}>
                  <div className={styles.brandNameLine}>
                    <span className={styles.brandName}>OBLAST STUDIO</span>
                    <div className={styles.servicesPill}>
                      BRANDING, WEB DESIGN, PRODUCT DESIGN, CREATIVE DEVELOPMENT
                    </div>
                    <span className={styles.fromConcept}>
                      from first concept
                    </span>
                  </div>
                  <div className={styles.flowingText}>
                    <span className={styles.mainFlow}>
                      to final build, we handle the details{" "}
                      <span className={styles.arrow}>⟶</span>{" "}
                      <span className={styles.highlighted}>
                        design, development, and everything ( in between ){" "}
                      </span>
                      . Whether it&apos;s a brand-new product or a smarter evolution
                      of what&apos;s already working, we craft digital experiences
                      that are as{" "}
                      <span className={styles.highlighted}>
                        seamless as they are intentional.
                      </span>
                      <div className={styles.blackCircleArrow}>
                        <span className={styles.leftArrow}>←</span>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="our-process" style={{ height: "200vh" }}>
            <div className="dot fullwidth">
              <h1>our process</h1>
              <div className={styles.ourProcessContent}>
                <div ref={processGridRef} className={styles.processGrid}>
                  <div className={styles.processRow}>
                    <div 
                      ref={(el) => { if (el) processItemRefs.current[0] = el; }}
                      className={styles.processItem}
                      onMouseEnter={() => handleProcessItemHover(0, true)}
                      onMouseLeave={() => handleProcessItemHover(0, false)}
                    >
                      <div className={styles.processPill}>
                        <span className={styles.processTitle}>Discover</span>
                      </div>
                      <div className={styles.processDescription}>
                        We start by understanding your vision, goals, and challenges through deep research and strategic thinking.
                      </div>
                    </div>
                    <div 
                      ref={(el) => { if (el) processItemRefs.current[1] = el; }}
                      className={styles.processItem}
                      onMouseEnter={() => handleProcessItemHover(1, true)}
                      onMouseLeave={() => handleProcessItemHover(1, false)}
                    >
                      <div className={styles.processPill}>
                        <span className={styles.processTitle}>Build</span>
                      </div>
                      <div className={styles.processDescription}>
                        We bring designs to life with clean, scalable code and cutting-edge technology that performs flawlessly.
                      </div>
                    </div>
                  </div>
                  <div className={styles.processRow}>
                    <div 
                      ref={(el) => { if (el) processItemRefs.current[2] = el; }}
                      className={styles.processItem}
                      onMouseEnter={() => handleProcessItemHover(2, true)}
                      onMouseLeave={() => handleProcessItemHover(2, false)}
                    >
                      <div className={styles.processPill}>
                        <span className={styles.processTitle}>Launch</span>
                      </div>
                      <div className={styles.processDescription}>
                        We ensure a smooth deployment and provide ongoing support to keep your digital presence thriving.
                      </div>
                    </div>
                    <div 
                      ref={(el) => { if (el) processItemRefs.current[3] = el; }}
                      className={styles.processItem}
                      onMouseEnter={() => handleProcessItemHover(3, true)}
                      onMouseLeave={() => handleProcessItemHover(3, false)}
                    >
                      <div className={styles.processPill}>
                        <span className={styles.processTitle}>Design</span>
                      </div>
                      <div className={styles.processDescription}>
                        We craft intuitive, beautiful interfaces that tell your story and create meaningful user experiences.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              {websiteIds.map((websiteId) => (
                <div
                  key={websiteId}
                  onMouseEnter={() => {
                    handleMouseEnter(websiteId);
                  }}
                  onMouseLeave={() => {
                    handleMouseLeave();
                  }}
                  className={`${styles.websiteItem} ${
                    activeVideo === websiteId ? styles.websiteItemActive : ""
                  }`}
                >
                  <CornerBrackets
                    isActive={activeVideo === websiteId}
                    isHovered={hoveredItem === websiteId}
                  />
                  <SlidingText
                    isActive={activeVideo === websiteId}
                    isHovered={hoveredItem === websiteId}
                  >
                    Website {websiteId}
                  </SlidingText>
                  <PillButton
                    isActive={activeVideo === websiteId}
                    isHovered={hoveredItem === websiteId}
                  />
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

        </div>
      </>
    );
  }
);

Overlay.displayName = "Overlay";

// Memoize the component to prevent unnecessary re-renders
export default memo(Overlay, (prevProps, nextProps) => {
  return (
    prevProps.scroll === nextProps.scroll &&
    prevProps.onVideoChange === nextProps.onVideoChange
  );
});
