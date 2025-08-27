import React, { forwardRef, useCallback, useRef, memo, useMemo, useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { gsap } from "gsap";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
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
    
    // Create motion values with light springs for smooth animation with natural release
    const ribbonX1 = useMotionValue(-1500);
    const ribbonX2 = useMotionValue(-1500);
    const ribbonX3 = useMotionValue(-1500);
    const ribbonX4 = useMotionValue(-2500); // Discover starts further
    
    const ribbonMotionValues = useMemo(() => [ribbonX1, ribbonX2, ribbonX3, ribbonX4], [ribbonX1, ribbonX2, ribbonX3, ribbonX4]);
    
    // Create very light springs for natural release after scrolling stops
    const smoothX1 = useSpring(ribbonX1, { damping: 25, stiffness: 300, mass: 0.3 });
    const smoothX2 = useSpring(ribbonX2, { damping: 25, stiffness: 300, mass: 0.3 });
    const smoothX3 = useSpring(ribbonX3, { damping: 25, stiffness: 300, mass: 0.3 });
    const smoothX4 = useSpring(ribbonX4, { damping: 25, stiffness: 300, mass: 0.3 });
    
    const smoothRibbons = useMemo(() => [smoothX1, smoothX2, smoothX3, smoothX4], [smoothX1, smoothX2, smoothX3, smoothX4]);
    
    useEffect(() => {
      // Calculate when we're in the process section - start earlier, end much sooner
      const processStart = 0.35;  // Process section starts at 25% of page (earlier)
      const processEnd = 0.5;     // Process section ends at 40% of page (much sooner)
      
      const currentProgress = Math.max(0, Math.min(1, 
        (scroll.current - processStart) / (processEnd - processStart)
      ));
      
      setProcessProgress(currentProgress);
      
      // Update each ribbon's motion value with their individual progress
      ribbonMotionValues.forEach((mv, index) => {
        const delays = [0.15, 0.06, 0.12, 0.18];
        const speeds = [0.5, 0.6, 0.4, 0.7];
        const delay = delays[index];
        const speed = speeds[index];
        const ribbonProgress = Math.max(0, Math.min(1, (currentProgress - delay) / speed));
        
        const startX = index === 3 ? -2500 : -1500; // Index 3 is Discover (4th ribbon)
        const endX = window.innerWidth + 1000;
        const diagonalX = startX + (ribbonProgress * (endX - startX));
        
        mv.set(diagonalX);
      });
    }, [scroll, scrollProgress, ribbonMotionValues]);
    
    // Calculate ribbon positions based on process progress with horizontal animation
    const calculateRibbonTransform = (index: number, progress: number) => {
      // Custom delays: Discover starts later, others follow normally
      const delays = [0.15, 0.06, 0.12, 0.18]; // Discover (0) starts much later
      const speeds = [0.5, 0.6, 0.4, 0.7]; // Different speeds for each ribbon
      const delay = delays[index];
      const speed = speeds[index];
      const ribbonProgress = Math.max(0, Math.min(1, (progress - delay) / speed));
      
      // All ribbons horizontal (0 degrees)
      const angle = 0;
      
      // Calculate horizontal movement - start completely offscreen left, end completely offscreen right
      const startX = index === 0 ? -2500 : -1500; // Discover ribbon starts much further off left
      const endX = window.innerWidth + 1000; // End much further off right
      const diagonalX = startX + (ribbonProgress * (endX - startX));
      const diagonalY = 0; // No Y movement for horizontal ribbons
      
      return {
        x: diagonalX,
        y: diagonalY,
        opacity: 1, // Keep ribbons fully visible
        rotate: angle // All horizontal
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
                    
                    // Create repeating text pattern
                    const repeatingText = Array(15).fill(title).join(" • ");
                    
                    // Use motion template with smooth spring for natural release
                    const smoothX = smoothRibbons[index];
                    const transform = useMotionTemplate`translateX(${smoothX}px) translateZ(0)`;
                    
                    return (
                      <motion.div
                        key={title}
                        className={styles.processRibbon}
                        style={{
                          transform
                        }}
                        initial={false}
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
