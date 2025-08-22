import React, { forwardRef, useCallback, useRef, memo, useMemo, useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { gsap } from "gsap";
import { motion, useScroll, useTransform } from "framer-motion";
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
    
    // Calculate process section scroll progress manually using existing scroll
    const [processProgress, setProcessProgress] = useState(0);
    
    useEffect(() => {
      // Calculate when we're in the process section - complete earlier
      const processStart = 0.35;  // Process section starts at 35% of page
      const processEnd = 0.5;     // Process section ends at 50% of page (complete earlier)
      
      const currentProgress = Math.max(0, Math.min(1, 
        (scroll.current - processStart) / (processEnd - processStart)
      ));
      
      setProcessProgress(currentProgress);
    }, [scroll, scrollProgress]);
    
    // Calculate ribbon positions based on process progress with diagonal animation
    const calculateRibbonTransform = (index: number, progress: number) => {
      const delay = index * 0.06; // Reduce delay for faster stagger
      const ribbonProgress = Math.max(0, Math.min(1, (progress - delay) / 0.35)); // Faster completion
      
      // Each ribbon has different angles and entry points - matching CSS
      const angles = [-12, 8, -6, -10]; // Matching CSS rotation values
      const angle = angles[index];
      
      // Calculate diagonal entry point based on angle - start completely offscreen
      const diagonalX = -1500 + (ribbonProgress * 1500); // Slide in from completely offscreen
      const diagonalY = Math.sin(angle * Math.PI / 180) * 30 * (1 - ribbonProgress); // Slight Y movement
      
      return {
        x: diagonalX,
        y: diagonalY,
        opacity: 1, // Keep ribbons fully visible
        rotate: angle // Keep the rotation angle
      };
    };
    
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
            <div className="dot fullwidth nopadding">
              <h1 className="heading-padding">our process</h1>
              <div className={styles.ourProcessContent}>
                <div className={styles.processRibbons}>
                  {["Discover", "Design", "Build", "Launch"].map((title, index) => {
                    // Hide the Build ribbon since we have it in 3D
                    if (title === "Build") return null;
                    
                    const ribbonTransform = calculateRibbonTransform(index, processProgress);
                    
                    // Create repeating text pattern
                    const repeatingText = Array(15).fill(title).join(" • ");
                    
                    return (
                      <motion.div
                        key={title}
                        className={styles.processRibbon}
                        animate={{ 
                          x: ribbonTransform.x,
                          y: ribbonTransform.y,
                          opacity: ribbonTransform.opacity,
                          rotate: ribbonTransform.rotate
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 25,
                          mass: 1,
                          duration: 0.1
                        }}
                        initial={{ 
                          x: 0, 
                          y: 50, 
                          opacity: 1, 
                          rotate: ribbonTransform.rotate 
                        }}
                      >
                        <span className={styles.ribbonTitle}>{repeatingText}</span>
                      </motion.div>
                    );
                  })}
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
