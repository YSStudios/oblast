import React, { forwardRef, useCallback, useState } from "react";

// CSS styles as a string
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
  }

  .website-item-interactive {
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
`;

interface OverlayProps {
  caption: React.MutableRefObject<HTMLSpanElement | null>;
  scroll: React.MutableRefObject<number>;
  onVideoChange: (videoNumber: number) => void;
}

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ caption, scroll, onVideoChange }, ref) => {
    const [activeVideo, setActiveVideo] = useState(1); // Track which video is active
    const [hoveredItem, setHoveredItem] = useState<number | null>(null); // Track hovered item
    
    const handleVideoChange = useCallback((videoNumber: number) => {
      setActiveVideo(videoNumber);
      onVideoChange(videoNumber);
    }, [onVideoChange]);

    // Corner bracket component
    const CornerBrackets = ({ isActive, isHovered }: { isActive: boolean, isHovered: boolean }) => {
      const isVisible = isActive || isHovered;
      return (
        <>
          <div className={`corner-bracket corner-bracket-tl ${isVisible ? 'corner-bracket-tl-visible' : ''}`} />
          <div className={`corner-bracket corner-bracket-tr ${isVisible ? 'corner-bracket-tr-visible' : ''}`} />
          <div className={`corner-bracket corner-bracket-bl ${isVisible ? 'corner-bracket-bl-visible' : ''}`} />
          <div className={`corner-bracket corner-bracket-br ${isVisible ? 'corner-bracket-br-visible' : ''}`} />
        </>
      );
    };

    // Sliding text component with proper slide out/in effect
    const SlidingText = ({ 
      children, 
      isActive, 
      isHovered 
    }: { 
      children: React.ReactNode;
      isActive: boolean;
      isHovered: boolean;
    }) => {
      const isActiveState = isActive || isHovered;
      
      return (
        <div className="sliding-text-container">
          <span className={`sliding-text-base ${isActiveState ? 'sliding-text-base-hidden' : ''}`}>
            {children}
          </span>
          <span className={`sliding-text-active ${isActiveState ? 'sliding-text-active-visible' : ''}`}>
            {children}
          </span>
        </div>
      );
    };

    // Pill button component
    const PillButton = ({ isActive, isHovered }: { isActive: boolean; isHovered: boolean }) => {
      const isVisible = isActive || isHovered;
      return (
        <div className={`pill-button ${isVisible ? 'pill-button-visible' : ''}`}>
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
        <style>{overlayStyles}</style>
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
            <div
              onMouseEnter={() => {
                handleVideoChange(1);
                setHoveredItem(1);
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={`website-item website-item-interactive ${activeVideo === 1 ? 'website-item-active' : ''}`}
            >
              <CornerBrackets isActive={activeVideo === 1} isHovered={hoveredItem === 1} />
              <SlidingText isActive={activeVideo === 1} isHovered={hoveredItem === 1}>
                Website 1
              </SlidingText>
              <PillButton isActive={activeVideo === 1} isHovered={hoveredItem === 1} />
            </div>
            <div
              onMouseEnter={() => {
                handleVideoChange(2);
                setHoveredItem(2);
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={`website-item website-item-interactive ${activeVideo === 2 ? 'website-item-active' : ''}`}
            >
              <CornerBrackets isActive={activeVideo === 2} isHovered={hoveredItem === 2} />
              <SlidingText isActive={activeVideo === 2} isHovered={hoveredItem === 2}>
                Website 2
              </SlidingText>
              <PillButton isActive={activeVideo === 2} isHovered={hoveredItem === 2} />
            </div>
            <div
              onMouseEnter={() => {
                handleVideoChange(3);
                setHoveredItem(3);
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={`website-item website-item-interactive ${activeVideo === 3 ? 'website-item-active' : ''}`}
            >
              <CornerBrackets isActive={activeVideo === 3} isHovered={hoveredItem === 3} />
              <SlidingText isActive={activeVideo === 3} isHovered={hoveredItem === 3}>
                Website 3
              </SlidingText>
              <PillButton isActive={activeVideo === 3} isHovered={hoveredItem === 3} />
            </div>
            <div className="website-item">
              <CornerBrackets isActive={false} isHovered={false} />
              <SlidingText isActive={false} isHovered={false}>
                Website 4
              </SlidingText>
              <PillButton isActive={false} isHovered={false} />
            </div>
            <div className="website-item">
              <CornerBrackets isActive={false} isHovered={false} />
              <SlidingText isActive={false} isHovered={false}>
                Website 5
              </SlidingText>
              <PillButton isActive={false} isHovered={false} />
            </div>
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
