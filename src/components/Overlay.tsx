import React, { forwardRef, useCallback, useRef, memo, useMemo } from "react";
import Marquee from "react-fast-marquee";
import styles from "../styles/Overlay.module.css";
import { useVideoHover } from "../hooks/useVideoHover";
import { VIDEO_URLS } from "../config/videos";

interface OverlayProps {
  caption: React.MutableRefObject<HTMLSpanElement | null>;
  scroll: React.MutableRefObject<number>;
  onVideoChange: (videoNumber: number) => void;
}

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ caption, scroll, onVideoChange }, ref) => {
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
      videoPreviewRefs,
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

        // Update caption less frequently for better performance
        if (
          caption.current &&
          Math.floor(now / 100) !== Math.floor((now - 16) / 100)
        ) {
          caption.current.innerText = scroll.current.toFixed(2);
        }
      },
      [scroll, caption]
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

        {/* Global video previews container */}
        <div
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
        </div>

        <div ref={ref} onScroll={handleScroll} className="scroll">
          <div id="home" style={{ height: "200vh" }}>
            <div className="dot">
              {/* <h1>home</h1> */}
              {/* Virtual reality (VR) is a simulated experience that can be similar to or completely different from the real world. */}
            </div>
          </div>
          <div id="what-we-do" style={{ height: "200vh" }}>
            <div className="dot">
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
                      . Whether it's a brand-new product or a smarter evolution
                      of what's already working, we craft digital experiences
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
              {websiteIds.map((websiteId) => (
                <div
                  key={websiteId}
                  onMouseEnter={(e) => {
                    handleMouseEnter(websiteId, e.currentTarget);
                  }}
                  onMouseLeave={(e) => {
                    handleMouseLeave(websiteId, e.currentTarget, e);
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
          <span className="caption" ref={caption}>
            0.00
          </span>
        </div>
      </>
    );
  }
);

Overlay.displayName = "Overlay";

// Memoize the component to prevent unnecessary re-renders
export default memo(Overlay, (prevProps, nextProps) => {
  return (
    prevProps.caption === nextProps.caption &&
    prevProps.scroll === nextProps.scroll &&
    prevProps.onVideoChange === nextProps.onVideoChange
  );
});
