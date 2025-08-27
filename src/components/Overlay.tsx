import React, {
  forwardRef,
  useCallback,
  useRef,
  memo,
  useMemo,
  useState,
  useEffect,
} from "react";
import { motion, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import Marquee from "react-fast-marquee";
import styles from "../styles/Overlay.module.css";
import { useVideoHover } from "../hooks/useVideoHover";
import { VIDEO_URLS } from "../config/videos";
import { HoverableElement } from "./cursor/HoverableElement";

interface OverlayProps {
  scroll: React.MutableRefObject<number>;
  onVideoChange: (videoNumber: number) => void;
}

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ scroll, onVideoChange }, ref) => {
    const [scrollProgress, setScrollProgress] = useState(0);
    
    // Create motion values with light springs for smooth animation with natural release
    const ribbonX1 = useMotionValue(-1500);
    const ribbonX2 = useMotionValue(-1500);
    const ribbonX3 = useMotionValue(-1500);
    const ribbonX4 = useMotionValue(-1500); // All start at same position
    
    const ribbonMotionValues = useMemo(() => [ribbonX1, ribbonX2, ribbonX3, ribbonX4], [ribbonX1, ribbonX2, ribbonX3, ribbonX4]);
    
    // Create very light springs for natural release after scrolling stops
    const smoothX1 = useSpring(ribbonX1, { damping: 25, stiffness: 300, mass: 0.3 });
    const smoothX2 = useSpring(ribbonX2, { damping: 25, stiffness: 300, mass: 0.3 });
    const smoothX3 = useSpring(ribbonX3, { damping: 25, stiffness: 300, mass: 0.3 });
    const smoothX4 = useSpring(ribbonX4, { damping: 25, stiffness: 300, mass: 0.3 });
    
    const smoothRibbons = useMemo(() => [smoothX1, smoothX2, smoothX3, smoothX4], [smoothX1, smoothX2, smoothX3, smoothX4]);
    
    useEffect(() => {
      // Calculate when we're in the process section - start earlier, end much sooner
      const processStart = 0.35;  // Process section starts at 35% of page
      const processEnd = 0.5;     // Process section ends at 50% of page
      
      const currentProgress = Math.max(0, Math.min(1, 
        (scroll.current - processStart) / (processEnd - processStart)
      ));
      

      
      // Update each ribbon's motion value with their individual progress
      ribbonMotionValues.forEach((mv, index) => {
        const delays = [0.04, 0.03, 0.12, 0.25];
        const speeds = [0.8, .9, 0.5, 0.3]; // More varied speeds: slowest to fastest
        const delay = delays[index];
        const speed = speeds[index];
        const ribbonProgress = Math.max(0, Math.min(1, (currentProgress - delay) / speed));
        
        const startX = -1500; // All ribbons start at the same position
        const endX = window.innerWidth + 3000; // Much further off-screen to ensure complete exit
        const diagonalX = startX + (ribbonProgress * (endX - startX));
        
        mv.set(diagonalX);
      });
    }, [scroll, scrollProgress, ribbonMotionValues]);
    
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

    // Refs for parallax elements
    const oblastTextRef = useRef<HTMLDivElement>(null);

    const lastScrollTime = useRef<number>(0);
    const scrollIndicatorRef = useRef<HTMLDivElement>(null);

    // Staggered scroll-triggered animations
    const updateStaggeredAnimations = useCallback(
      (scrollContainer: HTMLElement) => {
        const scrollTop = scrollContainer.scrollTop;
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const scrollProgress = scrollTop / (scrollHeight - clientHeight);

        // Trigger animations when entering contact section (around 80% scroll)
        if (scrollProgress > 0.8) {
          const contactProgress = Math.min((scrollProgress - 0.8) / 0.2, 1); // Normalize to 0-1

          // Different trigger points for each element to create stagger
          const elements = [
            { ref: oblastTextRef, trigger: 0.6 },
          ];

          elements.forEach(({ ref, trigger }) => {
            if (ref.current) {
              if (contactProgress >= trigger) {
                // Calculate progress for this specific element
                const elementProgress = Math.min(
                  (contactProgress - trigger) / 0.4,
                  1
                );

                // Animate from bottom to final position
                const startY = 50; // Start 50px below
                const currentY = startY * (1 - elementProgress);
                const opacity = elementProgress;

                ref.current.style.transform = `translateY(${currentY}px)`;
                ref.current.style.opacity = opacity.toString();
              } else {
                // Keep hidden until trigger point
                ref.current.style.transform = "translateY(50px)";
                ref.current.style.opacity = "0";
              }
            }
          });
        } else {
          // Reset all elements to initial hidden state
          const allRefs = [oblastTextRef];
          allRefs.forEach((ref) => {
            if (ref.current) {
              ref.current.style.transform = "translateY(50px)";
              ref.current.style.opacity = "0";
            }
          });
        }
      },
      []
    );

    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const now = performance.now();

        // Throttle scroll handling to ~30fps for better performance
        if (now - lastScrollTime.current < 33) {
          return;
        }
        lastScrollTime.current = now;

        const target = e.target as HTMLDivElement;
        const scrollRatio =
          target.scrollTop / (target.scrollHeight - window.innerHeight);
        scroll.current = Math.max(0, Math.min(1, scrollRatio));

        // Update progress line
        setScrollProgress(scroll.current);

        // Update staggered animations
        updateStaggeredAnimations(target);

        // Fade out scroll indicator when scrolling starts
        if (scrollIndicatorRef.current) {
          const opacity = Math.max(0, 1 - scrollRatio * 8); // Fade out faster in first 12.5% of scroll
          scrollIndicatorRef.current.style.opacity = opacity.toString();
        }

      },
      [scroll, updateStaggeredAnimations]
    );

    return (
      <>
        {/* Marquee at top of viewport */}
        <div className={styles.marqueeContainer}>
          <Marquee speed={30} gradient={false}>
            <HoverableElement className={styles.marqueeText}>
              OBLAST STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;OBLAST
              STUDIOS&nbsp;•&nbsp;OBLAST STUDIOS&nbsp;•&nbsp;
            </HoverableElement>
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
              <div className={styles.scrollIndicator} ref={scrollIndicatorRef}>
                <HoverableElement>
                  <span className={styles.scrollText}>scroll down</span>
                </HoverableElement>
                <HoverableElement>
                  <div className={styles.scrollArrow}>
                    <span>↓</span>
                  </div>
                </HoverableElement>
              </div>
            </div>
          </div>
          <div id="what-we-do" style={{ height: "200vh" }}>
            <div className="dot fullwidth">
              <div className={styles.whatWeDoContent}>
                <motion.div
                  className={styles.logoSection}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0, ease: "easeOut" }}
                  viewport={{ once: false, amount: 0.3, margin: "30%" }}
                >
                  <HoverableElement className={styles.logo}>◐◐◐</HoverableElement>
                </motion.div>
                <div className={styles.mainContent}>
                  <div className={styles.brandNameLine}>
                    <HoverableElement>
                      <motion.span
                        className={styles.brandName}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        viewport={{ once: false, amount: 0.3, margin: "40%" }}
                      >
                        OBLAST STUDIO
                      </motion.span>
                    </HoverableElement>
                    <HoverableElement>
                      <motion.div
                        className={styles.servicesPill}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                        viewport={{ once: false, amount: 0.3, margin: "50%" }}
                      >
                        BRANDING, WEB DESIGN, PRODUCT DESIGN, CREATIVE DEVELOPMENT
                      </motion.div>
                    </HoverableElement>
                    <HoverableElement>
                      <motion.span
                        className={styles.fromConcept}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                        viewport={{ once: false, amount: 0.3, margin: "60%" }}
                      >
                        from first concept
                      </motion.span>
                    </HoverableElement>
                  </div>
                  <div className={styles.flowingText}>
                    <HoverableElement text="READ MORE">
                      <span className={styles.mainFlow}>
                        <motion.span
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                          viewport={{ once: false, amount: 0.3, margin: "70%" }}
                          style={{ display: "inline-block" }}
                        >
                          to final build, we handle the details{" "}
                        </motion.span>
                        <motion.span
                          className={styles.arrow}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
                          viewport={{ once: false, amount: 0.3, margin: "70%" }}
                          style={{ display: "inline-block" }}
                        >
                          ⟶{" "}
                        </motion.span>
                        <motion.span
                          className={styles.highlighted}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
                          viewport={{ once: false, amount: 0.3, margin: "70%" }}
                          style={{ display: "inline-block" }}
                        >
                          design, development, and everything ( in between ){" "}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
                          viewport={{ once: false, amount: 0.1, margin: "20%" }}
                          style={{ display: "inline-block" }}
                        >
                          Whether it&apos;s a brand-new product or a smarter evolution
                          of what&apos;s already working, we craft{" "}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
                          viewport={{ once: false, amount: 0.1, margin: "20%" }}
                          style={{ display: "inline-block" }}
                        >
                          digital experiences that are as{" "}
                          <span className={styles.highlighted}>
                            seamless as they are intentional.
                          </span>
                          <motion.div
                            className={styles.blackCircleArrow}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 1.8, ease: "backOut" }}
                            viewport={{ once: false, amount: 0.1, margin: "20%" }}
                            style={{ display: "inline-block" }}
                          >
                            <span className={styles.leftArrow}>←</span>
                          </motion.div>
                        </motion.span>
                      </span>
                    </HoverableElement>
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
              <HoverableElement text="MEET US" as="h1">team</HoverableElement>
              <HoverableElement text="CONTACT" as="p">Kirill Ginko & Sina Hassan</HoverableElement>
              <HoverableElement text="READ MORE">
                <p>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Deleniti esse sequi iste cum dignissimos porro. Nisi veniam
                  necessitatibus impedit minima?
                </p>
              </HoverableElement>
              <HoverableElement text="READ MORE">
                <p>
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Repellat sit magnam nisi temporibus laboriosam, libero tenetur.
                  Voluptatem perspiciatis porro sequi!
                </p>
              </HoverableElement>
              <HoverableElement text="READ MORE">
                <p>
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Repellat sit magnam nisi temporibus laboriosam, libero tenetur.
                  Voluptatem perspiciatis porro sequi!
                </p>
              </HoverableElement>
            </div>
          </div>
          <div id="our-work" style={{ height: "200vh" }}>
            <div className="dot">
              <HoverableElement text="VIEW PORTFOLIO" as="h1">our work</HoverableElement>
              {websiteIds.map((websiteId) => (
                <HoverableElement
                  key={websiteId}
                  text="VIEW PROJECT"
                  className={`${styles.websiteItem} ${
                    activeVideo === websiteId ? styles.websiteItemActive : ""
                  }`}
                  onMouseEnter={() => {
                    handleMouseEnter(websiteId);
                  }}
                  onMouseLeave={() => {
                    handleMouseLeave();
                  }}
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
                </HoverableElement>
              ))}
            </div>
          </div>
          <div id="contact" style={{ height: "200vh", position: "relative" }}>
            <div className="dot">
              {[
                { tag: "h1", text: "contact", className: styles.contactTitle, hoverText: "GET IN TOUCH" },
                {
                  tag: "p",
                  text: "NYC/BALTIMORE",
                  className: styles.contactText,
                  hoverText: "LOCATION"
                },
                {
                  tag: "span",
                  text: "For Work Inquiries",
                  className: styles.contactText,
                  hoverText: "INQUIRE"
                },
                {
                  tag: "p",
                  text: "EMAIL: info@oblast.studio",
                  className: styles.contactText,
                  hoverText: "EMAIL US"
                },
                {
                  tag: "p",
                  text: "SOCIAL: @oblast.studio",
                  className: styles.contactText,
                  hoverText: "FOLLOW US"
                },
                {
                  tag: "p",
                  text: "TEL: +3015154239",
                  className: styles.contactText,
                  hoverText: "CALL US"
                },
              ].map((item, index) => {
                const Component = motion[
                  item.tag as keyof typeof motion
                ] as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                return (
                  <HoverableElement key={index} text={item.hoverText}>
                    <Component
                      className={item.className}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                    >
                      {item.text}
                    </Component>
                  </HoverableElement>
                );
              })}
            </div>
            <div className={styles.oblastContainer}>
              <HoverableElement>
                <motion.div
                  className={styles.contactLabel}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
                  viewport={{ once: false, amount: 0.3 }}
                >
                  <span className={styles.contactLabelText}>Contact</span>
                  <div className={styles.contactArrow}>
                    <span>←</span>
                  </div>
                </motion.div>
              </HoverableElement>
              <motion.div
                className={styles.pillsContainer}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.3 }}
              >
                {["Modern", "Interactive", "Design", "Agency"].map(
                  (text, index) => (
                    <HoverableElement key={text}>
                      <motion.div
                        className={styles.designPill}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.7 + index * 0.1,
                          ease: "easeOut",
                        }}
                        viewport={{ once: false, amount: 0.3 }}
                      >
                        {text}
                      </motion.div>
                    </HoverableElement>
                  )
                )}
              </motion.div>
              <HoverableElement className={styles.oblastText}>
                {"OBLAST".split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                    style={{ display: "inline-block" }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </HoverableElement>
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
