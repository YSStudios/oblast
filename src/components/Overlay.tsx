import React, { forwardRef, useCallback } from "react";
import styles from "../styles/Overlay.module.css";
import { useVideoHover } from "../hooks/useVideoHover";

interface OverlayProps {
  caption: React.MutableRefObject<HTMLSpanElement | null>;
  scroll: React.MutableRefObject<number>;
  onVideoChange: (videoNumber: number) => void;
}

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ caption, scroll, onVideoChange }, ref) => {
    // Video URLs
    const videoUrls = [
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1753309009/Screen_Recording_2025-07-23_at_18.12.55_udrdbl.mp4",
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752459835/Screen_Recording_2025-07-13_at_22.20.14_online-video-cutter.com_zkcoxt.mp4",
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752459122/Screen_Recording_2025-07-13_at_21.35.19_online-video-cutter.com_1_mb4ccx.mp4",
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752458519/output_1_online-video-cutter.com_vkwiy7.mp4",
      "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752458440/Screen_Recording_2025-07-13_at_21.48.28_online-video-cutter.com_uvx0xa.mp4",
    ];

    // Use the custom hook
    const {
      activeVideo,
      hoveredItem,
      videoPreviewRefs,
      handleMouseEnter,
      handleMouseLeave,
    } = useVideoHover({ videoUrls, onVideoChange });


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
          className={`${styles.pillButton} ${isVisible ? styles.pillButtonVisible : ""}`}
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

    return (
      <>
        {/* Global video previews container */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
          {[1, 2, 3, 4, 5].map((websiteId) => (
            <div
              key={websiteId}
              ref={(el) => (videoPreviewRefs.current[websiteId] = el)}
              className={styles.videoPreview}
            >
              <video
                src={videoUrls[websiteId - 1]}
                crossOrigin="anonymous"
                loop
                muted
                playsInline
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
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Neque
              officiis voluptatibus voluptatem minima beatae doloremque, culpa
              quas laboriosam provident a numquam. Ex iusto dolorum perspiciatis
              modi, architecto commodi aperiam tempora, repellat debitis
              delectus ullam minus ipsa laboriosam suscipit vero cupiditate
              pariatur harum quasi laborum. Fugit aut enim iure excepturi ad?
              Nostrum odit blanditiis placeat delectus veritatis aliquid magnam,
              quos at.
            </p>
          </div>
        </div>
        <div id="our-process" style={{ height: "200vh" }}>
          <div className="dot">
            <h1>our process</h1>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quisquam
              esse optio dolorum maiores eos quod, rem voluptas. Praesentium
              tempora quod laudantium! Excepturi cumque dolore sapiente
              consequuntur nostrum aliquam voluptatibus qui! Quae minus nostrum
              nam cumque quam aut deleniti debitis ipsam dolor fugiat. Iure
              assumenda, dolore minus praesentium recusandae architecto esse
              laudantium nemo magni sed, rerum nam ut tenetur placeat cum.
            </p>
          </div>
        </div>
        <div id="team" style={{ height: "200vh" }}>
          <div className="dot">
            <h1>team</h1>
            <p>Kirill Ginko & Sina Hassan</p>
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Deleniti
              esse sequi iste cum dignissimos porro. Nisi veniam necessitatibus
              impedit minima?
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellat
              sit magnam nisi temporibus laboriosam, libero tenetur. Voluptatem
              perspiciatis porro sequi!
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellat
              sit magnam nisi temporibus laboriosam, libero tenetur. Voluptatem
              perspiciatis porro sequi!
            </p>
          </div>
        </div>
        <div id="our-work" style={{ height: "200vh" }}>
          <div className="dot">
            <h1>our work</h1>
            {[1, 2, 3, 4, 5].map((websiteId) => (
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

export default Overlay;
