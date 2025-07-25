import React, { forwardRef, useCallback } from "react";

interface OverlayProps {
  caption: React.MutableRefObject<HTMLSpanElement | null>;
  scroll: React.MutableRefObject<number>;
}

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ caption, scroll }, ref) => {
    const handleScroll = useCallback(
      (e) => {
        const scrollRatio =
          e.target.scrollTop / (e.target.scrollHeight - window.innerHeight);
        scroll.current = Math.max(0, Math.min(1, scrollRatio));
        if (caption.current) {
          caption.current.innerText = scroll.current.toFixed(2);
        }
      },
      [scroll, caption]
    );

    return (
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
              Headphones are a pair of small loudspeaker drivers worn on or
              around the head over a user&apos;s ears.
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
          </div>
        </div>
        <div id="our-work" style={{ height: "200vh" }}>
          <div className="dot">
            <h1>our work</h1>
            <p>Website 1</p>
            <p>Website 2</p>
            <p>Website 3</p>
            <p>Website 4</p>
            <p>Website 5</p>
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
    );
  }
);

Overlay.displayName = "Overlay";

export default Overlay;
